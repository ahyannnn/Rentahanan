from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from extensions import db
from models.tenants_model import Tenant
from models.users_model import User
from models.units_model import House as Unit
from models.contracts_model import Contract
from models.bills_model import Bill
from models.notifications_model import Notification
from werkzeug.utils import secure_filename
import os
import logging

bill_bp = Blueprint("bill_bp", __name__)

# ✅ Set up logging
logger = logging.getLogger(__name__)

# ✅ Allowed file extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def safe_isoformat(date_obj):
    """Safely convert date/datetime object to ISO format string"""
    if date_obj is None:
        return None
    if hasattr(date_obj, 'isoformat'):
        return date_obj.isoformat()
    # If it's already a string, return as-is
    return str(date_obj)

def safe_strftime(date_obj, format_str="%Y-%m-%d"):
    """Safely format date/datetime object to string"""
    if date_obj is None:
        return None
    if hasattr(date_obj, 'strftime'):
        return date_obj.strftime(format_str)
    # If it's already a string, return as-is
    return str(date_obj)

# -------------------------------
# 📘 Get all bills (for admin)
# -------------------------------
@bill_bp.route("/billing/bills", methods=["GET"])
def get_bills():
    try:
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
                "issuedate": safe_isoformat(b.issuedate),
                "duedate": safe_isoformat(b.duedate),
                "amount": float(b.amount) if b.amount else 0,
                "billtype": b.billtype,
                "status": b.status,
                "description": b.description,
                "paymenttype": b.paymenttype,
                "GCash_Ref": b.gcash_ref,
                "GCash_receipt": b.gcash_receipt
            })

        logger.info(f"✅ Retrieved {len(result)} bills")
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"❌ Error retrieving bills: {e}")
        return jsonify({"error": "Failed to retrieve bills"}), 500


# -------------------------------
# 🧾 Create a new bill (for both tenants and applicants)
# -------------------------------
@bill_bp.route("/billing/create", methods=["POST"])
def create_bill():
    data = request.get_json()
    tenantid = data.get("tenantId")
    issuedate = data.get("issuedDate", datetime.now().date())
    duedate = data.get("dueDate")
    amount = data.get("amount")
    billtype = data.get("billType")
    status = data.get("status", "Unpaid")
    description = data.get("description")

    if not tenantid or not amount or not billtype:
        return jsonify({"error": "Missing required fields: tenantId, amount, and billType are required"}), 400

    try:
        # Validate and parse dates
        if issuedate:
            if isinstance(issuedate, str):
                issuedate = datetime.strptime(issuedate, "%Y-%m-%d").date()
        else:
            issuedate = datetime.now().date()
            
        if duedate and isinstance(duedate, str):
            duedate = datetime.strptime(duedate, "%Y-%m-%d").date()

        # Find contract if exists
        contract = Contract.query.filter_by(tenantid=tenantid).first()
        contractid = contract.contractid if contract else None

        # Create new bill
        new_bill = Bill(
            tenantid=tenantid,
            contractid=contractid,
            issuedate=issuedate,
            duedate=duedate,
            amount=amount,
            billtype=billtype,
            status=status,
            description=description
        )
        db.session.add(new_bill)
        db.session.flush()

        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=tenantid).first()
        if tenant:
            formatted_amount = f"₱{float(amount):,.2f}"
            due_date_str = safe_strftime(duedate) if duedate else "Not specified"
            
            tenant_notification = Notification(
                title='New Bill Issued',
                message=f'New {billtype} bill for {formatted_amount} has been issued. Due date: {due_date_str}',
                targetuserid=tenant.userid,
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

        db.session.commit()
        
        logger.info(f"✅ Bill created successfully: ID {new_bill.billid} for tenant {tenantid}")
        
        return jsonify({
            "message": "Bill created successfully!",
            "billid": new_bill.billid,
        }), 201

    except ValueError as e:
        logger.error(f"❌ Date format error: {e}")
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error creating bill: {e}")
        return jsonify({"error": "Failed to create bill"}), 500


# -------------------------------
# 📋 Get Paid Bills for Payment History
# -------------------------------
@bill_bp.route("/bills/paid/<int:tenant_id>", methods=["GET"])
def get_paid_bills(tenant_id):
    try:
        logger.info(f"🔹 Fetching paid bills for tenant {tenant_id}")
        
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
                Bill.status.in_(["PAID", "For Validation", "Completed"])
            )
            .order_by(Bill.issuedate.desc())
            .all()
        )

        bills_list = []
        for bill in paid_bills:
            # Format dates for display using safe functions
            issue_date = safe_strftime(bill.issuedate)
            due_date = safe_strftime(bill.duedate)
            
            bills_list.append({
                "id": bill.billid,
                "billType": bill.billtype,
                "status": bill.status,
                "date": issue_date,
                "amount": f"₱{float(bill.amount):,.2f}",
                "paymentType": bill.paymenttype,
                "gcashRef": bill.gcash_ref,
                "description": bill.description,
                "dueDate": due_date
            })

        logger.info(f"✅ Returning {len(bills_list)} paid bills for tenant {tenant_id}")
        return jsonify(bills_list), 200

    except Exception as e:
        logger.error(f"❌ Error fetching paid bills for tenant {tenant_id}: {e}")
        return jsonify({"error": f"Failed to fetch paid bills: {str(e)}"}), 500


