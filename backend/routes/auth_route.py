from flask import Blueprint, request, jsonify
from extensions import db
from models.users_model import User
from models.applications_model import Application
from werkzeug.security import generate_password_hash
from datetime import datetime

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    fullname = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([fullname, email, phone, password]):
        return jsonify({"message": "All fields are required"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create user
    new_user = User(
        fullname=fullname,
        email=email,
        phone=phone,
        password=hashed_password,
        role="Tenant",
        datecreated=datetime.utcnow()
    )

    # Create default application
    new_application = Application(
        fullname=fullname,
        email=email,
        phone=phone,
        unitid=None,
        status="Pending",
        submissiondate=datetime.utcnow()
    )

    try:
        db.session.add(new_user)
        db.session.add(new_application)
        db.session.commit()
        return jsonify({"message": "User registered and application created!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500
