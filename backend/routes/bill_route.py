from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from extensions import db
from models.tenants_model import Tenant
from models.users_model import User
from models.units_model import House as Unit
from models.contracts_model import Contract
from models.bills_model import Bill
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
        db.session.commit()

        contract = Contract.query.filter_by(tenantid=tenantid).first()
        if contract:
            new_bill.contractid = contract.contractid
            db.session.commit()

        return jsonify({"message": "Bill created successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating bill:", e)
        return jsonify({"error": "Failed to create bill"}), 500
    
    

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
        db.session.commit()

        return jsonify({"message": "Bill marked as 'For Validation' successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating bill payment: {e}")
        return jsonify({"error": f"Failed to update bill payment: {str(e)}"}), 500

    finally:
        db.session.close()
