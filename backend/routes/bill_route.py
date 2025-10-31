from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from extensions import db
from models.tenants_model import Tenant
from models.users_model import User
from models.units_model import House as Unit
from models.contracts_model import Contract
from models.bills_model import Bill
from models.notifications_model import Notification  # Add this import
from werkzeug.utils import secure_filename
import os

bill_bp = Blueprint("bill_bp", __name__)

# ✅ Allowed file extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# -------------------------------
# 📘 Get all bills (for admin)
# -------------------------------
@bill_bp.route("/billing/bills", methods=["GET"])
def get_bills():
    bills = (
        db.session.query(
            Bill.billid,
            Tenant.tenantid,
            User.firstname,
            User.middlename,
            User.lastname,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Bill.issuedate,
            Bill.duedate,
            Bill.amount,
            Bill.billtype,
            Bill.status,
            Bill.description,
            Bill.paymenttype,
            Bill.gcash_ref,
            Bill.gcash_receipt
        )
        .join(Tenant, Bill.tenantid == Tenant.tenantid)
        .join(User, Tenant.userid == User.userid)
        .join(Contract, Contract.tenantid == Tenant.tenantid)
        .join(Unit, Unit.unitid == Contract.unitid)
        .all()
    )

    result = []
    for b in bills:
        result.append({
            "billid": b.billid,
            "tenantid": b.tenantid,
            "tenant_name": f"{b.firstname} {b.middlename + ' ' if b.middlename else ''}{b.lastname}",
            "unit_name": b.unit_name,
            "unit_price": b.unit_price,
            "issuedate": b.issuedate,
            "duedate": b.duedate,
            "amount": b.amount,
            "billtype": b.billtype,
            "status": b.status,
            "description": b.description,
            "paymenttype": b.paymenttype,
            "GCash_Ref": b.gcash_ref,
            "GCash_receipt": b.gcash_receipt
        })

    return jsonify(result)


