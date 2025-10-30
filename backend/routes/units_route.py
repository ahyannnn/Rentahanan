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

@houses_bp.route("/houses/<int:house_id>", methods=["PUT"])
def update_house(house_id):
    try:
        # Find the house to update
        house = House.query.get(house_id)
        if not house:
            return jsonify({"error": "House not found"}), 404

        # Get form data
        name = request.form.get("name")
        description = request.form.get("description", "")
        price = request.form.get("price")
        status = request.form.get("status", "Available")
        image = request.files.get("image")

        # Validate required fields
        if not name or not price:
            return jsonify({"error": "Name and price are required fields"}), 400

        old_image_path = None
        new_filename = None

        # Handle image upload if a new image is provided
        if image:
            # Generate secure filename
            new_filename = secure_filename(image.filename)
            new_image_path = os.path.join(UPLOAD_FOLDER, new_filename)
            
            # Save the old image path for deletion later
            if house.imagepath:
                old_image_path = os.path.join(UPLOAD_FOLDER, house.imagepath)
            
            # Save new image
            image.save(new_image_path)
            
            # Update image path in database
            house.imagepath = new_filename

        # Update house record
        house.name = name
        house.description = description
        house.price = price
        house.status = status

        db.session.commit()

        # Delete old image after successful update (if a new image was uploaded)
        if image and old_image_path and os.path.exists(old_image_path):
            try:
                os.remove(old_image_path)
            except Exception as e:
                print(f"Warning: Could not delete old image {old_image_path}: {e}")

        return jsonify({
            "message": "Unit updated successfully!",
            "house": {
                "unitid": house.unitid,
                "name": house.name,
                "description": house.description,
                "price": house.price,
                "status": house.status,
                "imagepath": house.imagepath
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating house:", e)
        return jsonify({"error": "Failed to update unit", "details": str(e)}), 500

    finally:
        db.session.close()

# Optional: Add a GET route to fetch single house details if needed
@houses_bp.route("/houses/<int:house_id>", methods=["GET"])
def get_house(house_id):
    try:
        house = House.query.get(house_id)
        if not house:
            return jsonify({"error": "House not found"}), 404

        return jsonify({
            "unitid": house.unitid,
            "name": house.name,
            "description": house.description,
            "price": house.price,
            "status": house.status,
            "imagepath": house.imagepath
        }), 200

    except Exception as e:
        print("Error fetching house:", e)
        return jsonify({"error": "Failed to fetch house details"}), 500