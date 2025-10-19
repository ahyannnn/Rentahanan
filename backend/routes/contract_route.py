from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from extensions import db
from models.contracts_model import Contract
from models.tenants_model import Tenant
from models.units_model import House as Unit
from models.applications_model import Application
from models.users_model import User

contract_bp = Blueprint("contract_bp", __name__)

# ✅ GET: Tenants with active contracts
@contract_bp.route("/contracts/tenants", methods=["GET"])
def get_tenant_contracts():
    contracts = (
        db.session.query(
            Contract.contractid,
            Tenant.tenantid,
            User.firstname,
            User.middlename,
            User.lastname,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Contract.startdate,
            Contract.enddate,
            Contract.status
        )
        .join(Tenant, Contract.tenantid == Tenant.tenantid)
        .join(User, Tenant.userid == User.userid)
        .join(Unit, Contract.unitid == Unit.unitid)
        .all()
    )

    result = [
        {
            "contractid": contractid,
            "tenantid": tenantid,
            "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
            "unit_name": unit_name,
            "unit_price": unit_price,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "status": status
        }
        for contractid, tenantid, firstname, middlename, lastname, unit_name, unit_price, start_date, end_date, status in contracts
    ]

    return jsonify(result)


# ✅ GET: Applicants approved but without contract (for issuing)
@contract_bp.route("/contracts/applicants", methods=["GET"])
def get_applicants_for_contract():
    applicants = (
        db.session.query(
            Application.applicationid,
            User.userid,
            User.firstname,
            User.middlename,
            User.lastname,
            User.email,
            User.phone,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Application.status
        )
        .join(User, User.userid == Application.userid)
        .join(Unit, Unit.unitid == Application.unitid)
        .filter(Application.status == "Pending")  # Only pending applicants
        .all()
    )

    result = []
    for applicationid, userid, firstname, middlename, lastname, email, phone, unit_name, unit_price, status in applicants:
        # Check if already has contract
        tenant = Tenant.query.filter_by(userid=userid).first()
        has_contract = False
        if tenant:
            existing_contract = Contract.query.filter_by(tenantid=tenant.tenantid).first()
            if existing_contract:
                has_contract = True

        if not has_contract:
            result.append({
                "applicationid": applicationid,
                "userid": userid,
                "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
                "email": email,
                "phone": phone,
                "unit_name": unit_name,
                "unit_price": unit_price,
                "status": status
            })

    return jsonify(result)


# ✅ POST: Issue Contract
@contract_bp.route("/contracts/create", methods=["POST"])
def create_contract():
    try:
        data = request.get_json()
        tenant_id = data.get("tenantid")
        unit_id = data.get("unitid")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        description = data.get("description", "")
        status = data.get("status", "Active")

        # Validate tenant and unit
        tenant = Tenant.query.filter_by(tenantid=tenant_id).first()
        unit = Unit.query.filter_by(unitid=unit_id).first()
        if not tenant or not unit:
            return jsonify({"error": "Invalid tenant or unit"}), 400

        # Create new contract
        contract = Contract(
            tenantid=tenant_id,
            unitid=unit_id,
            start_date=datetime.strptime(start_date, "%Y-%m-%d"),
            end_date=datetime.strptime(end_date, "%Y-%m-%d"),
            description=description,
            status=status
        )
        db.session.add(contract)
        db.session.commit()

        return jsonify({"message": "Contract issued successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating contract:", str(e))
        return jsonify({"error": f"Failed to create contract: {str(e)}"}), 500