# -------------------------------
# 📋 Get issued invoices for applicants (to filter already billed applicants)
# -------------------------------
@bill_bp.route("/billing/issued-applicant-invoices", methods=["GET"])
def get_issued_applicant_invoices():
    try:
        # Query bills that are for applicants (initial payments)
        applicant_bills = (
            db.session.query(
                Bill.billid,
                Bill.tenantid,
                Bill.billtype,
                Bill.amount,
                Bill.status,
                Bill.issuedate,
                Bill.duedate,
                Bill.description
            )
            .filter(
                Bill.billtype.in_([
                    "Security Deposit & Advance Payment", 
                    "Advance Rent Only", 
                    "Security Deposit Only"
                ])
            )
            .all()
        )

        result = []
        for bill in applicant_bills:
            result.append({
                "billid": bill.billid,
                "tenantId": bill.tenantid,
                "billtype": bill.billtype,
                "amount": float(bill.amount) if bill.amount else 0,
                "status": bill.status,
                "issuedate": safe_isoformat(bill.issuedate),
                "duedate": safe_isoformat(bill.duedate),
                "description": bill.description
            })

        logger.info(f"✅ Returning {len(result)} issued applicant invoices")
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"❌ Error fetching issued applicant invoices: {e}")
        return jsonify({"error": f"Failed to fetch issued applicant invoices: {str(e)}"}), 500


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
                "issuedate": safe_isoformat(bill.issuedate),
                "duedate": safe_isoformat(bill.duedate),
                "amount": float(bill.amount) if bill.amount else 0,
                "billtype": bill.billtype,
                "status": bill.status,
                "description": bill.description,
                "paymenttype": bill.paymenttype,
                "gcash_ref": bill.gcash_ref,
                "gcash_receipt": bill.gcash_receipt,
            })

        logger.info(f"✅ Returning {len(bills_list)} bills for tenant {tenant_id_int}")
        return jsonify(bills_list), 200

    except ValueError:
        return jsonify({"error": "Invalid tenant ID"}), 400
    except Exception as e:
        logger.error(f"❌ Error fetching tenant bills: {e}")
        return jsonify({"error": str(e)}), 500


