from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from werkzeug.utils import secure_filename
from extensions import db
from models.contracts_model import Contract
from models.tenants_model import Tenant
from models.units_model import House as Unit
from models.applications_model import Application
from models.users_model import User
from models.notifications_model import Notification
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os, traceback
from flask import send_from_directory
from PyPDF2 import PdfReader, PdfWriter

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
            User.image,
            Unit.name.label("unit_name"),
            Unit.price.label("unit_price"),
            Contract.startdate,
            Contract.enddate,
            Contract.status,
            Contract.signed_contract
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
            "image":image,
            "unit_name": unit_name,
            "unit_price": unit_price,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
            "status": status,
            "signed_contract": signed_contract
        }
        for contractid, tenantid, firstname, middlename, lastname, image, unit_name, unit_price, start_date, end_date, status, signed_contract in contracts
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
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4, letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
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

        # ✅ Create professional PDF document
        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ContractTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=20,
            alignment=1
        )
        
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        normal_style = ParagraphStyle(
            'ContractNormal',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            leading=14
        )
        
        bold_style = ParagraphStyle(
            'ContractBold',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            fontWeight='bold'
        )

        # Header
        header = Paragraph("RENTAL AGREEMENT CONTRACT", title_style)
        story.append(header)
        
        company_subheader = Paragraph("RenTahanan Property Management", styles['Heading2'])
        story.append(company_subheader)
        story.append(Spacer(1, 20))

        # Contract Information Table
        contract_info = [
            ['CONTRACT DETAILS', ''],
            ['Contract Date:', datetime.now().strftime("%B %d, %Y")],
            ['Contract ID:', f'RT-{int(tenant_id):06d}'],
            ['', '']
        ]
        
        contract_table = Table(contract_info, colWidths=[2*inch, 4*inch])
        contract_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8F9FA')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),  # Labels in bold
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),      # Values in normal
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        story.append(contract_table)
        story.append(Spacer(1, 20))

        # Parties Section
        parties_text = """
        This Rental Agreement ("Agreement") is made and entered into on this date between:
        """
        story.append(Paragraph(parties_text, normal_style))
        story.append(Spacer(1, 10))

        # Parties Table
        parties_data = [
            ['PARTY', 'INFORMATION'],
            ['LANDLORD/Owner:', 'RenTahanan Property Management<br/>Duly represented by its authorized agent'],
            ['TENANT/Lessee:', f'{tenant_name}<br/>Tenant ID: {tenant_id}']
        ]
        
        parties_table = Table(parties_data, colWidths=[2*inch, 4*inch])
        parties_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FFFFFF')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        story.append(parties_table)
        story.append(Spacer(1, 20))

        # Property Details Section - FIXED: Replace peso sign with PHP
        story.append(Paragraph("PROPERTY DETAILS", section_style))
        
        # Format amounts with PHP instead of peso sign
        rent_formatted = f"PHP {float(rent):,.2f}"
        deposit_formatted = f"PHP {float(deposit):,.2f}"
        advance_formatted = f"PHP {float(advance):,.2f}"
        
        property_data = [
            ['Unit/Room:', unit_name],
            ['Commencement Date:', start_date],
            ['Monthly Rental:', rent_formatted],
            ['Security Deposit:', deposit_formatted],
            ['Advance Payment:', advance_formatted]
        ]
        
        property_table = Table(property_data, colWidths=[2*inch, 4*inch])
        property_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),  # Labels in bold
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),       # Values in normal
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(property_table)
        
        if remarks and remarks.strip():
            story.append(Spacer(1, 10))
            remarks_para = Paragraph(f"<b>Special Remarks:</b> {remarks}", normal_style)
            story.append(remarks_para)

        story.append(Spacer(1, 20))

        # Terms and Conditions
        story.append(Paragraph("TERMS AND CONDITIONS", section_style))
        
        terms = [
            "1. The Tenant shall pay the monthly rent on or before the 5th day of each month.",
            "2. The security deposit shall be refundable upon termination, subject to property inspection.",
            "3. The Tenant shall maintain the property in good condition and report any damages promptly.",
            "4. Subletting or assignment of the property requires prior written consent from the Landlord.",
            "5. The Landlord reserves the right to conduct property inspections with reasonable notice.",
            "6. Utilities and other charges shall be the responsibility of the Tenant unless otherwise stated.",
            "7. Early termination of this Agreement may result in forfeiture of the security deposit.",
            "8. The Tenant shall comply with all building rules and regulations."
        ]
        
        for term in terms:
            story.append(Paragraph(term, normal_style))
            story.append(Spacer(1, 5))

        story.append(Spacer(1, 30))

        # Signatures Section - FIXED: Add more space to prevent overlap
        story.append(Paragraph("ACKNOWLEDGED AND AGREED", section_style))
        
        # Create signature table with proper spacing
        sig_data = [
            ['', 'TENANT', 'LANDLORD'],
            ['Name:', tenant_name, 'RenTahanan Property Management'],
            ['Signature:', '', ''],
            ['', '', ''],  # Extra row for signature space
            ['', '', ''],
            ['Date:', datetime.now().strftime("%Y-%m-%d"), datetime.now().strftime("%Y-%m-%d")]
        ]
        
        sig_table = Table(sig_data, colWidths=[1.5*inch, 2.5*inch, 2.5*inch])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ECF0F1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD')),
            ('SPAN', (2, 3), (2, 4)),  # Span signature rows for landlord
            ('SPAN', (1, 3), (1, 4)),  # Span signature rows for tenant
        ]))
        
        story.append(sig_table)
        story.append(Spacer(1, 60))  # Increased space after signatures

        # Build the PDF
        doc.build(story)

        # ✅ Add signatures to the final PDF using canvas (if provided)
        if owner_signature_data:
            try:
                # Reopen the PDF to add signatures
                packet = io.BytesIO()
                can = canvas.Canvas(packet, pagesize=letter)
                
                # Process owner signature
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

                # FIXED: Position for landlord signature - moved to avoid overlap
                # Adjusted coordinates to place signature in the designated area
                can.drawImage(signature_reader, 320, 100, width=120, height=40, mask='auto')
                
                can.save()

                # Merge the signature page with the original PDF
                packet.seek(0)
                new_pdf = PdfReader(packet)
                existing_pdf = PdfReader(open(file_path, "rb"))
                output = PdfWriter()

                # Merge signatures onto the last page
                page = existing_pdf.pages[0]
                page.merge_page(new_pdf.pages[0])
                output.add_page(page)

                # Save the final PDF with signatures
                with open(file_path, "wb") as output_stream:
                    output.write(output_stream)
                    
            except Exception as sig_error:
                print(f"Signature addition failed, but PDF was generated: {sig_error}")

        public_url = f"http://localhost:5000/uploads/contracts/{filename}"

        return jsonify({
            "message": "Professional contract PDF generated successfully!",
            "pdf_url": public_url,
            "filename": filename,
            "contract_id": f"RT-{int(tenant_id):06d}"
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
        db.session.flush()  # Get contract ID without committing

        # ✅ Get tenant info for notification
        tenant = Tenant.query.filter_by(tenantid=tenant_id).first()
        unit = Unit.query.filter_by(unitid=unit_id).first()

        if tenant:
            # ✅ Create UNIFIED notification for tenant
            tenant_notification = Notification(
                title='New Contract Issued',
                message=f'A new rental contract has been issued for {unit.name if unit else "your unit"}. Please review and sign the contract.',
                targetuserid=tenant.userid,  # Specific to this tenant
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

            # ✅ Create UNIFIED notification for ALL landlords
            all_landlords = User.query.filter_by(role='Owner').all()
            if all_landlords:
                landlord_notification = Notification(
                    title='New Contract Created',
                    message=f'New rental contract issued to tenant for {unit.name if unit else "a unit"}. Contract ID: {new_contract.contractid}',
                    targetuserrole='Owner',  # Target all landlords
                    isgroupnotification=True,
                    recipientcount=len(all_landlords),
                    createdbyuserid=tenant.userid
                )
                db.session.add(landlord_notification)

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


# ✅ Tenant sign contract (upload signed PDF) - FIXED: Adjusted signature position
@contract_bp.route("/contracts/sign", methods=["POST"])
def sign_contract():
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
        
        # Check if original contract exists
        if not os.path.exists(contract_path):
            return jsonify({"error": "Original contract file not found"}), 404

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
        # FIXED: Adjusted signature position to avoid overlap
        c.drawImage(sig_temp_path, 110, 140, width=150, height=60, mask='auto')  # moved higher
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
        
        # ✅ Get tenant info for notification
        tenant = Tenant.query.filter_by(tenantid=contract.tenantid).first()
        unit = Unit.query.filter_by(unitid=contract.unitid).first()

        if tenant:
            # ✅ Create UNIFIED notification for tenant
            tenant_notification = Notification(
                title='Contract Signed',
                message=f'You have successfully signed the rental contract for {unit.name if unit else "your unit"}.',
                targetuserid=tenant.userid,  # Specific to this tenant
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

            # ✅ Create UNIFIED notification for ALL landlords
            all_landlords = User.query.filter_by(role='Owner').all()
            if all_landlords:
                landlord_notification = Notification(
                    title='Contract Signed by Tenant',
                    message=f'Tenant has signed the rental contract for {unit.name if unit else "a unit"}. Contract ID: {contract.contractid}',
                    targetuserrole='Owner',  # Target all landlords
                    isgroupnotification=True,
                    recipientcount=len(all_landlords),
                    createdbyuserid=tenant.userid
                )
                db.session.add(landlord_notification)

        db.session.commit()

        # Cleanup temp
        if os.path.exists(sig_temp_path):
            os.remove(sig_temp_path)

        return jsonify({
            "message": "Contract signed and merged successfully!",
            "filename": contract.signed_contract
        })

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to sign contract: {str(e)}"}), 500


# ✅ Download contract file
@contract_bp.route("/contracts/download/<filename>", methods=["GET"])
def download_contract(filename):
    """Download contract PDF file"""
    try:
        contracts_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "contracts")
        signed_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "signed_contracts")
        
        # Check in signed contracts first, then regular contracts
        if filename.startswith("signed_"):
            file_path = os.path.join(signed_folder, filename)
            if os.path.exists(file_path):
                return send_from_directory(signed_folder, filename, as_attachment=True)
        
        file_path = os.path.join(contracts_folder, filename)
        if os.path.exists(file_path):
            return send_from_directory(contracts_folder, filename, as_attachment=True)
        
        return jsonify({"error": "File not found"}), 404
        
    except Exception as e:
        return jsonify({"error": f"Failed to download file: {str(e)}"}), 500


# ✅ Update Contract Status (for landlords to approve/reject)
@contract_bp.route("/contracts/update-status/<int:contract_id>", methods=["PUT"])
def update_contract_status(contract_id):
    try:
        data = request.get_json()
        new_status = data.get("status")
        remarks = data.get("remarks", "")

        if not new_status:
            return jsonify({"error": "Missing status"}), 400

        contract = Contract.query.filter_by(contractid=contract_id).first()
        if not contract:
            return jsonify({"error": "Contract not found"}), 404

        old_status = contract.status
        contract.status = new_status

        # ✅ Get tenant info for notification
        tenant = Tenant.query.filter_by(tenantid=contract.tenantid).first()
        unit = Unit.query.filter_by(unitid=contract.unitid).first()

        if tenant:
            status_messages = {
                "Approved": "Your rental contract has been approved and is now active!",
                "Rejected": f"Your rental contract has been rejected. {remarks}",
                "Cancelled": f"Your rental contract has been cancelled. {remarks}",
                "Expired": "Your rental contract has expired."
            }

            message = status_messages.get(new_status, f"Contract status updated to {new_status}.")

            # ✅ Create UNIFIED notification for tenant
            tenant_notification = Notification(
                title=f'Contract {new_status}',
                message=message,
                targetuserid=tenant.userid,  # Specific to this tenant
                isgroupnotification=False,
                recipientcount=1,
                createdbyuserid=tenant.userid
            )
            db.session.add(tenant_notification)

        db.session.commit()

        return jsonify({"message": f"Contract status updated to {new_status} successfully!"})

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating contract status: {e}")
        return jsonify({"error": f"Failed to update contract status: {str(e)}"}), 500