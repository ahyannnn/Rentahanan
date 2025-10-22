from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from werkzeug.utils import secure_filename
from extensions import db
from models.contracts_model import Contract
from models.tenants_model import Tenant
from models.units_model import House as Unit
from models.applications_model import Application
from models.users_model import User
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os, traceback
from flask import send_from_directory

contract_bp = Blueprint("contract_bp", __name__)

# ✅ Fetch existing contracts
@contract_bp.route("/contracts/tenants", methods=["GET"])
def get_tenant_contracts():
    contracts = (
        db.session.query(
            Contract.contractid,
            Tenant.tenantid,
            User.firstname,
            User.middlename,
            User.lastname,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Contract.startdate,
            Contract.enddate,
            Contract.status
        )
        .join(Tenant, Contract.tenantid == Tenant.tenantid)
        .join(User, Tenant.userid == User.userid)
        .join(Unit, Contract.unitid == Unit.unitid)
        .all()
    )

    result = [
        {
            "contractid": contractid,
            "tenantid": tenantid,
            "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
            "unit_name": unit_name,
            "unit_price": unit_price,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
            "status": status
        }
        for contractid, tenantid, firstname, middlename, lastname, unit_name, unit_price, start_date, end_date, status in contracts
    ]

    return jsonify(result)


# ✅ Applicants ready for contracts
@contract_bp.route("/contracts/applicants", methods=["GET"])
def get_applicants_for_contract():
    applicants = (
        db.session.query(
            Application.applicationid,
            User.userid,
            User.firstname,
            User.middlename,
            User.lastname,
            User.email,
            User.phone,
            Unit.unitid,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Application.status
        )
        .join(User, User.userid == Application.userid)
        .join(Unit, Unit.unitid == Application.unitid)
        .filter(Application.status == "Pending")
        .all()
    )

    result = []
    for (
        applicationid, userid, firstname, middlename, lastname,
        email, phone, unitid, unit_name, unit_price, status
    ) in applicants:
        tenant = Tenant.query.filter_by(userid=userid).first()
        tenantid = tenant.tenantid if tenant else None

        # Skip if already has contract
        if tenant and Contract.query.filter_by(tenantid=tenantid).first():
            continue

        result.append({
            "applicationid": applicationid,
            "userid": userid,
            "tenantid": tenantid,
            "fullname": f"{firstname} {middlename + ' ' if middlename else ''}{lastname}",
            "email": email,
            "phone": phone,
            "unitid": unitid,
            "unit_name": unit_name,
            "unit_price": unit_price,
            "status": status
        })

    return jsonify(result)


