from datetime import datetime
from flask import Blueprint, jsonify, request
from extensions import db
from models.tenants_model import Tenant
from models.users_model import User
from models.units_model import House as Unit
from models.contracts_model import Contract
from models.bills_model import Bill
import os
from werkzeug.utils import secure_filename

bill_bp = Blueprint("bill_bp", __name__)

# -------------------------------
# 📘 Get tenants that need billing
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
# 🧾 Create a new bill
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

    # Validate required fields
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

        # If Contract with tenantid exists, set bill contractid to it
        contract = Contract.query.filter_by(tenantid=tenantid).first()
        if contract:
            new_bill.contractid = contract.contractid
            db.session.commit()
        return jsonify({"message": "Bill created successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating bill:", e)
        return jsonify({"error": "Failed to create bill"}), 500
    
# Get bills for a specific tenant
@bill_bp.route("/bills/<tenant_id>", methods=["GET"])
def get_tenant_bills(tenant_id):
    try:
        # Convert tenant_id to integer if necessary
        tenant_id_int = int(tenant_id)
        
        bills = Bill.query.filter_by(tenantid=tenant_id_int).all()
        
        bills_list = []
        for bill in bills:
            bills_list.append({
                "billid": bill.billid,
                "contractid": bill.contractid,
                "tenantid": bill.tenantid,
                "issuedate": bill.issuedate.strftime("%Y-%m-%d") if bill.issuedate else None,
                "duedate": bill.duedate.strftime("%Y-%m-%d") if bill.duedate else None,
                "amount": float(bill.amount),  # ensure frontend gets a number
                "billtype": bill.billtype,
                "status": bill.status,
                "description": bill.description,
                "paymenttype": bill.paymenttype,
                "gcash_ref": bill.gcash_ref,
                "gcash_receipt": bill.gcash_receipt,
            })
        
        return jsonify(bills_list), 200

    except Exception as e:
        print("Error fetching tenant bills:", e)
        return jsonify({"error": "Failed to fetch bills"}), 500
    
UPLOAD_FOLDER = "uploads/gcash_receipts"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Bill payment update
@bill_bp.route("/bills/pay/<int:bill_id>", methods=["PUT"])
def pay_bill(bill_id):
    try:
        bill = Bill.query.get(bill_id)
        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        payment_type = request.form.get("paymentType")
        gcash_ref = request.form.get("gcashRef")
        file = request.files.get("gcashReceipt")

        # Set defaults based on payment type
        if payment_type == "Cash":
            bill.paymenttype = "Cash"
            bill.gcash_ref = None
            bill.gcash_receipt = None
        else:
            bill.paymenttype = "GCash"
            bill.gcash_ref = gcash_ref

            # Save GCash receipt file
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                save_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(save_path)
                bill.gcash_receipt = filename
            else:
                return jsonify({"error": "Invalid or missing GCash receipt file"}), 400

        # Update bill status
        bill.status = "For Validation"

        # Commit changes
        db.session.commit()
        return jsonify({"message": "Bill marked as 'For Validation' successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating bill payment: {e}")
        return jsonify({"error": "Failed to update bill payment"}), 500

    finally:
        db.session.close()
