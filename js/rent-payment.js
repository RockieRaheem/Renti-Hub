// Rent Collection & Payment Module for RentiHub

class RentPayment {
  constructor() {
    this.payments = [];
  }

  // Record new payment
  async recordPayment(paymentData) {
    try {
      // Validate required fields
      if (!paymentData.tenantId || !paymentData.shopId || !paymentData.amount) {
        showToast('Please fill in all required fields', 'error');
        return { success: false, error: 'Missing required fields' };
      }

      const amount = parseFloat(paymentData.amount);
      if (amount <= 0) {
        showToast('Payment amount must be greater than 0', 'error');
        return { success: false, error: 'Invalid amount' };
      }

      // Get tenant and shop details
      const tenant = await tenantMgmt.getTenant(paymentData.tenantId);
      const shop = await propertyMgmt.getShop(paymentData.shopId);

      if (!tenant.success || !shop.success) {
        showToast('Tenant or shop not found', 'error');
        return { success: false, error: 'Invalid tenant or shop' };
      }

      // Calculate balance before payment
      const balance = await tenantMgmt.getTenantBalance(paymentData.tenantId);
      const monthlyRent = balance.monthlyRent || shop.data.monthlyRent;
      const previousBalance = balance.balance || 0;
      const newBalance = previousBalance - amount;

      // Create payment record
      const payment = await dbService.create('payments', {
        tenantId: paymentData.tenantId,
        shopId: paymentData.shopId,
        amount: amount,
        monthlyRent: monthlyRent,
        previousBalance: previousBalance,
        newBalance: newBalance,
        paymentDate: firebase.firestore.Timestamp.fromDate(new Date(paymentData.paymentDate || new Date())),
        paymentMethod: paymentData.paymentMethod || 'cash',
        referenceNumber: paymentData.referenceNumber || '',
        notes: paymentData.notes || '',
        collectedBy: authService.getCurrentUser().uid,
        status: 'completed'
      });

      if (payment.success) {
        // Update tenant total paid
        await dbService.update('tenants', paymentData.tenantId, {
          totalPaid: firebase.firestore.FieldValue.increment(amount),
          totalArrears: newBalance > 0 ? newBalance : 0,
          lastPaymentDate: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Generate receipt
        const receipt = await this.generateReceipt(payment.id, {
          ...paymentData,
          amount,
          tenant: tenant.data,
          shop: shop.data,
          previousBalance,
          newBalance,
          monthlyRent
        });

        // Create notification
        await dbService.create('notifications', {
          tenantId: paymentData.tenantId,
          type: 'payment_confirmation',
          message: `Payment of ${formatCurrency(amount)} received. New balance: ${formatCurrency(newBalance)}`,
          phone: tenant.data.phone,
          email: tenant.data.email,
          status: 'pending'
        });

        await authService.createAuditLog(
          authService.getCurrentUser().uid,
          'PAYMENT_RECORDED',
          `Recorded payment of ${amount} for tenant ${tenant.data.fullName}`
        );

        showToast('Payment recorded successfully', 'success');

        return {
          success: true,
          paymentId: payment.id,
          receiptId: receipt.id,
          newBalance: newBalance
        };
      }

      return payment;
    } catch (error) {
      console.error('Error recording payment:', error);
      showToast('Failed to record payment', 'error');
      return { success: false, error: error.message };
    }
  }

  // Generate receipt
  async generateReceipt(paymentId, paymentData) {
    try {
      const receiptNumber = generateReceiptNumber();

      const receipt = await dbService.create('receipts', {
        receiptNumber: receiptNumber,
        paymentId: paymentId,
        tenantId: paymentData.tenantId,
        tenantName: paymentData.tenant.fullName,
        shopId: paymentData.shopId,
        shopNumber: paymentData.shop.shopNumber,
        amount: paymentData.amount,
        monthlyRent: paymentData.monthlyRent,
        previousBalance: paymentData.previousBalance,
        newBalance: paymentData.newBalance,
        paymentDate: firebase.firestore.Timestamp.fromDate(new Date(paymentData.paymentDate || new Date())),
        paymentMethod: paymentData.paymentMethod || 'cash',
        collectedBy: authService.getCurrentUser().uid,
        collectorName: localStorage.getItem('userName') || 'Property Manager'
      });

      return receipt;
    } catch (error) {
      console.error('Error generating receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all payments
  async getAllPayments() {
    try {
      const result = await dbService.readAll('payments', 'paymentDate', 'desc');
      if (result.success) {
        this.payments = result.data;
      }
      return result;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payments by date range
  async getPaymentsByDateRange(startDate, endDate) {
    try {
      const result = await dbService.query('payments', [
        { field: 'paymentDate', operator: '>=', value: firebase.firestore.Timestamp.fromDate(new Date(startDate)) },
        { field: 'paymentDate', operator: '<=', value: firebase.firestore.Timestamp.fromDate(new Date(endDate)) }
      ], { field: 'paymentDate', direction: 'desc' });
      return result;
    } catch (error) {
      console.error('Error fetching payments by date:', error);
      return { success: false, error: error.message };
    }
  }

  // Get today's collections
  async getTodayCollections() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await this.getPaymentsByDateRange(today, tomorrow);
      return result;
    } catch (error) {
      console.error('Error fetching today\'s collections:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment by ID
  async getPayment(paymentId) {
    return await dbService.read('payments', paymentId);
  }

  // Get receipt by payment ID
  async getReceiptByPaymentId(paymentId) {
    try {
      const result = await dbService.query('receipts', [
        { field: 'paymentId', operator: '==', value: paymentId }
      ]);
      return result;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Get receipt by receipt number
  async getReceiptByNumber(receiptNumber) {
    try {
      const result = await dbService.query('receipts', [
        { field: 'receiptNumber', operator: '==', value: receiptNumber }
      ]);
      return result;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate total collections
  async calculateTotalCollections(startDate = null, endDate = null) {
    try {
      let payments;
      
      if (startDate && endDate) {
        payments = await this.getPaymentsByDateRange(startDate, endDate);
      } else {
        payments = await this.getAllPayments();
      }

      if (!payments.success) {
        return { success: false, error: 'Failed to fetch payments' };
      }

      const total = payments.data.reduce((sum, payment) => sum + payment.amount, 0);
      const count = payments.data.length;

      return {
        success: true,
        total: total,
        count: count,
        average: count > 0 ? total / count : 0
      };
    } catch (error) {
      console.error('Error calculating collections:', error);
      return { success: false, error: error.message };
    }
  }

  // Get outstanding rent
  async getOutstandingRent() {
    try {
      const tenantsWithArrears = await tenantMgmt.getTenantsWithArrears();
      
      if (!tenantsWithArrears.success) {
        return { success: false, error: 'Failed to fetch arrears' };
      }

      const total = tenantsWithArrears.data.reduce((sum, tenant) => sum + tenant.arrears, 0);
      const count = tenantsWithArrears.data.length;

      return {
        success: true,
        total: total,
        count: count,
        tenants: tenantsWithArrears.data
      };
    } catch (error) {
      console.error('Error calculating outstanding rent:', error);
      return { success: false, error: error.message };
    }
  }

  // Print receipt
  printReceipt(receiptData) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.receiptNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .label {
            font-weight: bold;
          }
          .total {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            margin-top: 15px;
            padding: 10px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            border-top: 2px dashed #000;
            padding-top: 10px;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RentiHub</h1>
          <p>Rent Receipt</p>
        </div>
        
        <div class="row">
          <span class="label">Receipt No:</span>
          <span>${receiptData.receiptNumber}</span>
        </div>
        
        <div class="row">
          <span class="label">Date:</span>
          <span>${formatDate(receiptData.paymentDate)}</span>
        </div>
        
        <div class="row">
          <span class="label">Tenant:</span>
          <span>${receiptData.tenantName}</span>
        </div>
        
        <div class="row">
          <span class="label">Shop No:</span>
          <span>${receiptData.shopNumber}</span>
        </div>
        
        <div class="row">
          <span class="label">Monthly Rent:</span>
          <span>${formatCurrency(receiptData.monthlyRent)}</span>
        </div>
        
        <div class="row">
          <span class="label">Previous Balance:</span>
          <span>${formatCurrency(receiptData.previousBalance)}</span>
        </div>
        
        <div class="row total">
          <span class="label">Amount Paid:</span>
          <span>${formatCurrency(receiptData.amount)}</span>
        </div>
        
        <div class="row">
          <span class="label">New Balance:</span>
          <span>${formatCurrency(receiptData.newBalance)}</span>
        </div>
        
        <div class="row">
          <span class="label">Payment Method:</span>
          <span>${receiptData.paymentMethod.toUpperCase()}</span>
        </div>
        
        <div class="row">
          <span class="label">Collected By:</span>
          <span>${receiptData.collectorName}</span>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment</p>
          <p>Keep this receipt for your records</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

// Create global instance
const rentPayment = new RentPayment();
