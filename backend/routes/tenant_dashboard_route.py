from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from models.users_model import User
from models.tenants_model import Tenant
from models.applications_model import Application
from models.contracts_model import Contract
from models.bills_model import Bill
from models.transaction_model import Transaction
from models.concerns_model import Concern
from models.units_model import House as Unit
from models.notifications_model import Notification

tenant_dashboard_bp = Blueprint('tenant_dashboard_bp', __name__)

@tenant_dashboard_bp.route('/tenant/dashboard/<int:tenant_id>', methods=['GET'])
def get_tenant_dashboard(tenant_id):
    try:
        print(f"=== Starting dashboard for tenant_id: {tenant_id} ===")
        
        # Get tenant record
        tenant = Tenant.query.get(tenant_id)
        print(f"Tenant found: {tenant}")
        if not tenant:
            return jsonify({"error": "Tenant record not found"}), 404

        # Get user data
        current_user = User.query.get(tenant.userid)
        print(f"User found: {current_user}")
        if not current_user:
            return jsonify({"error": "User not found"}), 404

        # Get active contract
        active_contract = Contract.query.filter_by(
            tenantid=tenant_id, 
            status="Active"
        ).first()
        print(f"Active contract: {active_contract}")

        # Get tenant data
        tenant_data = {
            "name": f"{current_user.firstname} {current_user.lastname}",
            "unit": "N/A",
            "leaseStartDate": "N/A"
        }

        if active_contract:
            unit = Unit.query.get(active_contract.unitid)
            print(f"Unit found: {unit}")
            if unit:
                tenant_data["unit"] = unit.name
            tenant_data["leaseStartDate"] = active_contract.startdate

        # Get current bills (unpaid and pending)
        current_bills = Bill.query.filter_by(
            tenantid=tenant_id
        ).filter(
            Bill.status.in_(["Unpaid", "Pending"])
        ).order_by(Bill.duedate.asc()).all()
        print(f"Current bills count: {len(current_bills)}")

        bills_data = []
        for bill in current_bills:
            bills_data.append({
                "billid": bill.billid,
                "billType": bill.billtype,
                "amount": f"₱{bill.amount:,.2f}",
                "dueDate": bill.duedate,
                "status": bill.status,
                "action": "Pay Now" if bill.status == "Unpaid" else "View"
            })

        # Get transaction history
        transactions = Transaction.query.filter_by(tenantid=tenant_id).order_by(Transaction.paymentdate.desc()).limit(20).all()
        print(f"Transactions count: {len(transactions)}")

        # FIXED: Group transactions by month - handle both string and date objects
        monthly_totals = {}
        for transaction in transactions:
            if transaction.paymentdate:
                try:
                    # Handle both string and date objects safely
                    if isinstance(transaction.paymentdate, str):
                        # If it's a string, extract YYYY-MM
                        month_key = transaction.paymentdate[:7]
                    else:
                        # If it's a date/datetime object, format it
                        month_key = transaction.paymentdate.strftime('%Y-%m')
                    
                    amount = float(transaction.amountpaid) if transaction.amountpaid else 0.0
                    if month_key in monthly_totals:
                        monthly_totals[month_key] += amount
                    else:
                        monthly_totals[month_key] = amount
                except Exception as e:
                    print(f"Error processing transaction date: {e}")
                    continue

        print(f"Monthly totals: {monthly_totals}")

        # Get last 4 months data
        transaction_data = []
        today = datetime.now()
        for i in range(4):
            month_date = today - timedelta(days=30*i)
            month_key = month_date.strftime('%Y-%m')
            month_name = month_date.strftime('%b')
            amount = monthly_totals.get(month_key, 0)
            
            # Calculate bar height (dynamic scaling)
            max_amount = max(monthly_totals.values()) if monthly_totals else 1
            height_ratio = amount / max_amount if max_amount > 0 else 0
            height = f"{50 + (height_ratio * 70)}px"
            
            transaction_data.append({
                "month": month_name,
                "amount": f"₱{amount:,.0f}",
                "height": height,
                "value": amount
            })

        transaction_data.reverse()

        # Calculate dashboard statistics
        unpaid_bills = [bill for bill in current_bills if bill.status == "Unpaid"]
        total_balance = sum(bill.amount for bill in unpaid_bills) if unpaid_bills else 0
        
        # Find next due date - handle both string and date objects
        next_due_date = None
        for bill in current_bills:
            if bill.status == "Unpaid" and bill.duedate:
                try:
                    if isinstance(bill.duedate, str):
                        bill_due = datetime.strptime(bill.duedate, '%Y-%m-%d').date()
                    else:
                        bill_due = bill.duedate
                    
                    if not next_due_date or bill_due < next_due_date:
                        next_due_date = bill_due
                except Exception as e:
                    print(f"Error processing bill due date: {e}")
                    continue

        # Get pending concerns count
        pending_concerns = Concern.query.filter_by(
            tenantid=tenant_id,
            status="Pending"
        ).count()
        print(f"Pending concerns: {pending_concerns}")

        # Get recent notifications
        recent_notifications = Notification.query.filter(
            (Notification.targetuserid == current_user.userid) | 
            (Notification.targetuserrole == "Tenant")
        ).order_by(Notification.creationdate.desc()).limit(5).all()
        print(f"Notifications count: {len(recent_notifications)}")

        notifications_data = [{
            "id": notif.notificationid,
            "title": notif.title,
            "message": notif.message,
            "date": notif.creationdate.strftime('%Y-%m-%d %H:%M') if notif.creationdate else "N/A",
            "isRead": False
        } for notif in recent_notifications]

        # Calculate financial stats
        total_paid = sum(float(t.amountpaid) for t in transactions if t.amountpaid) if transactions else 0
        average_monthly = total_paid / len(monthly_totals) if monthly_totals else 0

        # Format next due date for response
        next_due_display = next_due_date.strftime('%Y-%m-%d') if next_due_date else "No pending bills"

        dashboard_stats = {
            "currentBillsCount": len(unpaid_bills),
            "nextDueDate": next_due_display,
            "totalBalance": total_balance,
            "averageMonthly": average_monthly,
            "totalPaid": total_paid,
            "pendingConcerns": pending_concerns
        }

        print(f"=== Dashboard data prepared successfully ===")
        print(f"Next due date: {next_due_display}")
        print(f"Total balance: {total_balance}")
        print(f"Average monthly: {average_monthly}")
        
        return jsonify({
            "success": True,
            "tenantData": tenant_data,
            "billsData": bills_data,
            "transactionData": transaction_data,
            "dashboardStats": dashboard_stats,
            "notifications": notifications_data,
            "quickActions": [
                {"label": "Pay Bills", "icon": "dollar", "color": "blue", "path": "/payments"},
                {"label": "View History", "icon": "file-text", "color": "green", "path": "/history"},
                {"label": "Report Issue", "icon": "bell", "color": "orange", "path": "/report-issue"}
            ]
        })

    except Exception as e:
        print(f"=== ERROR in dashboard route ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@tenant_dashboard_bp.route('/tenant/quick-stats/<int:tenant_id>', methods=['GET'])
def get_quick_stats(tenant_id):
    """Endpoint for quick stats that can be refreshed frequently"""
    try:
        tenant = Tenant.query.get(tenant_id)
        
        if not tenant:
            return jsonify({"error": "Tenant not found"}), 404

        # Count unpaid bills
        unpaid_count = Bill.query.filter_by(
            tenantid=tenant_id, 
            status="Unpaid"
        ).count()

        # Count pending concerns
        pending_concerns = Concern.query.filter_by(
            tenantid=tenant_id,
            status="Pending"
        ).count()

        # Count unread notifications
        unread_notifications = Notification.query.filter(
            (Notification.targetuserid == tenant.userid) | 
            (Notification.targetuserrole == "Tenant")
        ).count()

        return jsonify({
            "unpaidBills": unpaid_count,
            "pendingConcerns": pending_concerns,
            "unreadNotifications": unread_notifications
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500