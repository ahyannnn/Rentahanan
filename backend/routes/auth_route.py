from flask import Blueprint, request, jsonify
from extensions import db
from models.users_model import User
from models.applications_model import Application
from models.tenants_model import Tenant
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

auth_bp = Blueprint("auth_bp", __name__)

# ==============================
# REGISTER
# ==============================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    fullname = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    dateofbirth = data.get("dob")
    address = data.get("address")

    if not all([fullname, email, phone, password, dateofbirth, address]):
        return jsonify({"message": "All fields are required"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    try:
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
        db.session.add(new_user)
        db.session.flush()  # flush to get new_user.userid

        # Create application
        new_application = Application(
            fullname=fullname,
            email=email,
            phone=phone,
            unitid=None,
            userid=new_user.userid,
            valid_id=None,
            status="Registered",
            submissiondate=None,
            brgy_clearance=None,
            proof_of_income=None
        )
        db.session.add(new_application)
        db.session.flush()  # flush to get new_application.applicationid

        # Create tenant
        new_tenant = Tenant(
            userid=new_user.userid,                 # match Tenant model column
            dateofbirth=dateofbirth,
            address=address,
            applicationid=new_application.applicationid
        )
        db.session.add(new_tenant)

        # Commit all three at once
        db.session.commit()

        return jsonify({"message": "User, application, and tenant created successfully!"}), 201

    except Exception as e:
        db.session.rollback()  # rollback all changes if any error occurs
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

# ==============================
# LOGIN
# ==============================
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200
    # login logic below

    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"message": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Verify password
    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    # Fetch user's application (if any)
    application = Application.query.filter_by(email=email).first()
    application_status = application.status if application else "No Application"

    return jsonify({
        "message": "Login successful",
        "user": {
            "userid": user.userid,
            "name": user.fullname,
            "email": user.email,
            "role": user.role,
            "application_status": application_status
        }
    }), 200
