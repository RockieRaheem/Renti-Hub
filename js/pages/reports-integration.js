// Financial Reports Integration Script
// Include this file in financial_reports/code.html

let currentReportType = 'daily';
let currentReportData = null;

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

        // Load default report (today's)
        await generateDailyReport();
    });
});

// ==================== DAILY REPORT ====================

async function generateDailyReport(date = new Date()) {
    try {
        showLoading('Generating daily report...');
        currentReportType = 'daily';

        const result = await reportsMgmt.generateDailyReport(date);

        if (result.success) {
            currentReportData = result.data;
            renderDailyReport(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error generating daily report:', error);
        showToast('Failed to generate report', 'error');
    }
}

function renderDailyReport(data) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Daily Revenue Report</h2>
        <button onclick="exportReport()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container">
          Export CSV
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 mb-2">Report Date</p>
        <p class="text-xl font-bold">${data.date}</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Total Revenue</p>
          <p class="text-3xl font-bold text-green-600">${formatCurrency(data.totalRevenue)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Total Transactions</p>
          <p class="text-3xl font-bold text-blue-600">${data.totalTransactions}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Average Transaction</p>
          <p class="text-3xl font-bold text-purple-600">${formatCurrency(data.averageTransaction)}</p>
        </div>
      </div>

      <!-- By Payment Method -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">By Payment Method</h3>
        <div class="space-y-3">
          ${Object.entries(data.byMethod).map(([method, amount]) => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span class="font-semibold capitalize">${method}</span>
              <span class="text-lg font-bold">${formatCurrency(amount)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- By Collector -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">By Collector</h3>
        <div class="space-y-3">
          ${Object.entries(data.byCollector).map(([id, stats]) => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p class="font-semibold">${stats.name}</p>
                <p class="text-sm text-gray-600">${stats.count} transactions</p>
              </div>
              <span class="text-lg font-bold">${formatCurrency(stats.total)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">Transactions</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2">
                <th class="text-left px-4 py-3">Time</th>
                <th class="text-left px-4 py-3">Tenant</th>
                <th class="text-left px-4 py-3">Shop</th>
                <th class="text-left px-4 py-3">Amount</th>
                <th class="text-left px-4 py-3">Method</th>
              </tr>
            </thead>
            <tbody>
              ${data.payments.map(payment => `
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">${formatDate(payment.paymentDate, 'time')}</td>
                  <td class="px-4 py-3">${payment.tenantId}</td>
                  <td class="px-4 py-3">${payment.shopId}</td>
                  <td class="px-4 py-3 font-semibold">${formatCurrency(payment.amount)}</td>
                  <td class="px-4 py-3 capitalize">${payment.paymentMethod}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==================== MONTHLY REPORT ====================

async function generateMonthlyReport() {
    const month = parseInt(document.getElementById('monthSelect')?.value || new Date().getMonth() + 1);
    const year = parseInt(document.getElementById('yearSelect')?.value || new Date().getFullYear());

    try {
        showLoading('Generating monthly report...');
        currentReportType = 'monthly';

        const result = await reportsMgmt.generateMonthlyReport(month, year);

        if (result.success) {
            currentReportData = result.data;
            renderMonthlyReport(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error generating monthly report:', error);
        showToast('Failed to generate report', 'error');
    }
}

function renderMonthlyReport(data) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Monthly Revenue Report</h2>
        <button onclick="exportReport()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container">
          Export CSV
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 mb-2">Report Period</p>
        <p class="text-xl font-bold">${data.month}</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Total Revenue</p>
          <p class="text-3xl font-bold text-green-600">${formatCurrency(data.totalRevenue)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Expected Revenue</p>
          <p class="text-2xl font-bold text-gray-600">${formatCurrency(data.expectedRevenue)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Collection Rate</p>
          <p class="text-3xl font-bold text-blue-600">${data.collectionRate}%</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Occupied Shops</p>
          <p class="text-3xl font-bold text-purple-600">${data.occupiedShops}</p>
        </div>
      </div>

      <!-- Daily Breakdown -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">Daily Breakdown</h3>
        <div class="grid grid-cols-7 gap-2 text-sm">
          ${Object.entries(data.byDay).map(([day, amount]) => `
            <div class="p-2 bg-gray-50 rounded text-center">
              <p class="text-xs text-gray-600">${day}</p>
              <p class="font-semibold">${formatCurrency(amount)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==================== ANNUAL REPORT ====================

async function generateAnnualReport() {
    const year = parseInt(document.getElementById('yearSelect')?.value || new Date().getFullYear());

    try {
        showLoading('Generating annual report...');
        currentReportType = 'annual';

        const result = await reportsMgmt.generateAnnualReport(year);

        if (result.success) {
            currentReportData = result.data;
            renderAnnualReport(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error generating annual report:', error);
        showToast('Failed to generate report', 'error');
    }
}

function renderAnnualReport(data) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Annual Revenue Report</h2>
        <button onclick="exportReport()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container">
          Export CSV
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Total Revenue ${data.year}</p>
          <p class="text-3xl font-bold text-green-600">${formatCurrency(data.totalRevenue)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Average Monthly</p>
          <p class="text-3xl font-bold text-blue-600">${formatCurrency(data.averageMonthly)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 mb-2">Total Transactions</p>
          <p class="text-3xl font-bold text-purple-600">${data.totalTransactions}</p>
        </div>
      </div>

      <!-- Best & Worst Months -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-green-50 rounded-lg shadow p-6">
          <p class="text-green-800 mb-2 font-semibold">Best Month</p>
          <p class="text-2xl font-bold text-green-900">${data.bestMonth.name}</p>
          <p class="text-xl text-green-700">${formatCurrency(data.bestMonth.revenue)}</p>
        </div>
        <div class="bg-red-50 rounded-lg shadow p-6">
          <p class="text-red-800 mb-2 font-semibold">Lowest Month</p>
          <p class="text-2xl font-bold text-red-900">${data.worstMonth.name}</p>
          <p class="text-xl text-red-700">${formatCurrency(data.worstMonth.revenue)}</p>
        </div>
      </div>

      <!-- Monthly Breakdown -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4">Monthly Breakdown</h3>
        <div class="grid grid-cols-4 gap-3">
          ${Object.entries(data.byMonth).map(([month, amount]) => `
            <div class="p-4 bg-gray-50 rounded text-center">
              <p class="text-sm text-gray-600">${month}</p>
              <p class="font-bold">${formatCurrency(amount)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==================== OTHER REPORTS ====================

async function generateOutstandingReport() {
    try {
        showLoading('Generating outstanding balances report...');
        currentReportType = 'outstanding';

        const result = await reportsMgmt.generateOutstandingReport();

        if (result.success) {
            currentReportData = result.data;
            // Render outstanding report
            showToast('Outstanding report generated', 'success');
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to generate report', 'error');
    }
}

async function generateOccupancyReport() {
    try {
        showLoading('Generating occupancy report...');
        currentReportType = 'occupancy';

        const result = await reportsMgmt.generateOccupancyReport();

        if (result.success) {
            currentReportData = result.data;
            // Render occupancy report
            showToast('Occupancy report generated', 'success');
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to generate report', 'error');
    }
}

// ==================== EXPORT ====================

function exportReport() {
    if (!currentReportData) {
        showToast('No report data to export', 'warning');
        return;
    }

    const filename = `${currentReportType}_report_${new Date().toISOString().split('T')[0]}`;

    // Convert report data to CSV format
    let csvData = [];

    if (currentReportType === 'daily' && currentReportData.payments) {
        csvData = currentReportData.payments.map(p => ({
            Date: formatDate(p.paymentDate),
            Tenant: p.tenantId,
            Shop: p.shopId,
            Amount: p.amount,
            Method: p.paymentMethod
        }));
    }

    if (csvData.length > 0) {
        exportToCSV(csvData, filename);
    } else {
        showToast('No data to export', 'warning');
    }
}

// Report type selector
document.getElementById('reportTypeSelect')?.addEventListener('change', function (e) {
    const reportType = e.target.value;

    switch (reportType) {
        case 'daily':
            generateDailyReport();
            break;
        case 'monthly':
            generateMonthlyReport();
            break;
        case 'annual':
            generateAnnualReport();
            break;
        case 'outstanding':
            generateOutstandingReport();
            break;
        case 'occupancy':
            generateOccupancyReport();
            break;
    }
});
