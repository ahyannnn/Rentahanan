from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from extensions import db
from models.applications_model import Application
from models.users_model import User
from models.units_model import House as Unit

application_bp = Blueprint("application_bp", __name__)

@application_bp.route("/apply", methods=["POST"])
def apply_unit():
    user_id = request.form.get("tenant_id")
    unit_id = request.form.get("unit_id")

    # Get uploaded files
    valid_id_file = request.files.get("validId")
    brgy_file = request.files.get("brgyClearance")
    proof_file = request.files.get("proofOfIncome")

    if not user_id or not unit_id or not valid_id_file:
        return jsonify({"error": "Missing required fields"}), 400

    # Get user info
    user = User.query.filter_by(userid=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Base folder setup
    base_folder = current_app.config["UPLOAD_FOLDER"]
    folders = {
        "valid_id": os.path.join(base_folder, "valid_ids"),
        "brgy": os.path.join(base_folder, "brgy_clearances"),
        "proof": os.path.join(base_folder, "proof_of_income")
    }

    # Ensure folders exist
    for folder in folders.values():
        os.makedirs(folder, exist_ok=True)

    def save_file(file, folder_key, prefix):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{user_id}_{prefix}_{timestamp}_{filename}"
        save_path = os.path.join(folders[folder_key], unique_filename)
        file.save(save_path)
        # ✅ Return only the filename, not the full path
        return unique_filename

    try:
        valid_id_filename = save_file(valid_id_file, "valid_id", "validid")
        brgy_filename = save_file(brgy_file, "brgy", "brgy") if brgy_file else None
        proof_filename = save_file(proof_file, "proof", "proof") if proof_file else None

        # Check if application exists
        application = Application.query.filter_by(userid=user_id).first()

        if application:
            application.unitid = unit_id
            application.valid_id = valid_id_filename
            application.brgy_clearance = brgy_filename
            application.proof_of_income = proof_filename
            application.status = "Pending"
            application.submissiondate = datetime.utcnow()
        else:
            new_app = Application(
                unitid=unit_id,
                userid=user.userid,
                valid_id=valid_id_filename,
                brgy_clearance=brgy_filename,
                proof_of_income=proof_filename,
                status="Pending",
                submissiondate=datetime.utcnow()
            )
            db.session.add(new_app)

        db.session.commit()
        return jsonify({"message": "Application submitted successfully!"})

    except Exception as e:
        db.session.rollback()
        # cleanup any saved files on error
        for folder in folders.values():
            for f in os.listdir(folder):
                if f.startswith(f"{user_id}_"):
                    os.remove(os.path.join(folder, f))
        return jsonify({"error": f"Failed to submit application: {str(e)}"}), 500




# ✅ Fetch application details
@application_bp.route("/application/<int:tenant_id>", methods=["GET"])
def get_application(tenant_id):
    # Get application
    application = Application.query.filter_by(userid=tenant_id).first()
    
    if not application:
        return jsonify({"error": "No application found for this user"}), 404

    # Get user for fullname, email, phone
    user = User.query.filter_by(userid=tenant_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Combine data
    return jsonify({
        "userid": user.userid,
        "fullName": f"{user.firstname} {user.middlename or ''} {user.lastname}".strip(),
        "email": user.email,
        "phone": user.phone,
        "status": application.status,
        "unitid": application.unitid
    })

from models.units_model import House as Unit  # ✅ add this import at the top

@application_bp.route("/applicants/for-billing", methods=["GET"])
def get_applicants_for_billing():
    try:
        # Fetch approved applications
        approved_applicants = (
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

        if not approved_applicants:
            return jsonify([])  # No applicants

        # Format results
        result = []
        for (
            applicationid,
            userid,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            unit_name,
            unit_price,
            status
        ) in approved_applicants:
            result.append({
                "applicationid": applicationid,
                "userid": userid,
                "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
                "email": email,
                "phone": phone,
                "unit_name": unit_name,
                "unit_price": unit_price,
                "status": status,
                "estimated_bill": unit_price * 3  # Assuming bill is based on unit price
            })

        return jsonify(result)

    except Exception as e:
        print("❌ Error fetching applicants for billing:", e)
        return jsonify({"error": str(e)}), 500
