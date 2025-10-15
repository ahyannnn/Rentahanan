from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from extensions import db
from models.applications_model import Application

application_bp = Blueprint("application_bp", __name__)

# ✅ Apply or update application
@application_bp.route("/apply", methods=["POST"])
def apply_unit():
    user_id = request.form.get("tenant_id")
    unit_id = request.form.get("unit_id")
    file = request.files.get("validId")

    if not user_id or not unit_id or not file:
        return jsonify({"error": "Missing required fields"}), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_filename = f"{user_id}_{timestamp}_{filename}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    relative_path = f"uploads/valid_ids/{unique_filename}"

    application = Application.query.filter_by(userid=user_id).first()

    if application:
        application.unitid = unit_id
        application.valid_id = relative_path
        application.status = "Pending"
    else:
        application = Application(
            fullname="",  # You can fill these from frontend if needed
            email="",
            phone="",
            unitid=unit_id,
            userid=user_id,
            valid_id=relative_path,
            status="Pending"
        )
        db.session.add(application)

    db.session.commit()
    return jsonify({"message": "Application updated successfully!"})


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
        
    })
