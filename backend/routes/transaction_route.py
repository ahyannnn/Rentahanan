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

        receipt_filename = f"receipt_{bill.billid}.pdf"
        receipt_path = os.path.join(receipts_folder, receipt_filename)

        # 🧾 Generate PDF using ReportLab
        c = canvas.Canvas(receipt_path)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(300, 800, "RECEIPT")

        c.setFont("Helvetica", 12)
        c.drawString(50, 750, f"Tenant ID: {tenant.tenantid}")
        c.drawString(50, 730, f"Bill ID: {bill.billid}")
        c.drawString(50, 710, f"Tenant Name: {full_name}")
        c.drawString(50, 690, f"Amount Paid: ₱{float(bill.amount):,.2f}")
        c.drawString(50, 670, f"Payment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        c.drawString(50, 650, f"Bill Type: {bill.billtype}")

        c.showPage()
        c.save()

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
            "receipt": receipt_filename
        })

    except Exception as e:
        db.session.rollback()
        if os.path.exists(receipt_path):
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
