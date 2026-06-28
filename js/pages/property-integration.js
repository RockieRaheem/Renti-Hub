// Property & Shop Management Integration Script
// Include this file in property_shop_management/code.html

let currentBuilding = null;
let currentFloor = null;

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
        await loadBuildings();
    });
});

// ==================== BUILDINGS ====================

async function loadBuildings() {
    try {
        showLoading('Loading buildings...');
        const result = await propertyMgmt.getAllBuildings();

        if (result.success) {
            renderBuildings(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to load buildings', 'error');
    }
}

function renderBuildings(buildings) {
    const container = document.getElementById('buildingsContainer');
    if (!container) return;

    if (buildings.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No buildings found. Add your first building!</p>';
        return;
    }

    container.innerHTML = buildings.map(building => `
    <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onclick="selectBuilding('${building.id}')">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-xl font-bold text-gray-900">${building.name}</h3>
          <p class="text-gray-600 mt-1">${building.address}</p>
          <p class="text-sm text-gray-500 mt-2">${building.totalFloors} floors</p>
        </div>
        <span class="material-symbols-outlined text-primary">apartment</span>
      </div>
      <div class="mt-4 flex gap-2">
        <button onclick="event.stopPropagation(); editBuilding('${building.id}')" class="text-sm text-blue-600 hover:text-blue-700">
          Edit
        </button>
        <button onclick="event.stopPropagation(); deleteBuilding('${building.id}')" class="text-sm text-red-600 hover:text-red-700">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

async function selectBuilding(buildingId) {
    currentBuilding = buildingId;
    await loadFloors(buildingId);
}

// Add building form handler
document.getElementById('addBuildingForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('buildingName').value,
        address: document.getElementById('buildingAddress').value,
        totalFloors: parseInt(document.getElementById('buildingFloors').value) || 0,
        description: document.getElementById('buildingDescription').value
    };

    const result = await propertyMgmt.createBuilding(formData);

    if (result.success) {
        closeModal('addBuildingModal');
        this.reset();
        await loadBuildings();
    }
});

// ==================== FLOORS ====================

async function loadFloors(buildingId) {
    try {
        showLoading('Loading floors...');
        const result = await propertyMgmt.getFloorsByBuilding(buildingId);

        if (result.success) {
            renderFloors(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to load floors', 'error');
    }
}

function renderFloors(floors) {
    const container = document.getElementById('floorsContainer');
    if (!container) return;

    if (floors.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No floors found. Add floors to this building!</p>';
        return;
    }

    container.innerHTML = floors.map(floor => `
    <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer" onclick="selectFloor('${floor.id}')">
      <h4 class="font-bold text-gray-900">${floor.floorName}</h4>
      <p class="text-sm text-gray-500">${floor.totalShops} shops</p>
    </div>
  `).join('');
}

async function selectFloor(floorId) {
    currentFloor = floorId;
    await loadShops(floorId);
}

// Add floor form handler
document.getElementById('addFloorForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!currentBuilding) {
        showToast('Please select a building first', 'warning');
        return;
    }

    const formData = {
        buildingId: currentBuilding,
        floorNumber: parseInt(document.getElementById('floorNumber').value),
        floorName: document.getElementById('floorName').value,
        description: document.getElementById('floorDescription').value
    };

    const result = await propertyMgmt.createFloor(formData);

    if (result.success) {
        closeModal('addFloorModal');
        this.reset();
        await loadFloors(currentBuilding);
    }
});

// ==================== SHOPS ====================

async function loadShops(floorId) {
    try {
        showLoading('Loading shops...');
        const result = await propertyMgmt.getShopsByFloor(floorId);

        if (result.success) {
            renderShops(result.data);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to load shops', 'error');
    }
}

function renderShops(shops) {
    const container = document.getElementById('shopsContainer');
    if (!container) return;

    if (shops.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No shops found. Add shops to this floor!</p>';
        return;
    }

    container.innerHTML = shops.map(shop => {
        const statusClass = shop.status === 'occupied' ? 'bg-green-100 text-green-800' :
            shop.status === 'vacant' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800';

        return `
      <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-gray-900">Shop ${shop.shopNumber}</h4>
            <p class="text-sm text-gray-600 mt-1">${formatCurrency(shop.monthlyRent)}/month</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusClass}">
            ${shop.status}
          </span>
        </div>
        <div class="mt-3 flex gap-2">
          ${shop.status === 'vacant' ? `
            <button onclick="assignTenantToShop('${shop.id}')" class="text-sm text-blue-600 hover:text-blue-700">
              Assign Tenant
            </button>
          ` : `
            <button onclick="vacateShop('${shop.id}')" class="text-sm text-red-600 hover:text-red-700">
              Vacate
            </button>
          `}
          <button onclick="editShop('${shop.id}')" class="text-sm text-gray-600 hover:text-gray-700">
            Edit
          </button>
        </div>
      </div>
    `;
    }).join('');
}

// Add shop form handler
document.getElementById('addShopForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!currentFloor || !currentBuilding) {
        showToast('Please select a building and floor first', 'warning');
        return;
    }

    const formData = {
        buildingId: currentBuilding,
        floorId: currentFloor,
        shopNumber: document.getElementById('shopNumber').value,
        monthlyRent: parseFloat(document.getElementById('shopRent').value),
        size: document.getElementById('shopSize').value,
        description: document.getElementById('shopDescription').value,
        status: 'vacant'
    };

    const result = await propertyMgmt.createShop(formData);

    if (result.success) {
        closeModal('addShopModal');
        this.reset();
        await loadShops(currentFloor);
    }
});

async function assignTenantToShop(shopId) {
    // Open modal to select tenant and enter lease details
    // Implementation depends on your modal system
    showToast('Feature coming soon', 'info');
}

async function vacateShop(shopId) {
    showConfirmDialog('Are you sure you want to vacate this shop?', async () => {
        const result = await propertyMgmt.vacateShop(shopId);
        if (result.success && currentFloor) {
            await loadShops(currentFloor);
        }
    });
}

// Helper functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}
