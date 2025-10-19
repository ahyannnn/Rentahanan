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
            Application.applicationid,
            User.firstname,
            User.middlename,
            User.lastname,
            User.email,
            User.phone,
            User.dateofbirth,
            User.street,
            User.barangay,
            User.city,
            User.province,
            User.zipcode,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Application.valid_id,
            Application.brgy_clearance,
            Application.proof_of_income
        )
        .join(Tenant, Tenant.userid == User.userid)
        .join(Contract, Contract.tenantid == Tenant.tenantid)
        .join(Unit, Unit.unitid == Contract.unitid)
        .join(Application, Application.applicationid == Tenant.applicationid)
        .filter(Contract.status == "Active")
        .all()
    )

    result = [
        {
            "applicationid": applicationid,
            "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
            "email": email,
            "phone": phone,
            "dateofbirth": dateofbirth,
            "address": f"{street}, {barangay}, {city}, {province}, {zipcode}",
            "unit_name": unit_name,
            "unit_price": unit_price,
            "valid_id": valid_id,
            "brgy_clearance": brgy_clearance,
            "proof_of_income": proof_of_income,
        }
        for applicationid, firstname, middlename, lastname, email, phone, dateofbirth, street, barangay, city, province, zipcode, unit_name, unit_price, valid_id, brgy_clearance, proof_of_income in tenants
    ]

    return jsonify(result)





# Pending applicants
@tenant_bp.route("/tenants/applicants")
def get_applicants():
    applicants = (
        db.session.query(
            Application.applicationid,
            User.firstname,
            User.middlename,
            User.lastname,
            User.email,
            User.phone,
            User.dateofbirth,
            User.street,
            User.barangay,
            User.city,
            User.province,
            User.zipcode,
            Unit.name.label("unit_name"),
            Application.valid_id,
            Application.brgy_clearance,
            Application.proof_of_income
        )
        .join(User, Application.userid == User.userid)
        .outerjoin(Tenant, Tenant.userid == User.userid)  # include users without tenant info
        .outerjoin(Unit, Unit.unitid == Application.unitid)  # in case unit not assigned yet
        .filter(Application.status == "Pending")
        .all()
    )

    result = [
        {
            "applicationid": applicationid,
            "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
            "email": email,
            "phone": phone,
            "dateofbirth": dateofbirth,
            "address": f"{street}, {barangay}, {city}, {province}, {zipcode}",
            "unit_name": unit_name,
            "valid_id": valid_id,
            "brgy_clearance": brgy_clearance,
            "proof_of_income": proof_of_income,
        }
        for applicationid, firstname, middlename, lastname, email, phone, dateofbirth, street, barangay, city, province, zipcode, unit_name, valid_id, brgy_clearance, proof_of_income in applicants
    ]

    return jsonify(result)


# Approve an applicant
@tenant_bp.route("/tenants/approve/<int:application_id>", methods=["PUT"])
def approve_applicant(application_id):
    try:
        application = Application.query.get(application_id)

        if not application:
            return jsonify({"success": False, "message": "Application not found"}), 404

        # Update status to Approved
        application.status = "Approved"

        # Check if tenant entry already exists
        existing_tenant = Tenant.query.filter_by(userid=application.userid).first()
        if not existing_tenant:
            new_tenant = Tenant(
                userid=application.userid,
                applicationid=application.applicationid
            )
            db.session.add(new_tenant)

        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Application {application_id} approved successfully."
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Failed to approve application: {str(e)}"}), 500


# Reject an applicant
@tenant_bp.route("/tenants/reject/<int:application_id>", methods=["PUT"])
def reject_applicant(application_id):
    try:
        application = Application.query.get(application_id)

        if not application:
            return jsonify({"success": False, "message": "Application not found"}), 404

        # Update status to Rejected
        application.status = "Rejected"

        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Application {application_id} rejected successfully."
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Failed to reject application: {str(e)}"}), 500



