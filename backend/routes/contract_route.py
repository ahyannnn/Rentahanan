from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from extensions import db
from models.contracts_model import Contract
from models.tenants_model import Tenant
from models.units_model import House as Unit
from models.applications_model import Application
from models.users_model import User
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os, traceback

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

        if not tenant_id or not tenant_name:
            return jsonify({"error": "Missing tenant information"}), 400

        # ✅ Save file under backend/uploads/contracts
        contracts_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "contracts")
        os.makedirs(contracts_folder, exist_ok=True)

        filename = f"contract_{tenant_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        file_path = os.path.join(contracts_folder, filename)

        # Generate PDF
        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4

        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(width / 2, height - 80, "RENTAL AGREEMENT")
        c.setFont("Helvetica", 14)
        c.drawCentredString(width / 2, height - 110, "RenTahanan Property Management")

        c.setFont("Helvetica", 12)
        text = c.beginText(50, height - 160)
        lines = [
            f"This Rental Agreement is made between RenTahanan (the 'Owner') and {tenant_name} (the 'Tenant').",
            "",
            f"Unit: {unit_name}",
            f"Start Date: {start_date}",
            f"Monthly Rent: ₱{rent}",
            f"Deposit: ₱{deposit}",
            f"Advance Payment: ₱{advance}",
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

        c.line(100, 150, 250, 150)
        c.drawString(130, 135, f"{tenant_name} (Tenant)")
        c.line(350, 150, 500, 150)
        c.drawString(370, 135, "RenTahanan (Owner) ✔")
        c.save()

        # ✅ Generate web-accessible URL instead of file path
        public_url = f"http://localhost:5000/uploads/contracts/{filename}"

        return jsonify({
            "message": "Contract PDF generated successfully!",
            "pdf_url": public_url
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

        # if bills contractid null, set to this contractid 
        tenant = Tenant.query.filter_by(tenantid=tenant_id).first()
        if tenant:
            bills = db.session.query(Contract).filter(
                Contract.tenantid == tenant_id,
                Contract.contractid != new_contract.contractid
            ).all()
            for bill in bills:
                bill.contractid = new_contract.contractid

        db.session.commit()
        return jsonify({"message": "Contract issued successfully!"})

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to issue contract: {str(e)}"}), 500
