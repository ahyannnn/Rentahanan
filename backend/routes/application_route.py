from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from extensions import db
from models.applications_model import Application
from models.users_model import User

application_bp = Blueprint("application_bp", __name__)

from flask import request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from extensions import db
from models.applications_model import Application
from models.users_model import User

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

    # Define folders
    base_folder = "uploads"
    folders = {
        "valid_id": os.path.join(base_folder, "valid_ids"),
        "brgy": os.path.join(base_folder, "brgy_clearances"),
        "proof": os.path.join(base_folder, "proof_of_income")
    }

    # Ensure folders exist
    for folder in folders.values():
        os.makedirs(folder, exist_ok=True)

    # Helper function to save files
    def save_file(file, folder_key, prefix):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{user_id}_{prefix}_{timestamp}_{filename}"
        file_path = os.path.join(folders[folder_key], unique_filename)
        file.save(file_path)
        return file_path  # Save relative path if needed

    try:
        valid_id_path = save_file(valid_id_file, "valid_id", "validid")
        brgy_path = save_file(brgy_file, "brgy", "brgy") if brgy_file else None
        proof_path = save_file(proof_file, "proof", "proof") if proof_file else None

        # Check if application already exists
        application = Application.query.filter_by(userid=user_id).first()

        if application:
            # Update existing application
            application.unitid = unit_id
            application.valid_id = valid_id_path
            application.brgy_clearance = brgy_path
            application.proof_of_income = proof_path
            application.status = "Pending"
            application.submissiondate = datetime.utcnow()
        else:
            # Create new application
            application = Application(
                unitid=unit_id,
                userid=user.userid,
                valid_id=valid_id_path,
                brgy_clearance=brgy_path,
                proof_of_income=proof_path,
                status="Pending",
                submissiondate=datetime.utcnow()
            )
            db.session.add(application)

        db.session.commit()
        return jsonify({"message": "Application submitted successfully!"})

    except Exception as e:
        db.session.rollback()  # Rollback on error

        # Remove any saved files to avoid orphan files
        for path in [valid_id_path, brgy_path, proof_path]:
            if path and os.path.exists(path):
                os.remove(path)

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

