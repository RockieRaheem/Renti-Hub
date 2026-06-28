# Integration Guide - How to Connect JavaScript Modules to HTML Pages

This guide shows you how to integrate the backend JavaScript modules into your existing HTML pages.

## Required Script Order

Include these scripts **at the bottom of your HTML** before `</body>`:

```html
<!-- Firebase SDK (must be first) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Core Services -->
<script src="/config/firebase-config.js"></script>
<script src="/js/utils.js"></script>
<script src="/js/database.js"></script>
<script src="/js/auth.js"></script>

<!-- Feature Modules (include only what you need) -->
<script src="/js/property-management.js"></script>
<script src="/js/tenant-management.js"></script>
<script src="/js/rent-payment.js"></script>
<script src="/js/maintenance.js"></script>
<script src="/js/reports.js"></script>
<script src="/js/dashboard.js"></script>
<script src="/js/notifications.js"></script>
<script src="/js/navigation.js"></script>

<!-- Page-specific Integration -->
<script src="/js/pages/your-page-integration.js"></script>
```

## Page-by-Page Integration

### 1. Executive Dashboard (executive_dashboard/code.html)

Add before `</body>`:

```html
<!-- Core Scripts -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<!-- Dashboard Modules -->
<script src="../js/property-management.js"></script>
<script src="../js/tenant-management.js"></script>
<script src="../js/rent-payment.js"></script>
<script src="../js/maintenance.js"></script>
<script src="../js/reports.js"></script>
<script src="../js/dashboard.js"></script>

<!-- Dashboard Integration -->
<script src="../js/pages/dashboard-integration.js"></script>
```

**Add these ID attributes to your HTML elements:**

```html
<!-- KPI Cards -->
<div id="totalRevenue">Loading...</div>
<div id="expectedRevenue">Loading...</div>
<div id="collectionRate">Loading...</div>
<div id="todayCollections">Loading...</div>

<div id="occupiedShops">Loading...</div>
<div id="totalShops">Loading...</div>
<div id="vacantShops">Loading...</div>
<div id="occupancyRate">Loading...</div>

<div id="outstandingRent">Loading...</div>
<div id="outstandingCount">Loading...</div>

<!-- Recent Payments Table -->
<table>
  <tbody id="recentPaymentsTable">
    <!-- Will be populated by JavaScript -->
  </tbody>
</table>
```

### 2. Property & Shop Management (property_shop_management/code.html)

Add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<script src="../js/property-management.js"></script>
<script src="../js/tenant-management.js"></script>

<script src="../js/pages/property-integration.js"></script>
```

**Add these containers to your HTML:**

```html
<!-- Buildings Container -->
<div id="buildingsContainer">
  <!-- Will be populated by JavaScript -->
</div>

<!-- Floors Container -->
<div id="floorsContainer">
  <!-- Will be populated by JavaScript -->
</div>

<!-- Shops Container -->
<div id="shopsContainer">
  <!-- Will be populated by JavaScript -->
</div>

<!-- Add Building Form -->
<form id="addBuildingForm">
  <input type="text" id="buildingName" required>
  <input type="text" id="buildingAddress" required>
  <input type="number" id="buildingFloors">
  <textarea id="buildingDescription"></textarea>
  <button type="submit">Add Building</button>
</form>

<!-- Add Floor Form -->
<form id="addFloorForm">
  <input type="number" id="floorNumber" required>
  <input type="text" id="floorName" required>
  <textarea id="floorDescription"></textarea>
  <button type="submit">Add Floor</button>
</form>

<!-- Add Shop Form -->
<form id="addShopForm">
  <input type="text" id="shopNumber" required>
  <input type="number" id="shopRent" required>
  <input type="text" id="shopSize">
  <textarea id="shopDescription"></textarea>
  <button type="submit">Add Shop</button>
</form>
```

### 3. Rent Collection (rent_collection_payments/code.html)

Add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<script src="../js/tenant-management.js"></script>
<script src="../js/property-management.js"></script>
<script src="../js/rent-payment.js"></script>

<script src="../js/pages/rent-collection-integration.js"></script>
```

**Add these form fields:**

```html
<!-- Payment Form -->
<form id="paymentForm">
  <select id="tenantSelect" required>
    <option value="">Select Tenant</option>
  </select>
  
  <div id="shopInfo"></div>
  
  <input type="number" id="monthlyRent" readonly>
  <input type="number" id="previousBalance" readonly>
  <input type="number" id="totalDue" readonly>
  <input type="number" id="totalPaid" readonly>
  
  <input type="number" id="paymentAmount" required>
  <input type="date" id="paymentDate" required>
  
  <select id="paymentMethod" required>
    <option value="cash">Cash</option>
    <option value="bank">Bank Transfer</option>
    <option value="mobile">Mobile Money</option>
  </select>
  
  <input type="text" id="referenceNumber">
  <textarea id="paymentNotes"></textarea>
  
  <div id="newBalance"></div>
  <div id="paymentStatus"></div>
  
  <button type="submit">Record Payment</button>
</form>

<!-- Today's Collections Table -->
<div id="todayTotal">0</div>
<div id="todayCount">0</div>
<div id="todayAverage">0</div>

<table>
  <tbody id="collectionsTable">
    <!-- Will be populated by JavaScript -->
  </tbody>
</table>
```

### 4. Tenant Directory (tenant_directory/code.html)

Add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<script src="../js/tenant-management.js"></script>
<script src="../js/property-management.js"></script>
<script src="../js/rent-payment.js"></script>
<script src="../js/dashboard.js"></script>

<script src="../js/pages/tenant-integration.js"></script>
```

**Add these containers:**

```html
<!-- For Tenant Role -->
<div id="tenantDashboard">
  <!-- Will be populated by JavaScript -->
