from flask import Blueprint, request, jsonify
from extensions import db
from models.concerns_model import Concern
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from models.users_model import User
from models.units_model import House
from models.tenants_model import Tenant
from models.applications_model import Application

concern_bp = Blueprint("concern_bp", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ✅ Add new concern (Tenant)
@concern_bp.route("/add-concerns", methods=["POST"])
def add_concern():
    try:
        data = request.form
        tenantid = data.get("tenantid")
        concerntype = data.get("concerntype")
        subject = data.get("subject")
        description = data.get("description")

        if not tenantid or not concerntype or not subject or not description:
            return jsonify({"error": "All required fields must be provided"}), 400

        # Handle tenant image upload
        tenantimage_path = None
        if "tenantimage" in request.files:
            file = request.files["tenantimage"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                upload_dir = os.path.join("backend", "uploads", "concern_image")
                os.makedirs(upload_dir, exist_ok=True)
                file.save(os.path.join(upload_dir, filename))
                tenantimage_path = f"/uploads/concern_image/{filename}"

        new_concern = Concern(
            tenantid=tenantid,
            concerntype=concerntype,
            subject=subject,
            description=description,
            tenantimage=tenantimage_path,
            status="Pending",
            creationdate=datetime.utcnow()
        )

        db.session.add(new_concern)
        db.session.commit()

        return jsonify({
            "message": "Concern submitted successfully",
            "concern": new_concern.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error adding concern:", e)
        return jsonify({"error": "Failed to submit concern"}), 500


# ✅ Get ALL concerns (for landlord view)
@concern_bp.route("/concerns", methods=["GET"])
def get_all_concerns():
    try:
        results = (
            db.session.query(
                Concern.concernid,
                Concern.concerntype,
                Concern.subject,
                Concern.description,
                Concern.status,
                Concern.creationdate,
                Concern.tenantimage,
                Concern.landlordimage,
                User.firstname,
                User.lastname,
                House.name.label("unit_name")  # Label the unit name properly
            )
            .join(Tenant, Tenant.tenantid == Concern.tenantid)
            .join(User, User.userid == Tenant.userid)
            .outerjoin(Application, Application.applicationid == Tenant.applicationid)  # ✅ Outer join
            .outerjoin(House, House.unitid == Application.unitid)  # ✅ Outer join
            .order_by(Concern.creationdate.desc())
            .all()
        )

        concerns_list = []
        for c in results:
            fullname = f"{c.firstname} {c.lastname}".strip()

            if c.status and c.status.lower() == "pending":
                display_image = c.tenantimage
            elif c.status and c.status.lower() in ["fixed", "resolved"]:
                display_image = c.landlordimage
            else:
                display_image = None

            concerns_list.append({
                "id": c.concernid,
                "concerntype": c.concerntype,
                "subject": c.subject,
                "description": c.description,
                "image": c.tenantimage,
                "status": c.status,
                "creationdate": c.creationdate,
                "tenant_name": fullname,
                "unit": c.unit_name if c.unit_name else "",  # Return empty string if no unit
                "display_image": display_image
            })

        return jsonify(concerns_list), 200

    except Exception as e:
        print("Error fetching concerns:", e)
        return jsonify({"error": str(e)}), 500






# ✅ Get concerns per tenant
@concern_bp.route("/get-concerns/<int:tenantid>", methods=["GET"])
def get_concerns(tenantid):
    try:
        concerns = Concern.query.filter_by(tenantid=tenantid).order_by(Concern.creationdate.desc()).all()

        result = []
        for c in concerns:
            concern_dict = c.to_dict()

            # ✅ Choose which image to show based on status
            if c.status.lower() == "pending":
                concern_dict["display_image"] = c.tenantimage
            elif c.status.lower() in ["fixed", "resolved"]:
                concern_dict["display_image"] = c.landlordimage
            else:
                concern_dict["display_image"] = None

            result.append(concern_dict)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Update concern (Landlord marks resolved & uploads fix image)
@concern_bp.route("/concerns/<int:concernid>", methods=["PUT"])
def update_concern(concernid):
    try:
        concern = Concern.query.get(concernid)
        if not concern:
            return jsonify({"error": "Concern not found"}), 404

        data = request.form
        status = data.get("status", concern.status)

        landlordimage_path = concern.landlordimage
        if "landlordimage" in request.files:
            file = request.files["landlordimage"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                upload_dir = os.path.join("backend", "uploads", "concern_image")
                os.makedirs(upload_dir, exist_ok=True)
                file.save(os.path.join(upload_dir, filename))
                landlordimage_path = f"/uploads/concern_image/{filename}"

        # ✅ Enforce that Resolved requires a landlord image
        if status.lower() == "resolved" and not landlordimage_path:
            return jsonify({"error": "Cannot mark as resolved without uploading a fix photo"}), 400

        concern.status = status
        concern.landlordimage = landlordimage_path

        db.session.commit()

        return jsonify({
            "message": "Concern updated successfully",
            "concern": concern.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating concern:", e)
        return jsonify({"error": "Failed to update concern"}), 500

