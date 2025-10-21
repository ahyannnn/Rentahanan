from datetime import datetime
from flask import Blueprint, jsonify, request
from extensions import db
from models.tenants_model import Tenant
from models.users_model import User
from models.units_model import House as Unit
from models.contracts_model import Contract
from models.bills_model import Bill

bill_bp = Blueprint("bill_bp", __name__)

# -------------------------------
# 📘 Get tenants that need billing
# -------------------------------
@bill_bp.route("/billing/bills", methods=["GET"])
def get_bills():
    now = datetime.now()
    current_month = now.month
    current_year = now.year

    tenants_with_contracts = (
        db.session.query(
            Tenant.tenantid,
            User.firstname,
            User.middlename,
            User.lastname,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price")
        )
        .join(User, User.userid == Tenant.userid)
        .join(Contract, Contract.tenantid == Tenant.tenantid)
        .join(Unit, Unit.unitid == Contract.unitid)
        .all()
    )

    result = []
    for tenantid, firstname, middlename, lastname, unit_name, unit_price in tenants_with_contracts:
        existing_bill = (
            db.session.query(Bill)
            .filter(
                Bill.tenantid == tenantid,
                db.extract('month', Bill.issuedate) == current_month,
                db.extract('year', Bill.issuedate) == current_year
            )
            .first()
        )
        if not existing_bill:
            result.append({
                "id": tenantid,
                "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
                "unit_name": unit_name,
                "unit_price": unit_price
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
