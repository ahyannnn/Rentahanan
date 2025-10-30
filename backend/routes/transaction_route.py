from flask import Blueprint, jsonify, current_app
from extensions import db
from models.bills_model import Bill
from models.tenants_model import Tenant
from models.transaction_model import Transaction
from models.users_model import User
from datetime import datetime
from reportlab.pdfgen import canvas
import os

transaction_bp = Blueprint("transactions", __name__)

@transaction_bp.route("/transactions/issue-receipt/<int:billid>", methods=["POST"])
def issue_receipt(billid):
    # Fetch the bill
    bill = db.session.query(Bill).filter(Bill.billid == billid).first()
    if not bill:
        return jsonify({"error": "Bill not found"}), 404

    if bill.status == "Paid":
        return jsonify({"error": "Bill already paid"}), 400

    # Fetch the tenant
    tenant = db.session.query(Tenant).filter(Tenant.tenantid == bill.tenantid).first()
    if not tenant:
        return jsonify({"error": "Tenant not found"}), 404

    # Fetch associated user info (name)
    user = db.session.query(User).filter(User.userid == tenant.userid).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # ✅ Build full name from user model
        firstname = getattr(user, "firstname", "")
        middlename = getattr(user, "middlename", "")
        lastname = getattr(user, "lastname", "")
        full_name = f"{firstname} {middlename + ' ' if middlename else ''}{lastname}".strip()

        # ✅ Use the configured UPLOAD_FOLDER (consistent with contracts)
        receipts_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "receipts")
        os.makedirs(receipts_folder, exist_ok=True)

        receipt_filename = f"receipt_{bill.billid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        receipt_path = os.path.join(receipts_folder, receipt_filename)

        # 🧾 Generate Professional PDF using ReportLab
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.lib.units import inch
        
        # Create PDF document
        doc = SimpleDocTemplate(
            receipt_path,
            pagesize=A4,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        # Story to hold elements
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E86AB'),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#333333'),
            spaceAfter=12
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666')
        )
        
        highlight_style = ParagraphStyle(
            'CustomHighlight',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#2E86AB'),
            fontWeight='bold'
        )

        # Company Header
        company_header = [
            Paragraph("<b>RENTAL MANAGEMENT SYSTEM</b>", title_style),
            Paragraph("Official Payment Receipt", styles['Heading2']),
            Spacer(1, 20)
        ]
        story.extend(company_header)

        # Receipt Details in a table format
        receipt_data = [
            ['RECEIPT INFORMATION', ''],
            ['Receipt Number:', f'<b>RMS-{bill.billid:06d}</b>'],
            ['Issue Date:', f'<b>{datetime.now().strftime("%B %d, %Y")}</b>'],
            ['Issue Time:', f'<b>{datetime.now().strftime("%I:%M %p")}</b>']
        ]
        
        receipt_table = Table(receipt_data, colWidths=[2.5*inch, 3.5*inch])
        receipt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8F9FA')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),  # Fixed: replaced 😎 with 8
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),  # Fixed: replaced 😎 with 8
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(receipt_table)
        story.append(Spacer(1, 20))

        # Tenant Information
        story.append(Paragraph("TENANT INFORMATION", header_style))
        tenant_data = [
            ['Tenant ID:', f'<b>{tenant.tenantid}</b>'],
            ['Full Name:', f'<b>{full_name}</b>'],
            ['Bill ID:', f'<b>{bill.billid}</b>']
        ]
        
        tenant_table = Table(tenant_data, colWidths=[1.5*inch, 4.5*inch])
        tenant_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(tenant_table)
        story.append(Spacer(1, 20))

        # Payment Details
        story.append(Paragraph("PAYMENT DETAILS", header_style))
        payment_data = [
            ['Description', 'Amount'],
            [f'{bill.billtype} Payment', f'<b>₱{float(bill.amount):,.2f}</b>']
        ]
        
        payment_table = Table(payment_data, colWidths=[4*inch, 2*inch])
        payment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('ALIGN', (0, 1), (0, 1), 'LEFT'),
            ('ALIGN', (1, 1), (1, 1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD'))
        ]))
        
        story.append(payment_table)
        story.append(Spacer(1, 30))

        # Total Amount
        total_data = [
            ['TOTAL PAID:', f'<b>₱{float(bill.amount):,.2f}</b>']
        ]
        
        total_table = Table(total_data, colWidths=[4*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A5276')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        
        story.append(total_table)
        story.append(Spacer(1, 30))

        # Footer
        footer_text = """
        <para alignment='center'>
        <font color='#666666' size=8>
        <b>Thank you for your payment!</b><br/>
        This receipt serves as an official record of your transaction.<br/>
        Please keep this document for your records.<br/>
        For any inquiries, please contact our administration office.
        </font>
        </para>
        """
        story.append(Paragraph(footer_text, normal_style))

        # Build PDF
        doc.build(story)

        # ✅ Update Bill status to Paid
        bill.status = "Paid"
        db.session.add(bill)

        # ✅ Add transaction record
        transaction = Transaction(
            billid=bill.billid,
            tenantid=bill.tenantid,
            paymentdate=datetime.now().strftime("%Y-%m-%d"),
            amountpaid=bill.amount,
            receipt=receipt_filename
        )
        db.session.add(transaction)

        # ✅ Commit all changes
        db.session.commit()

        return jsonify({
            "message": "Receipt issued successfully",
            "receipt": receipt_filename,
            "receipt_number": f"RMS-{bill.billid:06d}"
        })
    except Exception as e:
        db.session.rollback()
        if 'receipt_path' in locals() and os.path.exists(receipt_path):
            os.remove(receipt_path)
        return jsonify({"error": f"Failed to issue receipt: {str(e)}"}), 500


@transaction_bp.route("/transactions/receipt/<int:billid>", methods=["GET"])
def get_receipt(billid):
    try:
        # Find the transaction for this bill
        transaction = db.session.query(Transaction).filter(Transaction.billid == billid).first()
        
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404
        
        if not transaction.receipt:
            return jsonify({"error": "No receipt available for this transaction"}), 404
        
        # Just return the receipt filename
        return jsonify({
            "receiptUrl": transaction.receipt
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch receipt: {str(e)}"}), 500


@transaction_bp.route("/transactions/download-receipt/<int:billid>", methods=["GET"])
def download_receipt(billid):
    """Endpoint to download the actual receipt PDF file"""
    try:
        # Find the transaction for this bill
        transaction = db.session.query(Transaction).filter(Transaction.billid == billid).first()
        
        if not transaction or not transaction.receipt:
            return jsonify({"error": "Receipt not found"}), 404
        
        receipt_path = os.path.join(
            current_app.config["UPLOAD_FOLDER"], 
            "receipts", 
            transaction.receipt
        )
        
        if not os.path.exists(receipt_path):
            return jsonify({"error": "Receipt file not found"}), 404
            
        from flask import send_file
        return send_file(
            receipt_path,
            as_attachment=True,
            download_name=transaction.receipt,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": f"Failed to download receipt: {str(e)}"}), 500