from flask import Blueprint, request, jsonify
from extensions import db
from models.users_model import User
from models.applications_model import Application
from models.tenants_model import Tenant
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    # Extract user fields
    firstname = data.get("firstname")
    middlename = data.get("middlename")
    lastname = data.get("lastname")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    dateofbirth = data.get("dob")
    street = data.get("street")
    barangay = data.get("barangay")
    city = data.get("city")
    province = data.get("province")
    zipcode = data.get("zipcode")

    # Validation: ensure all required fields are filled
    if not all([firstname, lastname, email, phone, password, dateofbirth, street, barangay, city, province, zipcode]):
        return jsonify({"message": "All fields are required"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    try:
        # --- Hash password ---
        hashed_password = generate_password_hash(password)

        # --- Create User ---
        new_user = User(
            firstname=firstname,
            middlename=middlename,
            lastname=lastname,
            email=email,
            password=hashed_password,
            phone=phone,
            dateofbirth=dateofbirth,
            street=street,
            barangay=barangay,
            city=city,
            province=province,
            zipcode=zipcode,
            role="Tenant",
            datecreated=datetime.utcnow()
        )

        db.session.add(new_user)
        db.session.flush()  # Get new_user.userid

        # --- Create Application ---
        new_application = Application(
            unitid=None,
            status="Registered",
            submissiondate=datetime.utcnow(),
            userid=new_user.userid,
            valid_id=None,
            brgy_clearance=None,
            proof_of_income=None
        )

        db.session.add(new_application)
        db.session.flush()  # Get new_application.applicationid

        # --- Create Tenant ---
        new_tenant = Tenant(
            userid=new_user.userid,
            applicationid=new_application.applicationid
        )

        db.session.add(new_tenant)

        # --- Commit all changes ---
        db.session.commit()

        return jsonify({"message": "User, application, and tenant created successfully!"}), 201

    except Exception as e:
        # --- Rollback on any error ---
        db.session.rollback()
        print("Registration error:", str(e))
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500


# ==============================
# LOGIN
# ==============================
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"message": "Email and password required"}), 400

    # ✅ Query the Users table correctly
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # ✅ Verify hashed password using werkzeug
    if not user.check_password(password):
        return jsonify({"message": "Incorrect password"}), 401

    # ✅ Fetch the user's application record (optional)
    application = Application.query.filter_by(userid=user.userid).first()
    application_status = application.status if application else "No Application"
    tenant = Tenant.query.filter_by(userid=str(user.userid)).first()

    return jsonify({
        "message": "Login successful",
        "user": {
            "userid": user.userid,
            "tenantid": tenant.tenantid if tenant else None,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "middlename": user.middlename,
            "email": user.email,
            "role": user.role,
            "application_status": application.status if application else "No Application"
        }
    }), 200



    