# -------------------------------
# 🧾 Create a new tenant bill
# -------------------------------
@bill_bp.route("/billing/create", methods=["POST"])
def create_bill():
    data = request.get_json()
    tenantid = data.get("tenantId")
    issuedate = data.get("issueDate", datetime.now().date())
    duedate = data.get("dueDate")
    amount = data.get("amount")
    billtype = data.get("billType")
    status = data.get("status", "Unpaid")
    description = data.get("description")

    if not tenantid or not amount or not billtype:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_bill = Bill(
            tenantid=tenantid,
            issuedate=issuedate,
            duedate=duedate,
            amount=amount,
            billtype=billtype,
            status=status,
            description=description
        )
        db.session.add(new_bill)
        db.session.flush()  # Get bill ID without committing

        contract = Contract.query.filter_by(tenantid=tenantid).first()
        if contract:
            new_bill.contractid = contract.contractid

        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=tenantid).first()
        if tenant:
            tenant_notification = Notification(
                userid=tenant.userid,
                userrole='tenant',
                title='New Bill Issued',
                message=f'New {billtype} bill for ₱{amount:,.2f} has been issued. Due date: {duedate}',
                creationdate=datetime.utcnow()
            )
            db.session.add(tenant_notification)

        db.session.commit()
        return jsonify({"message": "Bill created successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating bill:", e)
        return jsonify({"error": "Failed to create bill"}), 500


# -------------------------------
# 📋 Get Paid Bills for Payment History
# -------------------------------
@bill_bp.route("/bills/paid/<int:tenant_id>", methods=["GET"])
def get_paid_bills(tenant_id):
    try:
        print(f"🔹 Fetching paid bills for tenant {tenant_id}")
        
        # Query only paid bills for the specific tenant
        paid_bills = (
            db.session.query(
                Bill.billid,
                Bill.tenantid,
                Bill.billtype,
                Bill.amount,
                Bill.status,
                Bill.issuedate,
                Bill.duedate,
                Bill.paymenttype,
                Bill.gcash_ref,
                Bill.description
            )
            .filter(
                Bill.tenantid == tenant_id,
                Bill.status.in_(["PAID", "For Validation", "Completed"])  # Include various paid statuses
            )
            .order_by(Bill.issuedate.desc())
            .all()
        )

        bills_list = []
        for bill in paid_bills:
            # Format the date for display
            issue_date = (
                bill.issuedate.strftime("%Y-%m-%d")
                if hasattr(bill.issuedate, "strftime")
                else str(bill.issuedate)
            )
            
            bills_list.append({
                "id": bill.billid,
                "billType": bill.billtype,
                "status": bill.status,
                "date": issue_date,
                "amount": f"P{bill.amount:,.2f}",  # Format as currency
                "paymentType": bill.paymenttype,
                "gcashRef": bill.gcash_ref,
                "description": bill.description,
                "dueDate": bill.duedate.strftime("%Y-%m-%d") if bill.duedate and hasattr(bill.duedate, "strftime") else None
            })

        print(f"✅ Returning {len(bills_list)} paid bills for tenant {tenant_id}")
        return jsonify(bills_list), 200

    except Exception as e:
        print(f"❌ Error fetching paid bills for tenant {tenant_id}: {e}")
        return jsonify({"error": f"Failed to fetch paid bills: {str(e)}"}), 500


@bill_bp.route("/billing/create-tenant-invoice", methods=["POST"])
def create_tenant_bill():
    data = request.get_json()
    tenantid = data.get("tenantId")
    issuedate = data.get("issuedDate", datetime.now().date())
    duedate = data.get("dueDate")
    amount = data.get("amount")
    billtype = data.get("billType")
    status = data.get("status", "Unpaid")
    description = data.get("description")

    if not tenantid or not amount or not billtype:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # First, get the contract for this tenant
        contract = Contract.query.filter_by(tenantid=tenantid).first()
        if not contract:
            return jsonify({"error": "No contract found for this tenant"}), 400

        # Create the bill with contractid
        new_bill = Bill(
            tenantid=tenantid,
            contractid=contract.contractid,  # Add contractid here
            issuedate=issuedate,
            duedate=duedate,
            amount=amount,
            billtype=billtype,
            status=status,
            description=description
        )
        db.session.add(new_bill)
        db.session.flush()  # Get bill ID without committing

        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=tenantid).first()
        if tenant:
            tenant_notification = Notification(
                userid=tenant.userid,
                userrole='tenant',
                title='New Invoice Created',
                message=f'New {billtype} invoice for ₱{amount:,.2f} has been created. Due date: {duedate}',
                creationdate=datetime.utcnow()
            )
            db.session.add(tenant_notification)

        db.session.commit()

        return jsonify({
            "message": "Bill created successfully!",
            "billid": new_bill.billid,
            "contractid": contract.contractid
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating bill:", e)
        return jsonify({"error": "Failed to create bill"}), 500


# -------------------------------
# 📄 Get bills by tenant
# -------------------------------
@bill_bp.route("/bills/<tenant_id>", methods=["GET"])
def get_tenant_bills(tenant_id):
    try:
        tenant_id_int = int(tenant_id)
        bills = Bill.query.filter_by(tenantid=tenant_id_int).all()

        bills_list = []
        for bill in bills:
            bills_list.append({
                "billid": bill.billid,
                "contractid": bill.contractid,
                "tenantid": bill.tenantid,
                "issuedate": (
                    bill.issuedate.strftime("%Y-%m-%d")
                    if hasattr(bill.issuedate, "strftime")
                    else bill.issuedate
                ),
                "duedate": (
                    bill.duedate.strftime("%Y-%m-%d")
                    if hasattr(bill.duedate, "strftime")
                    else bill.duedate
                ),
                "amount": float(bill.amount),
                "billtype": bill.billtype,
                "status": bill.status,
                "description": bill.description,
                "paymenttype": bill.paymenttype,
                "gcash_ref": bill.gcash_ref,
                "gcash_receipt": bill.gcash_receipt,
            })

        print(f"✅ Returning {len(bills_list)} bills for tenant {tenant_id_int}")
        return jsonify(bills_list), 200

    except Exception as e:
        print("❌ Error fetching tenant bills:", e)
        return jsonify({"error": str(e)}), 500


# -------------------------------
# 💸 Pay Bill (GCash / Cash)
# -------------------------------
@bill_bp.route("/bills/pay/<int:bill_id>", methods=["PUT"])
def pay_bill(bill_id):
    try:
        print(f"🔹 Received request to pay bill {bill_id}")
        bill = Bill.query.get(bill_id)

        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        payment_type = request.form.get("paymentType")
        gcash_ref = request.form.get("gcashRef")
        file = request.files.get("gcashReceipt")

        # ✅ Handle Cash payment
        if payment_type == "Cash":
            bill.paymenttype = "Cash"
            bill.gcash_ref = None
            bill.gcash_receipt = None

        # ✅ Handle GCash payment with file upload
        else:
            bill.paymenttype = "GCash"
            bill.gcash_ref = gcash_ref

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)

                # Save to uploads/gcash_receipts folder
                gcash_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "gcash_receipts")
                os.makedirs(gcash_folder, exist_ok=True)

                save_path = os.path.join(gcash_folder, filename)
                file.save(save_path)

                bill.gcash_receipt = filename
            else:
                return jsonify({"error": "Invalid or missing GCash receipt file"}), 400

        # ✅ Update bill status
        bill.status = "For Validation"
        
        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=bill.tenantid).first()
        if tenant:
            tenant_notification = Notification(
                userid=tenant.userid,
                userrole='tenant',
                title='Payment Submitted',
                message=f'Your payment for bill #{bill_id} has been submitted and is awaiting validation.',
                creationdate=datetime.utcnow()
            )
            db.session.add(tenant_notification)

        # ✅ Create notification for ALL landlords
        all_landlords = User.query.filter_by(role='Owner').all()
        for landlord in all_landlords:
            landlord_notification = Notification(
                userid=landlord.userid,
                userrole='landlord',
                title='New Payment Submitted',
                message=f'Tenant has submitted a payment for bill #{bill_id}. Status: For Validation',
                creationdate=datetime.utcnow()
            )
            db.session.add(landlord_notification)

        db.session.commit()

        return jsonify({"message": "Bill marked as 'For Validation' successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating bill payment: {e}")
        return jsonify({"error": f"Failed to update bill payment: {str(e)}"}), 500


# -------------------------------
# ✅ Approve/Validate Bill Payment
# -------------------------------
@bill_bp.route("/bills/approve/<int:bill_id>", methods=["PUT"])
def approve_bill_payment(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        # Update bill status to PAID
        bill.status = "PAID"
        
        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=bill.tenantid).first()
        if tenant:
            tenant_notification = Notification(
                userid=tenant.userid,
                userrole='tenant',
                title='Payment Approved',
                message=f'Your payment for bill #{bill_id} has been approved. Thank you!',
                creationdate=datetime.utcnow()
            )
            db.session.add(tenant_notification)

        db.session.commit()

        return jsonify({"message": "Payment approved successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error approving payment: {e}")
        return jsonify({"error": f"Failed to approve payment: {str(e)}"}), 500


# -------------------------------
# ❌ Reject Bill Payment
# -------------------------------
@bill_bp.route("/bills/reject/<int:bill_id>", methods=["PUT"])
def reject_bill_payment(bill_id):
    try:
        data = request.get_json()
        reason = data.get("reason", "Payment verification failed")
        
        bill = Bill.query.get(bill_id)
        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        # Update bill status back to Unpaid
        bill.status = "Unpaid"
        bill.paymenttype = None
        bill.gcash_ref = None
        
        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=bill.tenantid).first()
        if tenant:
            tenant_notification = Notification(
                userid=tenant.userid,
                userrole='tenant',
                title='Payment Rejected',
                message=f'Your payment for bill #{bill_id} was rejected. Reason: {reason}. Please try again.',
                creationdate=datetime.utcnow()
            )
            db.session.add(tenant_notification)

        db.session.commit()

        return jsonify({"message": "Payment rejected successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error rejecting payment: {e}")
        return jsonify({"error": f"Failed to reject payment: {str(e)}"}), 500