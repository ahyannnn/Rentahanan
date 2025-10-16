from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from extensions import db
from models.applications_model import Application

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

    # Define separate folders
    base_folder = "uploads"
    folders = {
        "valid_id": os.path.join(base_folder, "valid_ids"),
        "brgy": os.path.join(base_folder, "brgy_clearances"),
        "proof": os.path.join(base_folder, "proof_of_income")
    }

    # Make sure folders exist
    for folder in folders.values():
        os.makedirs(folder, exist_ok=True)

    # Helper function to save files
    def save_file(file, folder_key, prefix):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{user_id}_{prefix}_{timestamp}_{filename}"
        file_path = os.path.join(folders[folder_key], unique_filename)
        file.save(file_path)
        return f"{folders[folder_key]}/{unique_filename}"

    try:
        valid_id_path = save_file(valid_id_file, "valid_id", "validid")
        brgy_path = save_file(brgy_file, "brgy", "brgy") if brgy_file else None
        proof_path = save_file(proof_file, "proof", "proof") if proof_file else None

        # Check if application already exists
        application = Application.query.filter_by(userid=user_id).first()

        if application:
            application.unitid = unit_id
            application.valid_id = valid_id_path
            application.brgy_clearance = brgy_path
            application.proof_of_income = proof_path
            application.status = "Pending"
            application.updated_at = datetime.utcnow()
        else:
            application = Application(
                fullname="",  # optionally get from frontend
                email="",
                phone="",
                unitid=unit_id,
                userid=user_id,
                valid_id=valid_id_path,
                brgy_clearance=brgy_path,
                proof_of_income=proof_path,
                status="Pending"
            )
            db.session.add(application)

        db.session.commit()
        return jsonify({"message": "Application submitted successfully!"})

    except Exception as e:
        db.session.rollback()  # ✅ Rollback on error
        # Optionally, remove saved files if something failed
        for path in [valid_id_path, brgy_path, proof_path]:
            if path and os.path.exists(path):
                os.remove(path)
        return jsonify({"error": f"Failed to submit application: {str(e)}"}), 500



# ✅ Fetch application details
@application_bp.route("/application/<int:tenant_id>", methods=["GET"])
def get_application(tenant_id):
    application = Application.query.filter_by(userid=tenant_id).first()

    if not application:
        return jsonify({"error": "No application found for this user"}), 404

    return jsonify({
        "userid": application.userid,
        "fullName": application.fullname,
        "email": application.email,
        "phone": application.phone,
        "status": application.status,
        "unit_id": application.unitid,
        
    })
