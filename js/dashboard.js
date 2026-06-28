// Dashboard Module for RentiHub
// Provides role-specific dashboard data

class Dashboard {
  constructor() {
    this.refreshInterval = null;
  }

  // Initialize dashboard based on user role
  async initialize() {
    const userRole = authService.getUserRole();
    
    switch(userRole) {
      case 'admin':
      case 'owner':
        return await this.getOwnerDashboard();
      case 'manager':
        return await this.getManagerDashboard();
      case 'tenant':
        const userId = authService.getCurrentUser().uid;
        // Find tenant record by user email
        const user = authService.getCurrentUser();
        const tenants = await dbService.query('tenants', [
          { field: 'email', operator: '==', value: user.email }
        ]);
        if (tenants.data && tenants.data.length > 0) {
          return await this.getTenantDashboard(tenants.data[0].id);
        }
        return { success: false, error: 'Tenant record not found' };
      default:
        return { success: false, error: 'Unknown role' };
    }
  }

  // Owner/Admin Dashboard
  async getOwnerDashboard() {
    try {
      showLoading('Loading dashboard...');

      // Get total revenue (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyReport = await reportsMgmt.generateMonthlyReport(now.getMonth() + 1, now.getFullYear());

      // Get occupancy stats
      const occupancy = await propertyMgmt.getOccupancyStats();

      // Get outstanding rent
      const outstanding = await rentPayment.getOutstandingRent();

      // Get recent payments (last 10)
      const allPayments = await rentPayment.getAllPayments();
      const recentPayments = allPayments.data?.slice(0, 10) || [];

      // Get today's collections
      const todayCollections = await rentPayment.getTodayCollections();
      const todayTotal = todayCollections.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // Get maintenance stats
      const maintenanceStats = await maintenanceMgmt.getMaintenanceStats();

      // Calculate revenue trend (last 6 months)
      const revenueTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const report = await reportsMgmt.generateMonthlyReport(date.getMonth() + 1, date.getFullYear());
        revenueTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: report.data?.totalRevenue || 0
        });
      }

      hideLoading();

      return {
        success: true,
        data: {
          totalRevenue: monthlyReport.data?.totalRevenue || 0,
          expectedRevenue: monthlyReport.data?.expectedRevenue || 0,
          collectionRate: monthlyReport.data?.collectionRate || 0,
          todayCollections: todayTotal,
          occupancy: occupancy.data || {},
          outstanding: outstanding.total || 0,
          outstandingCount: outstanding.count || 0,
          recentPayments: recentPayments,
          maintenanceStats: maintenanceStats.data || {},
          revenueTrend: revenueTrend
        }
      };
    } catch (error) {
      hideLoading();
      console.error('Error loading owner dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Property Manager Dashboard
  async getManagerDashboard() {
    try {
      showLoading('Loading dashboard...');

      // Get today's collections
      const todayCollections = await rentPayment.getTodayCollections();
      const todayTotal = todayCollections.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // Get tenants due (with arrears)
      const tenantsDue = await tenantMgmt.getTenantsWithArrears();

      // Get pending maintenance requests
      const pendingMaintenance = await maintenanceMgmt.getPendingRequests();

      // Get this month's collections
      const now = new Date();
      const monthlyReport = await reportsMgmt.generateMonthlyReport(now.getMonth() + 1, now.getFullYear());

      // Get vacant shops
      const vacantShops = await propertyMgmt.getVacantShops();

      // Get recent payments
      const allPayments = await rentPayment.getAllPayments();
      const recentPayments = allPayments.data?.slice(0, 10) || [];

      hideLoading();

      return {
        success: true,
        data: {
          todayCollections: todayTotal,
          todayTransactions: todayCollections.data?.length || 0,
          monthlyCollections: monthlyReport.data?.totalRevenue || 0,
          tenantsDue: tenantsDue.data || [],
          tenantsDueCount: tenantsDue.data?.length || 0,
          pendingMaintenance: pendingMaintenance.data || [],
          pendingMaintenanceCount: pendingMaintenance.data?.length || 0,
          vacantShops: vacantShops.data || [],
          vacantShopsCount: vacantShops.data?.length || 0,
          recentPayments: recentPayments
        }
      };
    } catch (error) {
      hideLoading();
      console.error('Error loading manager dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Tenant Dashboard
  async getTenantDashboard(tenantId) {
    try {
      showLoading('Loading dashboard...');

      // Get tenant details
      const tenant = await tenantMgmt.getTenant(tenantId);

      // Get current balance
      const balance = await tenantMgmt.getTenantBalance(tenantId);

      // Get payment history
      const payments = await tenantMgmt.getTenantPayments(tenantId);

      // Get current lease
      const lease = await tenantMgmt.getTenantLease(tenantId);

      // Get maintenance requests
      const maintenanceRequests = await maintenanceMgmt.getRequestsByTenant(tenantId);

      // Get shop details
      let shop = null;
      if (lease.data && lease.data.length > 0) {
        const shopResult = await propertyMgmt.getShop(lease.data[0].shopId);
        shop = shopResult.data;
      }

      // Get receipts
      const receipts = [];
      for (const payment of payments.data || []) {
        const receiptResult = await rentPayment.getReceiptByPaymentId(payment.id);
        if (receiptResult.data && receiptResult.data.length > 0) {
          receipts.push(receiptResult.data[0]);
        }
      }

      hideLoading();

      return {
        success: true,
        data: {
          tenant: tenant.data,
          balance: balance,
          currentShop: shop,
          currentLease: lease.data && lease.data.length > 0 ? lease.data[0] : null,
          payments: payments.data || [],
          receipts: receipts,
          maintenanceRequests: maintenanceRequests.data || [],
          totalPaid: payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
          paymentsCount: payments.data?.length || 0
        }
      };
    } catch (error) {
      hideLoading();
      console.error('Error loading tenant dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Start auto-refresh
  startAutoRefresh(intervalMs = 60000) {
    this.stopAutoRefresh();
    
    this.refreshInterval = setInterval(async () => {
      console.log('Auto-refreshing dashboard...');
      await this.initialize();
    }, intervalMs);
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Get quick stats for any page header
  async getQuickStats() {
    try {
      const userRole = authService.getUserRole();
      
      if (userRole === 'admin' || userRole === 'owner' || userRole === 'manager') {
        const todayCollections = await rentPayment.getTodayCollections();
        const todayTotal = todayCollections.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

        const occupancy = await propertyMgmt.getOccupancyStats();
        const outstanding = await rentPayment.getOutstandingRent();

        return {
          todayCollections: todayTotal,
          occupiedShops: occupancy.data?.occupied || 0,
          totalShops: occupancy.data?.total || 0,
          outstandingRent: outstanding.total || 0
        };
      }

      return {};
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return {};
    }
  }
}

// Create global instance
const dashboard = new Dashboard();