</div>

<!-- For Manager/Owner Role -->
<table>
  <tbody id="tenantsTable">
    <!-- Will be populated by JavaScript -->
  </tbody>
</table>

<!-- Add Tenant Form -->
<form id="addTenantForm">
  <input type="text" id="fullName" required>
  <input type="text" id="nationalId" required>
  <input type="tel" id="phone" required>
  <input type="email" id="email">
  <input type="text" id="businessName">
  <input type="text" id="businessType">
  <input type="text" id="emergencyContact">
  <input type="tel" id="emergencyPhone">
  <textarea id="address"></textarea>
  <button type="submit">Add Tenant</button>
</form>

<!-- Search -->
<input type="text" id="searchTenants" placeholder="Search tenants...">
```

### 5. Maintenance Requests (maintenance_requests/code.html)

Add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<script src="../js/maintenance.js"></script>
<script src="../js/tenant-management.js"></script>

<script src="../js/pages/maintenance-integration.js"></script>
```

**Add these containers:**

```html
<!-- Statistics -->
<div id="totalRequests">0</div>
<div id="pendingRequests">0</div>
<div id="inProgressRequests">0</div>
<div id="completedRequests">0</div>
<div id="totalMaintenanceCost">0</div>
<div id="avgCompletionTime">0</div>

<!-- Requests Container -->
<div id="requestsContainer">
  <!-- Will be populated by JavaScript -->
</div>

<!-- New Request Form -->
<form id="newRequestForm">
  <input type="text" id="requestTitle" required>
  <textarea id="requestDescription" required></textarea>
  <select id="requestCategory" required>
    <option value="plumbing">Plumbing</option>
    <option value="electrical">Electrical</option>
    <option value="general">General</option>
  </select>
  <select id="requestPriority" required>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
  <input type="number" id="estimatedCost">
  <button type="submit">Submit Request</button>
</form>

<!-- Status Filter -->
<select id="statusFilter">
  <option value="all">All</option>
  <option value="pending">Pending</option>
  <option value="in_progress">In Progress</option>
  <option value="completed">Completed</option>
</select>
```

### 6. Financial Reports (financial_reports/code.html)

Add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script src="../config/firebase-config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/database.js"></script>
<script src="../js/auth.js"></script>

<script src="../js/reports.js"></script>
<script src="../js/rent-payment.js"></script>
<script src="../js/tenant-management.js"></script>
<script src="../js/property-management.js"></script>

<script src="../js/pages/reports-integration.js"></script>
```

**Add these containers:**

```html
<!-- Report Type Selector -->
<select id="reportTypeSelect">
  <option value="daily">Daily Report</option>
  <option value="monthly">Monthly Report</option>
  <option value="annual">Annual Report</option>
  <option value="outstanding">Outstanding Balances</option>
  <option value="occupancy">Occupancy Report</option>
</select>

<!-- Date Selectors -->
<select id="monthSelect">
  <!-- Options 1-12 -->
</select>
<select id="yearSelect">
  <!-- Options for years -->
</select>

<!-- Report Container -->
<div id="reportContainer">
  <!-- Will be populated by JavaScript -->
</div>

<!-- Export Button (added by JavaScript, but you can add manually) -->
<button onclick="exportReport()">Export CSV</button>
```

## Common Patterns

### Making Elements Clickable

Add `onclick` attributes to trigger functions:

```html
<button onclick="viewTenantDetails('tenant-id-123')">View Details</button>
<button onclick="deleteBuilding('building-id-456')">Delete</button>
<button onclick="recordPayment()">Record Payment</button>
```

### Modal Integration

If you're using modals, add these helper functions to your integration script:

```javascript
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}
```

Then use in HTML:

```html
<button onclick="openModal('addTenantModal')">Add Tenant</button>

<div id="addTenantModal" class="hidden">
  <!-- Modal content -->
  <button onclick="closeModal('addTenantModal')">Close</button>
</div>
```

### Loading States

The integration scripts use these global functions from `utils.js`:

```javascript
showLoading('Loading data...');  // Show loading spinner
hideLoading();                   // Hide loading spinner
showToast('Success!', 'success'); // Show notification
```

### Error Handling

All async functions return objects with this structure:

```javascript
{
  success: true/false,
  data: {...},      // On success
  error: "message"  // On failure
}
```

Always check the result:

```javascript
const result = await tenantMgmt.createTenant(data);

if (result.success) {
  // Handle success
  showToast('Tenant created!', 'success');
} else {
  // Handle error
  showToast(result.error, 'error');
}
```

## Testing Checklist

After integration, test these scenarios:

- [ ] Page loads without console errors
- [ ] User authentication works
- [ ] Data loads and displays correctly
- [ ] Forms submit successfully
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Search/filter functions work
- [ ] Modals open and close properly
- [ ] Export functions work
- [ ] Mobile responsiveness maintained

## Common Issues

**"initializeFirebase is not defined"**
- Ensure `firebase-config.js` is loaded before other scripts

**"authService is not defined"**
- Ensure `auth.js` is loaded before page integration scripts

**"Cannot read property 'id' of null"**
- Element ID in HTML doesn't match the ID in JavaScript
- Check for typos in element IDs

**Data not displaying**
- Check browser console for errors
- Verify Firebase is initialized
- Check that user is authenticated
- Verify Firestore rules allow read access

## Next Steps

1. Add all required script tags to your pages
2. Add all required ID attributes to HTML elements
3. Test each page individually
4. Check browser console for errors
5. Fix any missing IDs or script references
6. Test all user flows (create, read, update, delete)

Your system should now be fully functional! 🎉