# -------------------------------
# 💸 Pay Bill (GCash / Cash)
# -------------------------------
@bill_bp.route("/bills/pay/<int:bill_id>", methods=["PUT"])
def pay_bill(bill_id):
    try:
        logger.info(f"🔹 Received request to pay bill {bill_id}")
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
            logger.info(f"💰 Cash payment for bill {bill_id}")

        # ✅ Handle GCash payment with file upload
        elif payment_type == "GCash":
            bill.paymenttype = "GCash"
            bill.gcash_ref = gcash_ref

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to avoid filename conflicts
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{filename}"

                # Save to uploads/gcash_receipts folder
                gcash_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "gcash_receipts")
                os.makedirs(gcash_folder, exist_ok=True)

                save_path = os.path.join(gcash_folder, filename)
                file.save(save_path)

                bill.gcash_receipt = filename
                logger.info(f"📄 GCash receipt saved: {filename}")
            else:
                return jsonify({"error": "Invalid or missing GCash receipt file"}), 400

        else:
            return jsonify({"error": "Invalid payment type"}), 400

        # ✅ Update bill status
        bill.status = "For Validation"
        
        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=bill.tenantid).first()
        if tenant:
            tenant_notification = Notification(
                title='Payment Submitted',
                message=f'Your payment for bill #{bill_id} has been submitted and is awaiting validation.',
                targetuserid=tenant.userid,
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

        # ✅ Create notification for ALL landlords
        all_landlords = User.query.filter_by(role='Owner').all()
        if all_landlords:
            landlord_notification = Notification(
                title='New Payment Submitted',
                message=f'Tenant has submitted a payment for bill #{bill_id}. Status: For Validation',
                targetuserrole='Owner',
                isgroupnotification=True,
                recipientcount=len(all_landlords),
                createdbyuserid=tenant.userid if tenant else None
            )
            db.session.add(landlord_notification)

        db.session.commit()
        logger.info(f"✅ Bill {bill_id} marked as 'For Validation'")

        return jsonify({"message": "Bill marked as 'For Validation' successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error updating bill payment: {e}")
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
                title='Payment Approved',
                message=f'Your payment for bill #{bill_id} has been approved. Thank you!',
                targetuserid=tenant.userid,
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

        db.session.commit()
        logger.info(f"✅ Payment approved for bill {bill_id}")

        return jsonify({"message": "Payment approved successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error approving payment: {e}")
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

        # Update bill status back to Unpaid and clear payment info
        bill.status = "Unpaid"
        bill.paymenttype = None
        bill.gcash_ref = None
        bill.gcash_receipt = None
        
        # ✅ Create notification for tenant
        tenant = Tenant.query.filter_by(tenantid=bill.tenantid).first()
        if tenant:
            tenant_notification = Notification(
                title='Payment Rejected',
                message=f'Your payment for bill #{bill_id} was rejected. Reason: {reason}. Please try again.',
                targetuserid=tenant.userid,
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

        db.session.commit()
        logger.info(f"❌ Payment rejected for bill {bill_id}. Reason: {reason}")

        return jsonify({"message": "Payment rejected successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error rejecting payment: {e}")
        return jsonify({"error": f"Failed to reject payment: {str(e)}"}), 500


# -------------------------------
# 📝 Update bill details
# -------------------------------
@bill_bp.route("/bills/<int:bill_id>", methods=["PUT"])
def update_bill(bill_id):
    try:
        data = request.get_json()
        bill = Bill.query.get(bill_id)
        
        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        # Prevent modification of paid bills
        if bill.status in ["PAID", "For Validation"]:
            return jsonify({"error": "Cannot modify paid or pending validation bills"}), 400

        # Update allowed fields
        updatable_fields = ['amount', 'billtype', 'duedate', 'description', 'status']
        updated_fields = []
        
        for field in updatable_fields:
            if field in data and data[field] is not None:
                # Handle date fields
                if field == 'duedate' and isinstance(data[field], str):
                    try:
                        setattr(bill, field, datetime.strptime(data[field], "%Y-%m-%d").date())
                        updated_fields.append(field)
                    except ValueError:
                        return jsonify({"error": "Invalid date format for due date. Use YYYY-MM-DD"}), 400
                else:
                    setattr(bill, field, data[field])
                    updated_fields.append(field)

        db.session.commit()
        logger.info(f"✅ Bill {bill_id} updated. Fields: {', '.join(updated_fields)}")
        
        return jsonify({
            "message": "Bill updated successfully",
            "updated_fields": updated_fields
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error updating bill {bill_id}: {e}")
        return jsonify({"error": f"Failed to update bill: {str(e)}"}), 500


# -------------------------------
# 🗑️ Delete bill
# -------------------------------
@bill_bp.route("/bills/<int:bill_id>", methods=["DELETE"])
def delete_bill(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        
        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        # Prevent deletion of paid or pending bills
        if bill.status in ["PAID", "For Validation"]:
            return jsonify({"error": "Cannot delete paid or pending validation bills"}), 400

        db.session.delete(bill)
        db.session.commit()
        
        logger.info(f"🗑️ Bill {bill_id} deleted successfully")
        
        return jsonify({"message": "Bill deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error deleting bill {bill_id}: {e}")
        return jsonify({"error": f"Failed to delete bill: {str(e)}"}), 500


# -------------------------------
# 📊 Get billing statistics
# -------------------------------
@bill_bp.route("/billing/statistics", methods=["GET"])
def get_billing_statistics():
    try:
        # Total bills count
        total_bills = Bill.query.count()
        
        # Bills by status
        status_counts = db.session.query(
            Bill.status, 
            db.func.count(Bill.billid)
        ).group_by(Bill.status).all()
        
        # Total revenue from paid bills
        total_revenue = db.session.query(
            db.func.sum(Bill.amount)
        ).filter(Bill.status == 'PAID').scalar() or 0
        
        # Monthly revenue (current year)
        current_year = datetime.now().year
        monthly_revenue = db.session.query(
            db.func.extract('month', Bill.issuedate).label('month'),
            db.func.sum(Bill.amount).label('total')
        ).filter(
            Bill.status == 'PAID',
            db.func.extract('year', Bill.issuedate) == current_year
        ).group_by('month').all()

        statistics = {
            "total_bills": total_bills,
            "status_breakdown": {status: count for status, count in status_counts},
            "total_revenue": float(total_revenue),
            "monthly_revenue": {int(month): float(total) for month, total in monthly_revenue},
            "current_year": current_year
        }

        logger.info("📊 Billing statistics retrieved successfully")
        return jsonify(statistics), 200

    except Exception as e:
        logger.error(f"❌ Error retrieving billing statistics: {e}")
        return jsonify({"error": f"Failed to retrieve billing statistics: {str(e)}"}), 500


# -------------------------------
# 🔍 Search bills with filters
# -------------------------------
@bill_bp.route("/billing/search", methods=["GET"])
def search_bills():
    try:
        # Get query parameters
        tenant_id = request.args.get('tenant_id', type=int)
        status = request.args.get('status')
        bill_type = request.args.get('bill_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Build query
        query = Bill.query
        
        if tenant_id:
            query = query.filter(Bill.tenantid == tenant_id)
        if status:
            query = query.filter(Bill.status == status)
        if bill_type:
            query = query.filter(Bill.billtype == bill_type)
        if start_date:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Bill.issuedate >= start_date)
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Bill.issuedate <= end_date)

        bills = query.order_by(Bill.issuedate.desc()).all()

        result = []
        for bill in bills:
            result.append({
                "billid": bill.billid,
                "tenantid": bill.tenantid,
                "issuedate": safe_isoformat(bill.issuedate),
                "duedate": safe_isoformat(bill.duedate),
                "amount": float(bill.amount) if bill.amount else 0,
                "billtype": bill.billtype,
                "status": bill.status,
                "description": bill.description,
                "paymenttype": bill.paymenttype
            })

        logger.info(f"🔍 Search returned {len(result)} bills")
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    except Exception as e:
        logger.error(f"❌ Error searching bills: {e}")
        return jsonify({"error": f"Failed to search bills: {str(e)}"}), 500