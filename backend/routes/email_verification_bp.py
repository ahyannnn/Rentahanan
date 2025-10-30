from flask import Blueprint, request, jsonify
from utils.email_utils import send_welcome_email

email_verification_bp = Blueprint("email_verification_bp", __name__)

# ==============================
# SEND WELCOME EMAIL AFTER REGISTRATION
# ==============================
@email_verification_bp.route("/welcome/send", methods=["POST"])
def send_welcome_after_register():
    data = request.get_json()
    if not data or "email" not in data or "user_name" not in data:
        return jsonify({"message": "Email and user name are required"}), 400

    email = data["email"]
    user_name = data["user_name"]
    
    # Send welcome email
    if send_welcome_email(email, user_name):
        return jsonify({"message": "Welcome email sent successfully"}), 200
    else:
        return jsonify({"message": "Failed to send welcome email"}), 500