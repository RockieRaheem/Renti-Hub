// Rent Collection & Payments Integration Script
// Include this file in rent_collection_payments/code.html

let selectedTenant = null;
let selectedShop = null;

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

        // Load initial data
        await loadTenants();
        await loadTodayCollections();
    });
});

// ==================== TENANTS ====================

async function loadTenants() {
    try {
        const result = await tenantMgmt.getActiveTenants();

        if (result.success) {
            populateTenantDropdown(result.data);
        }
    } catch (error) {
        console.error('Error loading tenants:', error);
    }
}

function populateTenantDropdown(tenants) {
    const dropdown = document.getElementById('tenantSelect');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Tenant</option>' +
        tenants.map(tenant => `
      <option value="${tenant.id}">${tenant.fullName} - ${tenant.phone}</option>
    `).join('');
}

// Handle tenant selection
document.getElementById('tenantSelect')?.addEventListener('change', async function (e) {
    selectedTenant = e.target.value;

    if (selectedTenant) {
        await loadTenantDetails(selectedTenant);
        await loadTenantShop(selectedTenant);
    }
});

async function loadTenantDetails(tenantId) {
    try {
        const balance = await tenantMgmt.getTenantBalance(tenantId);

        if (balance.success) {
            document.getElementById('monthlyRent').value = balance.monthlyRent;
            document.getElementById('previousBalance').value = balance.balance;
            document.getElementById('totalDue').value = balance.totalDue;
            document.getElementById('totalPaid').value = balance.totalPaid;
        }
    } catch (error) {
        console.error('Error loading tenant balance:', error);
    }
}

async function loadTenantShop(tenantId) {
    try {
        const lease = await tenantMgmt.getTenantLease(tenantId);

        if (lease.success && lease.data.length > 0) {
            selectedShop = lease.data[0].shopId;

            const shop = await propertyMgmt.getShop(selectedShop);
            if (shop.success) {
                document.getElementById('shopInfo').textContent = `Shop ${shop.data.shopNumber}`;
            }
        }
    } catch (error) {
        console.error('Error loading tenant shop:', error);
    }
}

// ==================== RECORD PAYMENT ====================

document.getElementById('paymentForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!selectedTenant || !selectedShop) {
        showToast('Please select a tenant', 'warning');
        return;
    }

    const formData = {
        tenantId: selectedTenant,
        shopId: selectedShop,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        paymentDate: document.getElementById('paymentDate').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        referenceNumber: document.getElementById('referenceNumber').value,
        notes: document.getElementById('paymentNotes').value
    };

    showLoading('Processing payment...');

    const result = await rentPayment.recordPayment(formData);

    hideLoading();

    if (result.success) {
        showToast('Payment recorded successfully!', 'success');

        // Show receipt option
        showConfirmDialog('Payment recorded! Would you like to print the receipt?', async () => {
            await printReceipt(result.receiptId);
        });

        // Reset form
        this.reset();
        selectedTenant = null;
        selectedShop = null;

        // Reload collections
        await loadTodayCollections();
    }
});

// ==================== TODAY'S COLLECTIONS ====================

async function loadTodayCollections() {
    try {
        const result = await rentPayment.getTodayCollections();

        if (result.success) {
            renderTodayCollections(result.data);
            updateCollectionSummary(result.data);
        }
    } catch (error) {
        console.error('Error loading today\'s collections:', error);
    }
}

function renderTodayCollections(payments) {
    const tableBody = document.getElementById('collectionsTable');
    if (!tableBody) return;

    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No payments recorded today</td></tr>';
        return;
    }

    tableBody.innerHTML = payments.map(payment => `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3">${formatDate(payment.paymentDate, 'time')}</td>
      <td class="px-4 py-3">${payment.tenantId}</td>
      <td class="px-4 py-3">${payment.shopId}</td>
      <td class="px-4 py-3 font-semibold">${formatCurrency(payment.amount)}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          ${payment.paymentMethod}
        </span>
      </td>
      <td class="px-4 py-3">
        <button onclick="viewReceipt('${payment.id}')" class="text-blue-600 hover:text-blue-700">
          <span class="material-symbols-outlined text-sm">receipt</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateCollectionSummary(payments) {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;

    document.getElementById('todayTotal').textContent = formatCurrency(total);
    document.getElementById('todayCount').textContent = count;
    document.getElementById('todayAverage').textContent = count > 0 ? formatCurrency(total / count) : formatCurrency(0);
}

// ==================== RECEIPTS ====================

async function viewReceipt(paymentId) {
    try {
        showLoading('Loading receipt...');

        const receiptResult = await rentPayment.getReceiptByPaymentId(paymentId);

        hideLoading();

        if (receiptResult.success && receiptResult.data.length > 0) {
            const receipt = receiptResult.data[0];
            rentPayment.printReceipt(receipt);
        } else {
            showToast('Receipt not found', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Error viewing receipt:', error);
        showToast('Failed to load receipt', 'error');
    }
}

async function printReceipt(receiptId) {
    try {
        showLoading('Loading receipt...');

        const receiptResult = await dbService.read('receipts', receiptId);

        hideLoading();

        if (receiptResult.success) {
            rentPayment.printReceipt(receiptResult.data);
        } else {
            showToast('Receipt not found', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Error printing receipt:', error);
        showToast('Failed to print receipt', 'error');
    }
}

// Search receipts
document.getElementById('searchReceipt')?.addEventListener('input', debounce(async function (e) {
    const receiptNumber = e.target.value;

    if (receiptNumber.length >= 5) {
        const result = await rentPayment.getReceiptByNumber(receiptNumber);

        if (result.success && result.data.length > 0) {
            // Display receipt details
            showToast('Receipt found!', 'success');
        }
    }
}, 500));

// Calculate new balance on amount input
document.getElementById('paymentAmount')?.addEventListener('input', function (e) {
    const amount = parseFloat(e.target.value) || 0;
    const previousBalance = parseFloat(document.getElementById('previousBalance').value) || 0;
    const newBalance = previousBalance - amount;

    document.getElementById('newBalance').value = newBalance;

    // Update status indicator
    const statusIndicator = document.getElementById('paymentStatus');
    if (statusIndicator) {
        if (newBalance <= 0) {
            statusIndicator.textContent = 'PAID';
            statusIndicator.className = 'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800';
        } else if (amount > 0) {
            statusIndicator.textContent = 'PARTIAL';
            statusIndicator.className = 'px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800';
        } else {
            statusIndicator.textContent = 'UNPAID';
            statusIndicator.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800';
        }
    }
});
