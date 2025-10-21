from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from extensions import db
from models.units_model import House

houses_bp = Blueprint("houses_bp", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend/uploads/houseimages")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@houses_bp.route("/add-houses", methods=["POST"])
def add_house():
    name = request.form.get("name")
    description = request.form.get("description", "")
    price = request.form.get("price")
    status = request.form.get("status", "Available")
    image = request.files.get("image")

    if not name or not price or not image:
        return jsonify({"error": "Missing required fields"}), 400

    filename = secure_filename(image.filename)
    image_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        # Save image first
        image.save(image_path)

        # Create house record
        new_house = House(
            name=name,
            description=description,
            price=price,
            status=status,
            imagepath=filename,
        )

        db.session.add(new_house)
        db.session.commit()

        return jsonify({"message": "Unit added successfully!"}), 201

    except Exception as e:
        # Roll back database if something fails
        db.session.rollback()

        # Delete uploaded image to avoid leftover files
        if os.path.exists(image_path):
            os.remove(image_path)

        print("Error adding house:", e)
        return jsonify({"error": "Failed to add unit", "details": str(e)}), 500

    finally:
        # Always close session to free up resources
        db.session.close()

