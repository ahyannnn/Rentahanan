from flask import Blueprint, request, jsonify
from extensions import db
from models.users_model import User
from utils.email_utils import send_password_reset_email, verify_code
from werkzeug.security import generate_password_hash

forgot_bp = Blueprint("forgot_bp", __name__)

# ==============================
# SEND VERIFICATION CODE
# ==============================
@forgot_bp.route("/forgot/send", methods=["POST"])
def send_code():
    data = request.get_json()
    if not data or "email" not in data:
        return jsonify({"message": "Email is required"}), 400

    email = data["email"]
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email not found"}), 404

    # FIX: Use the correct function name that you imported
    if send_password_reset_email(email):
        return jsonify({"message": "Verification code sent successfully"}), 200
    else:
        return jsonify({"message": "Failed to send verification code"}), 500

# ==============================
# VERIFY CODE
# ==============================
@forgot_bp.route("/forgot/verify", methods=["POST"])
def verify_user_code():
    data = request.get_json()
    if not data or "email" not in data or "code" not in data:
        return jsonify({"message": "Email and code are required"}), 400

    email = data["email"]
    code = data["code"]

    verified, message = verify_code(email, code)
    if verified:
        return jsonify({"message": message}), 200
    else:
        return jsonify({"message": message}), 400

# ==============================
# RESET PASSWORD
# ==============================
@forgot_bp.route("/forgot/reset", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    print("Resetting password for:", email, new_password, confirm_password)

    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not new_password or not confirm_password:
        return jsonify({"message": "Password and confirm password are required"}), 400
    if new_password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    try:
        hashed_password = generate_password_hash(new_password)
        user.password = hashed_password
        db.session.commit()
        return jsonify({"message": "Password reset successful!"}), 200
    except Exception as e:
        db.session.rollback()
        print("Password reset error:", str(e))
        return jsonify({"message": f"Error resetting password: {str(e)}"}), 500