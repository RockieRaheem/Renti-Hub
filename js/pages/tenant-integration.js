// Tenant Directory Integration Script
// Include this file in tenant_directory/code.html

document.addEventListener('DOMContentLoaded', async function () {
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

        const userRole = authService.getUserRole();

        // If tenant, show their dashboard
        if (userRole === 'tenant') {
            await loadTenantDashboard();
        } else {
            // If manager/owner/admin, show all tenants
            await loadAllTenants();
        }
    });
});

// ==================== TENANT DASHBOARD (For Tenant Role) ====================

async function loadTenantDashboard() {
    try {
        showLoading('Loading your dashboard...');

        const user = authService.getCurrentUser();

        // Find tenant by email
        const tenants = await dbService.query('tenants', [
            { field: 'email', operator: '==', value: user.email }
        ]);

        if (!tenants.success || tenants.data.length === 0) {
            hideLoading();
            showToast('Tenant profile not found. Please contact management.', 'error');
            return;
        }

        const tenantId = tenants.data[0].id;
        const dashboardData = await dashboard.getTenantDashboard(tenantId);

        if (!dashboardData.success) {
            hideLoading();
            showToast('Failed to load dashboard', 'error');
            return;
        }

        renderTenantDashboard(dashboardData.data);
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading tenant dashboard:', error);
        showToast('Error loading dashboard', 'error');
    }
}

function renderTenantDashboard(data) {
    const container = document.getElementById('tenantDashboard');
    if (!container) return;

    const balance = data.balance.balance || 0;
    const balanceClass = balance > 0 ? 'text-red-600' : 'text-green-600';

    container.innerHTML = `
    <div class="space-y-6">
      <!-- Balance Card -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Your Account</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <p class="text-gray-600 text-sm">Current Balance</p>
            <p class="text-3xl font-bold ${balanceClass}">${formatCurrency(balance)}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Monthly Rent</p>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(data.balance.monthlyRent || 0)}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Total Paid</p>
            <p class="text-2xl font-bold text-green-600">${formatCurrency(data.totalPaid)}</p>
          </div>
        </div>
      </div>

      <!-- Shop Info -->
      ${data.currentShop ? `
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4">Your Shop</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">Shop Number</p>
              <p class="text-2xl font-bold">${data.currentShop.shopNumber}</p>
            </div>
            ${data.currentLease ? `
              <div>
                <p class="text-gray-600">Lease Expires</p>
                <p class="font-semibold">${formatDate(data.currentLease.endDate)}</p>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Recent Payments -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">Recent Payments</h3>
        <div class="space-y-3">
          ${data.payments.slice(0, 5).map(payment => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p class="font-semibold">${formatCurrency(payment.amount)}</p>
                <p class="text-sm text-gray-600">${formatDate(payment.paymentDate)}</p>
              </div>
              <button onclick="viewReceipt('${payment.id}')" class="text-blue-600 hover:text-blue-700">
                View Receipt
              </button>
            </div>
          `).join('') || '<p class="text-gray-500">No payments yet</p>'}
        </div>
      </div>

      <!-- Maintenance Requests -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Maintenance Requests</h3>
          <button onclick="openNewMaintenanceModal()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container">
            New Request
          </button>
        </div>
        <div class="space-y-3">
          ${data.maintenanceRequests.slice(0, 5).map(request => {
        const statusClass = request.status === 'completed' ? 'bg-green-100 text-green-800' :
            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800';
        return `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p class="font-semibold">${request.title}</p>
                  <p class="text-sm text-gray-600">${formatDate(request.reportedDate)}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                  ${request.status}
                </span>
              </div>
            `;
    }).join('') || '<p class="text-gray-500">No maintenance requests</p>'}
        </div>
      </div>
    </div>
  `;
}

// ==================== ALL TENANTS (For Manager/Owner/Admin) ====================

async function loadAllTenants() {
    try {
        showLoading('Loading tenants...');
        const result = await tenantMgmt.getAllTenants();

        if (result.success) {
            renderTenantsTable(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading tenants:', error);
        showToast('Failed to load tenants', 'error');
    }
}

function renderTenantsTable(tenants) {
    const tableBody = document.getElementById('tenantsTable');
    if (!tableBody) return;

    if (tenants.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No tenants found</td></tr>';
        return;
    }

    tableBody.innerHTML = tenants.map(tenant => `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 font-semibold">${tenant.fullName}</td>
      <td class="px-4 py-3">${tenant.phone}</td>
      <td class="px-4 py-3">${tenant.email || 'N/A'}</td>
      <td class="px-4 py-3">${tenant.businessName || 'N/A'}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          ${tenant.status}
        </span>
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <button onclick="viewTenantDetails('${tenant.id}')" class="text-blue-600 hover:text-blue-700">
            <span class="material-symbols-outlined text-sm">visibility</span>
          </button>
          <button onclick="editTenant('${tenant.id}')" class="text-gray-600 hover:text-gray-700">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button onclick="sendReminder('${tenant.id}')" class="text-orange-600 hover:text-orange-700" title="Send Reminder">
            <span class="material-symbols-outlined text-sm">notifications</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==================== ADD TENANT ====================

document.getElementById('addTenantForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById('fullName').value,
        nationalId: document.getElementById('nationalId').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        businessName: document.getElementById('businessName').value,
        businessType: document.getElementById('businessType').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        address: document.getElementById('address').value
    };

    const result = await tenantMgmt.createTenant(formData);

    if (result.success) {
        closeModal('addTenantModal');
        this.reset();
        await loadAllTenants();
    }
});

// ==================== HELPER FUNCTIONS ====================

async function viewTenantDetails(tenantId) {
    try {
        showLoading('Loading tenant details...');

        const tenant = await tenantMgmt.getTenant(tenantId);
        const balance = await tenantMgmt.getTenantBalance(tenantId);
        const payments = await tenantMgmt.getTenantPayments(tenantId);

        hideLoading();

        if (!tenant.success) {
            showToast('Failed to load tenant details', 'error');
            return;
        }

        // Display tenant details in modal
        showTenantDetailsModal(tenant.data, balance, payments.data);
    } catch (error) {
        hideLoading();
        console.error('Error viewing tenant:', error);
        showToast('Failed to load tenant details', 'error');
    }
}

function showTenantDetailsModal(tenant, balance, payments) {
    // Implementation depends on your modal system
    showToast('Tenant: ' + tenant.fullName + ' - Balance: ' + formatCurrency(balance.balance), 'info');
}

async function sendReminder(tenantId) {
    showConfirmDialog('Send rent reminder to this tenant?', async () => {
        const tenant = await tenantMgmt.getTenant(tenantId);
        const balance = await tenantMgmt.getTenantBalance(tenantId);

        if (tenant.success && balance.success && balance.balance > 0) {
            await tenantMgmt.sendReminder(
                tenantId,
                `Rent reminder: Your balance is ${formatCurrency(balance.balance)}. Please make payment.`
            );
        } else {
            showToast('No outstanding balance', 'info');
        }
    });
}

// Search tenants
document.getElementById('searchTenants')?.addEventListener('input', debounce(async function (e) {
    const searchTerm = e.target.value;

    if (searchTerm.length >= 2) {
        const result = await tenantMgmt.searchTenants(searchTerm);

        if (result.success) {
            renderTenantsTable(result.data);
        }
    } else if (searchTerm.length === 0) {
        await loadAllTenants();
    }
}, 300));

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}
