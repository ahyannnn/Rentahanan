from flask import Blueprint, jsonify
from extensions import db
from models.users_model import User
from models.tenants_model import Tenant
from models.contracts_model import Contract
from models.units_model import House as Unit
from models.applications_model import Application

tenant_bp = Blueprint("tenant_bp", __name__)

# Active tenants with contract, unit, and optional application info
@tenant_bp.route("/tenants/active")
def get_active_tenants():
    tenants = (
        db.session.query(
            User.fullname,
            User.email,
            User.phone,
            Tenant.dateofbirth,
            Tenant.address,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Application.valid_id,
            Application.brgy_clearance,
            Application.proof_of_income
        )
        .join(Tenant, Tenant.userid == User.userid)
        .join(Contract, Contract.tenantid == Tenant.tenantid)
        .join(Unit, Unit.unitid == Contract.unitid)
        .outerjoin(Application, Application.userid == User.userid)  # LEFT JOIN
        .filter(Contract.status == "Active")
        .all()
    )

    result = [
        {
            "fullname": fullname,
            "email": email,
            "phone": phone,
            "dateofbirth": dateofbirth,
            "address": address,
            "unit_name": unit_name,
            "unit_price": unit_price,
            "valid_id": valid_id,
            "brgy_clearance": brgy_clearance,
            "proof_of_income": proof_of_income,
        }
        for fullname, email, phone, dateofbirth, address, unit_name, unit_price, valid_id, brgy_clearance, proof_of_income in tenants
    ]

    return jsonify(result)




# Pending applicants
@tenant_bp.route("/tenants/applicants")
def get_applicants():
    applicants = (
        db.session.query(
            User.fullname,
            User.email,
            User.phone,
            Tenant.dateofbirth,
            Tenant.address,
            Unit.name.label("unit_name"),
            Application.valid_id,
            Application.brgy_clearance,
            Application.proof_of_income
        )
        .join(User, Application.userid == User.userid)
        .outerjoin(Tenant, Tenant.userid == User.userid)  # LEFT JOIN to include users without tenant info
        .outerjoin(Unit, Unit.unitid == Application.unitid)  # LEFT JOIN in case unit not assigned yet
        .filter(Application.status == "Pending")
        .all()
    )

    result = [
        {
            "fullname": fullname,
            "email": email,
            "phone": phone,
            "dateofbirth": dateofbirth,
            "address": address,
            "unit_name": unit_name,
            "valid_id": valid_id,
            "brgy_clearance": brgy_clearance,
            "proof_of_income": proof_of_income,
        }
        for fullname, email, phone, dateofbirth, address, unit_name, valid_id, brgy_clearance, proof_of_income in applicants
    ]

    return jsonify(result)

