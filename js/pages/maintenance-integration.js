// Maintenance Requests Integration Script
// Include this file in maintenance_requests/code.html

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

        // Load maintenance requests
        await loadMaintenanceRequests();
        await loadMaintenanceStats();
    });
});

// ==================== LOAD REQUESTS ====================

async function loadMaintenanceRequests(filterStatus = 'all') {
    try {
        showLoading('Loading requests...');

        let result;
        if (filterStatus === 'all') {
            result = await maintenanceMgmt.getAllRequests();
        } else {
            result = await maintenanceMgmt.getRequestsByStatus(filterStatus);
        }

        if (result.success) {
            renderMaintenanceRequests(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading requests:', error);
        showToast('Failed to load requests', 'error');
    }
}

function renderMaintenanceRequests(requests) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    if (requests.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No maintenance requests found</p>';
        return;
    }

    container.innerHTML = requests.map(request => {
        const statusClass = request.status === 'completed' ? 'bg-green-100 text-green-800' :
            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800';

        const priorityClass = request.priority === 'high' ? 'text-red-600' :
            request.priority === 'medium' ? 'text-orange-600' :
                'text-gray-600';

        return `
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">${request.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${request.description}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
            ${request.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p class="text-gray-600">Category</p>
            <p class="font-semibold">${request.category}</p>
          </div>
          <div>
            <p class="text-gray-600">Priority</p>
            <p class="font-semibold ${priorityClass}">${request.priority.toUpperCase()}</p>
          </div>
          <div>
            <p class="text-gray-600">Reported</p>
            <p class="font-semibold">${formatDate(request.reportedDate)}</p>
          </div>
          <div>
            <p class="text-gray-600">Estimated Cost</p>
            <p class="font-semibold">${formatCurrency(request.estimatedCost || 0)}</p>
          </div>
        </div>

        ${request.assignedToName ? `
          <div class="mb-4 p-3 bg-blue-50 rounded">
            <p class="text-sm text-gray-600">Assigned to</p>
            <p class="font-semibold">${request.assignedToName}</p>
          </div>
        ` : ''}

        <div class="flex gap-2">
          ${authService.getUserRole() !== 'tenant' ? `
            <button onclick="updateRequestStatus('${request.id}')" class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Update Status
            </button>
            ${request.status === 'pending' ? `
              <button onclick="assignTechnician('${request.id}')" class="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                Assign
              </button>
            ` : ''}
            <button onclick="updateCosts('${request.id}')" class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              Update Cost
            </button>
          ` : ''}
          <button onclick="viewRequestDetails('${request.id}')" class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            View Details
          </button>
        </div>
      </div>
    `;
    }).join('');
}

// ==================== STATISTICS ====================

async function loadMaintenanceStats() {
    try {
        const stats = await maintenanceMgmt.getMaintenanceStats();

        if (stats.success) {
            document.getElementById('totalRequests').textContent = stats.data.total || 0;
            document.getElementById('pendingRequests').textContent = stats.data.pending || 0;
            document.getElementById('inProgressRequests').textContent = stats.data.inProgress || 0;
            document.getElementById('completedRequests').textContent = stats.data.completed || 0;
            document.getElementById('totalMaintenanceCost').textContent = formatCurrency(stats.data.totalCost || 0);
            document.getElementById('avgCompletionTime').textContent = stats.data.averageCompletionDays + ' days';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== SUBMIT NEW REQUEST ====================

document.getElementById('newRequestForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = authService.getCurrentUser();

    // Find tenant by email
    const tenants = await dbService.query('tenants', [
        { field: 'email', operator: '==', value: user.email }
    ]);

    if (!tenants.success || tenants.data.length === 0) {
        showToast('Tenant profile not found', 'error');
        return;
    }

    const tenant = tenants.data[0];

    // Get tenant's shop
    const lease = await tenantMgmt.getTenantLease(tenant.id);

    if (!lease.success || lease.data.length === 0) {
        showToast('No active lease found', 'error');
        return;
    }

    const formData = {
        tenantId: tenant.id,
        shopId: lease.data[0].shopId,
        title: document.getElementById('requestTitle').value,
        description: document.getElementById('requestDescription').value,
        category: document.getElementById('requestCategory').value,
        priority: document.getElementById('requestPriority').value,
        estimatedCost: parseFloat(document.getElementById('estimatedCost').value || 0)
    };

    const result = await maintenanceMgmt.createRequest(formData);

    if (result.success) {
        closeModal('newRequestModal');
        this.reset();
        await loadMaintenanceRequests();
        await loadMaintenanceStats();
    }
});

// ==================== UPDATE STATUS ====================

async function updateRequestStatus(requestId) {
    // Show modal to select new status
    const newStatus = prompt('Enter new status (pending, in_progress, completed, cancelled):');

    if (!newStatus) return;

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
        showToast('Invalid status', 'error');
        return;
    }

    const notes = prompt('Add notes (optional):') || '';

    const result = await maintenanceMgmt.updateRequestStatus(requestId, newStatus.toLowerCase(), notes);

    if (result.success) {
        await loadMaintenanceRequests();
        await loadMaintenanceStats();
    }
}

// ==================== ASSIGN TECHNICIAN ====================

async function assignTechnician(requestId) {
    const technicianName = prompt('Enter technician name:');

    if (!technicianName) return;

    const technicianId = generateId('tech_');

    const result = await maintenanceMgmt.assignTechnician(requestId, technicianId, technicianName);

    if (result.success) {
        await loadMaintenanceRequests();
    }
}

// ==================== UPDATE COSTS ====================

async function updateCosts(requestId) {
    const estimatedCost = prompt('Enter estimated cost:');
    if (!estimatedCost) return;

    const actualCost = prompt('Enter actual cost (optional, press cancel if not yet):') || 0;

    const result = await maintenanceMgmt.updateCosts(requestId, parseFloat(estimatedCost), parseFloat(actualCost));

    if (result.success) {
        await loadMaintenanceRequests();
        await loadMaintenanceStats();
    }
}

// ==================== VIEW DETAILS ====================

async function viewRequestDetails(requestId) {
    try {
        showLoading('Loading details...');

        const result = await maintenanceMgmt.getRequest(requestId);

        hideLoading();

        if (result.success) {
            // Display in modal
            showRequestDetailsModal(result.data);
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading request details:', error);
        showToast('Failed to load details', 'error');
    }
}

function showRequestDetailsModal(request) {
    // Implementation depends on your modal system
    alert(`Request: ${request.title}\nStatus: ${request.status}\nDescription: ${request.description}`);
}

// ==================== FILTERS ====================

document.getElementById('statusFilter')?.addEventListener('change', function (e) {
    const status = e.target.value;
    loadMaintenanceRequests(status);
});

// Helper functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}
