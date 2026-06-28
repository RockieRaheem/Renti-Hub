// Executive Dashboard Integration Script
// Include this file in executive_dashboard/code.html

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize services
  initializeFirebase();
  dbService.init();
  
  // Check authentication
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '/login.html';
      return;
    }

    await authService.loadUserRole(user.uid);
    
    // Check if user has permission to view dashboard
    if (!authService.hasPermission('owner')) {
      showToast('Unauthorized access', 'error');
      await authService.logout();
      return;
    }

    // Load dashboard data
    await loadDashboard();
  });
});

async function loadDashboard() {
  try {
    showLoading('Loading dashboard...');

    const dashboardData = await dashboard.getOwnerDashboard();

    if (!dashboardData.success) {
      showToast('Failed to load dashboard', 'error');
      return;
    }

    const data = dashboardData.data;

    // Update KPI cards
    updateElement('totalRevenue', formatCurrency(data.totalRevenue));
    updateElement('expectedRevenue', formatCurrency(data.expectedRevenue));
    updateElement('collectionRate', data.collectionRate + '%');
    updateElement('todayCollections', formatCurrency(data.todayCollections));
    
    updateElement('occupiedShops', data.occupancy.occupied || 0);
    updateElement('totalShops', data.occupancy.total || 0);
    updateElement('vacantShops', data.occupancy.vacant || 0);
    updateElement('occupancyRate', data.occupancy.occupancyRate + '%');
    
    updateElement('outstandingRent', formatCurrency(data.outstanding));
    updateElement('outstandingCount', data.outstandingCount);
    
    updateElement('pendingMaintenance', data.maintenanceStats.pending || 0);
    updateElement('totalMaintenance', data.maintenanceStats.total || 0);

    // Render revenue trend chart (if using Chart.js or similar)
    if (typeof renderRevenueChart === 'function') {
      renderRevenueChart(data.revenueTrend);
    }

    // Render recent payments table
    renderRecentPayments(data.recentPayments);

    hideLoading();
  } catch (error) {
    hideLoading();
    console.error('Error loading dashboard:', error);
    showToast('Error loading dashboard', 'error');
  }
}

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function renderRecentPayments(payments) {
  const tableBody = document.getElementById('recentPaymentsTable');
  if (!tableBody) return;

  if (payments.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No recent payments</td></tr>';
    return;
  }

  tableBody.innerHTML = payments.map(payment => `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3">${formatDate(payment.paymentDate)}</td>
      <td class="px-4 py-3">${payment.tenantId}</td>
      <td class="px-4 py-3">${payment.shopId}</td>
      <td class="px-4 py-3 font-semibold">${formatCurrency(payment.amount)}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          ${payment.paymentMethod}
        </span>
      </td>
    </tr>
  `).join('');
}

// Refresh dashboard every 5 minutes
setInterval(loadDashboard, 5 * 60 * 1000);
