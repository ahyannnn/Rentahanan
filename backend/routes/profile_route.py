from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models.users_model import User
from models.applications_model import Application
from models.tenants_model import Tenant
import os
from datetime import datetime

profile_bp = Blueprint("profile_bp", __name__)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_user_profile(user_id):
    try:
        # Find user
        user = User.query.filter_by(userid=user_id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Get form data - ONLY editable fields
        email = request.form.get("email")
        phone = request.form.get("phone")
        
        # Get uploaded file
        image_file = request.files.get("image")

        # Validate required fields
        if not email or not phone:
            return jsonify({"success": False, "message": "Email and phone are required"}), 400

        # Check if email is already taken by another user
        existing_user = User.query.filter(User.email == email, User.userid != user_id).first()
        if existing_user:
            return jsonify({"success": False, "message": "Email already taken by another user"}), 400

        # Setup image folder
        base_folder = current_app.config["UPLOAD_FOLDER"]
        profile_images_folder = os.path.join(base_folder, "profile_images")
        os.makedirs(profile_images_folder, exist_ok=True)

        image_filename = None

        # Handle image upload
        if image_file and image_file.filename:
            if not allowed_file(image_file.filename):
                return jsonify({"success": False, "message": "Invalid file type. Allowed types: PNG, JPG, JPEG, GIF, BMP, WEBP"}), 400

            # Delete old image if exists
            if user.image:
                old_image_path = os.path.join(profile_images_folder, user.image)
                if os.path.exists(old_image_path):
                    try:
                        os.remove(old_image_path)
                    except Exception as e:
                        print(f"Warning: Could not delete old image: {e}")

            # Save new image
            filename = secure_filename(image_file.filename)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            image_filename = f"profile_{user_id}_{timestamp}.{file_extension}"
            save_path = os.path.join(profile_images_folder, image_filename)
            
            image_file.save(save_path)

        # Update ONLY editable fields
        user.email = email
        user.phone = phone
        
        # Only update image if a new one was uploaded
        if image_filename:
            user.image = image_filename

        db.session.commit()

        # Return updated user data
        updated_user = {
            "userid": user.userid,
            "firstname": user.firstname,
            "middlename": user.middlename,
            "lastname": user.lastname,
            "email": user.email,
            "phone": user.phone,
            "dateofbirth": user.dateofbirth,
            "street": user.street,
            "barangay": user.barangay,
            "city": user.city,
            "province": user.province,
            "zipcode": user.zipcode,
            "role": user.role,
            "image": user.image,
            "datecreated": user.datecreated.isoformat() if user.datecreated else None
        }

        return jsonify({
            "success": True, 
            "message": "Profile updated successfully",
            "user": updated_user
        })

    except Exception as e:
        db.session.rollback()
        print("Error updating profile:", str(e))
        return jsonify({"success": False, "message": f"Failed to update profile: {str(e)}"}), 500

# Keep the GET and image serving routes the same as before
@profile_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    try:
        # Query user with related tenant data
        user_data = (
            db.session.query(
                User,
                Tenant.tenantid,
                Application.status.label("application_status")
            )
            .outerjoin(Tenant, Tenant.userid == User.userid)
            .outerjoin(Application, Application.userid == User.userid)
            .filter(User.userid == user_id)
            .first()
        )

        if not user_data:
            return jsonify({"success": False, "message": "User not found"}), 404

        user, tenantid, application_status = user_data

        profile = {
            "userid": user.userid,
            "tenantid": tenantid,  # ✅ Include tenantid
            "firstname": user.firstname,
            "middlename": user.middlename,
            "lastname": user.lastname,
            "email": user.email,
            "phone": user.phone if user.phone else "N/A",
            "dateofbirth": user.dateofbirth,
            "street": user.street,
            "barangay": user.barangay,
            "city": user.city,
            "province": user.province,
            "zipcode": user.zipcode,
            "role": user.role,
            "image": user.image,
            "datecreated": user.datecreated.isoformat() if user.datecreated else None,
            "application_status": application_status or "Registered"
        }

        return jsonify({"success": True, "profile": profile})

    except Exception as e:
        print("Error fetching user profile:", str(e))
        return jsonify({"success": False, "message": f"Failed to fetch profile: {str(e)}"}), 500