# ✅ Generate Contract PDF
@contract_bp.route("/contracts/generate-pdf", methods=["POST"])
def generate_contract_pdf():
    import base64
    import io
    import traceback
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from PIL import Image

    try:
        data = request.get_json()
        tenant_id = data.get("tenantid")
        tenant_name = data.get("tenant_name")
        unit_name = data.get("unit_name")
        start_date = data.get("start_date")
        rent = data.get("monthlyrent")
        deposit = data.get("deposit")
        advance = data.get("advancepayment")
        remarks = data.get("remarks")
        owner_signature_data = data.get("owner_signature")

        if not tenant_id or not tenant_name:
            return jsonify({"error": "Missing tenant information"}), 400

        contracts_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "contracts")
        os.makedirs(contracts_folder, exist_ok=True)

        filename = f"contract_{tenant_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        file_path = os.path.join(contracts_folder, filename)

        # ✅ Create the PDF
        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4

        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(width / 2, height - 80, "RENTAL AGREEMENT")
        c.setFont("Helvetica", 14)
        c.drawCentredString(width / 2, height - 110, "RenTahanan Property Management")

        c.setFont("Helvetica", 12)
        text = c.beginText(50, height - 160)
        lines = [
            f"This Rental Agreement is made between RenTahanan (the 'Owner')", 
            f"and {tenant_name} (the 'Tenant').",
            "",
            f"Unit: {unit_name}",
            f"Start Date: {start_date}",
            f"Monthly Rent: {rent} Pesos",
            f"Deposit: {deposit} Pesos",
            f"Advance Payment: {advance} Pesos",
            "",
            f"Remarks: {remarks}",
            "",
            "The Tenant agrees to comply with all terms and conditions set by the property owner.",
            "Failure to comply may result in the termination of the lease.",
            "",
            "Please sign below to confirm your acceptance of this agreement.",
        ]
        for line in lines:
            text.textLine(line)
        c.drawText(text)

        # ✅ Draw signature lines
        c.line(100, 150, 250, 150)
        c.drawString(115, 135, f"{tenant_name} (Tenant)")
        c.line(350, 150, 500, 150)
        c.drawString(370, 135, "Landlord Name (Owner)")

        # ✅ If owner signature is provided, decode and fix transparency
        if owner_signature_data:
            img_data = base64.b64decode(owner_signature_data.split(",")[1])
            sig_image = Image.open(io.BytesIO(img_data))

            # Fix transparency to white background
            if sig_image.mode == "RGBA":
                white_bg = Image.new("RGB", sig_image.size, (255, 255, 255))
                white_bg.paste(sig_image, mask=sig_image.split()[3])
                sig_image = white_bg

            img_buffer = io.BytesIO()
            sig_image.save(img_buffer, format="PNG")
            img_buffer.seek(0)
            signature_reader = ImageReader(img_buffer)

            # Draw owner signature (higher position)
            c.drawImage(signature_reader, 370, 160, width=120, height=50, mask='auto')

        c.save()

        public_url = f"http://localhost:5000/uploads/contracts/{filename}"

        return jsonify({
            "message": "Contract PDF generated successfully!",
            "pdf_url": public_url,
            "filename": filename
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate contract: {str(e)}"}), 500


# ✅ Issue Contract to Tenant
@contract_bp.route("/contracts/issuecontract", methods=["POST"])
def issue_contract():
    try:
        data = request.get_json()
        tenant_id = data.get("tenantid")
        unit_id = data.get("unitid")
        start_date_str = data.get("startdate")
        generated_contract = data.get("generated_contract")

        if not all([tenant_id, unit_id, start_date_str]):
            return jsonify({"error": "Missing contract information"}), 400

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()

        new_contract = Contract(
            tenantid=tenant_id,
            unitid=unit_id,
            startdate=start_date,
            enddate=None,
            status="Pending",
            generated_contract=generated_contract or "N/A",
            signed_contract=None
        )
        db.session.add(new_contract)
        db.session.commit()

        return jsonify({"message": "Contract issued successfully!"})

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to issue contract: {str(e)}"}), 500


# ✅ Tenant view their contracts
@contract_bp.route("/contracts/tenant/<int:tenant_id>", methods=["GET"])
def get_contracts_by_tenant(tenant_id):
    contracts = (
        db.session.query(
            Contract.contractid,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Contract.startdate,
            Contract.enddate,
            Contract.status,
            Contract.generated_contract,
            Contract.signed_contract
        )
        .join(Unit, Contract.unitid == Unit.unitid)
        .filter(Contract.tenantid == tenant_id)
        .all()
    )

    result = [
        {
            "contractid": contractid,
            "unit_name": unit_name,
            "unit_price": unit_price,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
            "status": status,
            "generated_contract": generated_contract,
            "signed_contract": signed_contract
        }
        for contractid, unit_name, unit_price, start_date, end_date, status, generated_contract, signed_contract in contracts
    ]

    return jsonify(result)


# ✅ Tenant sign contract (upload signed PDF)
@contract_bp.route("/contracts/sign", methods=["POST"])
def sign_contract():
    from PyPDF2 import PdfReader, PdfWriter
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from io import BytesIO
    from PIL import Image

    try:
        if "signed_contract" not in request.files:
            return jsonify({"error": "No signature file provided"}), 400

        file = request.files["signed_contract"]
        contract_id = request.form.get("contractid")

        if not contract_id or file.filename == "":
            return jsonify({"error": "Missing contract ID or file"}), 400

        # ✅ Find contract in DB
        contract = Contract.query.filter_by(contractid=contract_id).first()
        if not contract:
            return jsonify({"error": "Contract not found"}), 404

        uploads_root = current_app.config["UPLOAD_FOLDER"]
        signed_folder = os.path.join(uploads_root, "signed_contracts")
        os.makedirs(signed_folder, exist_ok=True)

        contract_path = os.path.join(uploads_root, "contracts", contract.generated_contract)
        signed_pdf_path = os.path.join(signed_folder, f"signed_{contract.contractid}.pdf")

        # ✅ Save signature temporarily
        sig_temp_path = os.path.join(signed_folder, "temp_signature.png")
        file.save(sig_temp_path)

        # ✅ Fix transparency (remove black box)
        sig = Image.open(sig_temp_path)
        if sig.mode == "RGBA":
            white_bg = Image.new("RGB", sig.size, (255, 255, 255))
            white_bg.paste(sig, mask=sig.split()[3])  # use alpha channel as mask
            sig = white_bg
            sig.save(sig_temp_path)

        # ✅ Create signature overlay PDF
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=A4)
        c.drawImage(sig_temp_path, 110, 160, width=150, height=60, mask='auto')  # adjust placement
        c.save()
        packet.seek(0)

        overlay_pdf = PdfReader(packet)
        reader = PdfReader(contract_path)
        writer = PdfWriter()

        # Merge first page
        page = reader.pages[0]
        page.merge_page(overlay_pdf.pages[0])
        writer.add_page(page)

        # Copy remaining pages if any
        for i in range(1, len(reader.pages)):
            writer.add_page(reader.pages[i])

        # ✅ Save final signed PDF
        with open(signed_pdf_path, "wb") as output_pdf:
            writer.write(output_pdf)

        # ✅ Update DB
        contract.signed_contract = os.path.basename(signed_pdf_path)
        contract.status = "Signed"
        db.session.commit()

        # Cleanup temp
        os.remove(sig_temp_path)

        return jsonify({
            "message": "Contract signed and merged successfully!",
            "filename": contract.signed_contract
        })

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to sign contract: {str(e)}"}), 500




