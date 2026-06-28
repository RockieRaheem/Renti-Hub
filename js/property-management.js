// Building, Floor, and Shop Management Module for RentiHub

class PropertyManagement {
    constructor() {
        this.buildings = [];
        this.floors = [];
        this.shops = [];
    }

    // ==================== BUILDING MANAGEMENT ====================

    // Create new building
    async createBuilding(buildingData) {
        try {
            const result = await dbService.create('buildings', {
                name: buildingData.name,
                address: buildingData.address,
                totalFloors: buildingData.totalFloors || 0,
                description: buildingData.description || '',
                status: 'active'
            });

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'BUILDING_CREATED',
                    `Created building: ${buildingData.name}`
                );
                showToast('Building created successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error creating building:', error);
            showToast('Failed to create building', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get all buildings
    async getAllBuildings() {
        try {
            const result = await dbService.readAll('buildings', 'name', 'asc');
            if (result.success) {
                this.buildings = result.data;
            }
            return result;
        } catch (error) {
            console.error('Error fetching buildings:', error);
            return { success: false, error: error.message };
        }
    }

    // Get building by ID
    async getBuilding(buildingId) {
        return await dbService.read('buildings', buildingId);
    }

    // Update building
    async updateBuilding(buildingId, updateData) {
        try {
            const result = await dbService.update('buildings', buildingId, updateData);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'BUILDING_UPDATED',
                    `Updated building: ${buildingId}`
                );
                showToast('Building updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating building:', error);
            showToast('Failed to update building', 'error');
            return { success: false, error: error.message };
        }
    }

    // Delete building
    async deleteBuilding(buildingId) {
        try {
            // Check if building has floors
            const floors = await dbService.query('floors', [
                { field: 'buildingId', operator: '==', value: buildingId }
            ]);

            if (floors.data && floors.data.length > 0) {
                showToast('Cannot delete building with existing floors', 'error');
                return { success: false, error: 'Building has floors' };
            }

            const result = await dbService.delete('buildings', buildingId);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'BUILDING_DELETED',
                    `Deleted building: ${buildingId}`
                );
                showToast('Building deleted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error deleting building:', error);
            showToast('Failed to delete building', 'error');
            return { success: false, error: error.message };
        }
    }

    // ==================== FLOOR MANAGEMENT ====================

    // Create new floor
    async createFloor(floorData) {
        try {
            const result = await dbService.create('floors', {
                buildingId: floorData.buildingId,
                floorNumber: floorData.floorNumber,
                floorName: floorData.floorName,
                totalShops: floorData.totalShops || 0,
                description: floorData.description || ''
            });

            if (result.success) {
                // Update building's total floors count
                const floors = await this.getFloorsByBuilding(floorData.buildingId);
                await dbService.update('buildings', floorData.buildingId, {
                    totalFloors: floors.data.length
                });

                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'FLOOR_CREATED',
                    `Created floor: ${floorData.floorName} in building ${floorData.buildingId}`
                );
                showToast('Floor created successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error creating floor:', error);
            showToast('Failed to create floor', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get floors by building
    async getFloorsByBuilding(buildingId) {
        try {
            const result = await dbService.query('floors', [
                { field: 'buildingId', operator: '==', value: buildingId }
            ], { field: 'floorNumber', direction: 'asc' });

            if (result.success) {
                this.floors = result.data;
            }

            return result;
        } catch (error) {
            console.error('Error fetching floors:', error);
            return { success: false, error: error.message };
        }
    }

    // Update floor
    async updateFloor(floorId, updateData) {
        try {
            const result = await dbService.update('floors', floorId, updateData);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'FLOOR_UPDATED',
                    `Updated floor: ${floorId}`
                );
                showToast('Floor updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating floor:', error);
            showToast('Failed to update floor', 'error');
            return { success: false, error: error.message };
        }
    }

    // Delete floor
    async deleteFloor(floorId) {
        try {
            // Check if floor has shops
            const shops = await dbService.query('shops', [
                { field: 'floorId', operator: '==', value: floorId }
            ]);

            if (shops.data && shops.data.length > 0) {
                showToast('Cannot delete floor with existing shops', 'error');
                return { success: false, error: 'Floor has shops' };
            }

            const result = await dbService.delete('floors', floorId);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'FLOOR_DELETED',
                    `Deleted floor: ${floorId}`
                );
                showToast('Floor deleted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error deleting floor:', error);
            showToast('Failed to delete floor', 'error');
            return { success: false, error: error.message };
        }
    }

    // ==================== SHOP MANAGEMENT ====================

    // Create new shop
    async createShop(shopData) {
        try {
            const result = await dbService.create('shops', {
                buildingId: shopData.buildingId,
                floorId: shopData.floorId,
                shopNumber: shopData.shopNumber,
                monthlyRent: parseFloat(shopData.monthlyRent),
                size: shopData.size || '',
                description: shopData.description || '',
                status: shopData.status || 'vacant', // vacant, occupied, reserved
                tenantId: shopData.tenantId || null
            });

            if (result.success) {
                // Update floor's total shops count
                const shops = await this.getShopsByFloor(shopData.floorId);
                await dbService.update('floors', shopData.floorId, {
                    totalShops: shops.data.length
                });

                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'SHOP_CREATED',
                    `Created shop: ${shopData.shopNumber}`
                );
                showToast('Shop created successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error creating shop:', error);
            showToast('Failed to create shop', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get all shops
    async getAllShops() {
        try {
            const result = await dbService.readAll('shops', 'shopNumber', 'asc');
            if (result.success) {
                this.shops = result.data;
            }
            return result;
        } catch (error) {
            console.error('Error fetching shops:', error);
            return { success: false, error: error.message };
        }
    }

    // Get shops by floor
    async getShopsByFloor(floorId) {
        try {
            const result = await dbService.query('shops', [
                { field: 'floorId', operator: '==', value: floorId }
            ], { field: 'shopNumber', direction: 'asc' });

            if (result.success) {
                this.shops = result.data;
            }

            return result;
        } catch (error) {
            console.error('Error fetching shops:', error);
            return { success: false, error: error.message };
        }
    }

    // Get shops by building
    async getShopsByBuilding(buildingId) {
        try {
            const result = await dbService.query('shops', [
                { field: 'buildingId', operator: '==', value: buildingId }
            ], { field: 'shopNumber', direction: 'asc' });

            return result;
        } catch (error) {
            console.error('Error fetching shops:', error);
            return { success: false, error: error.message };
        }
    }

    // Get vacant shops
    async getVacantShops() {
        try {
            const result = await dbService.query('shops', [
                { field: 'status', operator: '==', value: 'vacant' }
            ]);

            return result;
        } catch (error) {
            console.error('Error fetching vacant shops:', error);
            return { success: false, error: error.message };
        }
    }

    // Get shop by ID
    async getShop(shopId) {
        return await dbService.read('shops', shopId);
    }

    // Update shop
    async updateShop(shopId, updateData) {
        try {
            const result = await dbService.update('shops', shopId, updateData);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'SHOP_UPDATED',
                    `Updated shop: ${shopId}`
                );
                showToast('Shop updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating shop:', error);
            showToast('Failed to update shop', 'error');
            return { success: false, error: error.message };
        }
    }

    // Delete shop
    async deleteShop(shopId) {
        try {
            // Check if shop is occupied
            const shop = await this.getShop(shopId);
            if (shop.data && shop.data.status === 'occupied') {
                showToast('Cannot delete occupied shop', 'error');
                return { success: false, error: 'Shop is occupied' };
            }

            const result = await dbService.delete('shops', shopId);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'SHOP_DELETED',
                    `Deleted shop: ${shopId}`
                );
                showToast('Shop deleted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error deleting shop:', error);
            showToast('Failed to delete shop', 'error');
            return { success: false, error: error.message };
        }
    }

    // Assign tenant to shop
    async assignTenantToShop(shopId, tenantId, leaseData) {
        try {
            // Update shop status
            await dbService.update('shops', shopId, {
                status: 'occupied',
                tenantId: tenantId
            });

            // Create lease record
            const leaseResult = await dbService.create('leases', {
                shopId: shopId,
                tenantId: tenantId,
                startDate: firebase.firestore.Timestamp.fromDate(new Date(leaseData.startDate)),
                endDate: firebase.firestore.Timestamp.fromDate(new Date(leaseData.endDate)),
                monthlyRent: parseFloat(leaseData.monthlyRent),
                deposit: parseFloat(leaseData.deposit || 0),
                status: 'active'
            });

            if (leaseResult.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'TENANT_ASSIGNED',
                    `Assigned tenant ${tenantId} to shop ${shopId}`
                );
                showToast('Tenant assigned to shop successfully', 'success');
            }

            return leaseResult;
        } catch (error) {
            console.error('Error assigning tenant:', error);
            showToast('Failed to assign tenant', 'error');
            return { success: false, error: error.message };
        }
    }

    // Vacate shop
    async vacateShop(shopId) {
        try {
            // Get current lease
            const leases = await dbService.query('leases', [
                { field: 'shopId', operator: '==', value: shopId },
                { field: 'status', operator: '==', value: 'active' }
            ]);

            if (leases.data && leases.data.length > 0) {
                // End lease
                await dbService.update('leases', leases.data[0].id, {
                    status: 'terminated',
                    endDate: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Update shop
            const result = await dbService.update('shops', shopId, {
                status: 'vacant',
                tenantId: null
            });

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'SHOP_VACATED',
                    `Vacated shop: ${shopId}`
                );
                showToast('Shop vacated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error vacating shop:', error);
            showToast('Failed to vacate shop', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get occupancy statistics
    async getOccupancyStats() {
        try {
            const allShops = await this.getAllShops();

            if (!allShops.success) {
                return { success: false, error: 'Failed to fetch shops' };
            }

            const total = allShops.data.length;
            const occupied = allShops.data.filter(shop => shop.status === 'occupied').length;
            const vacant = allShops.data.filter(shop => shop.status === 'vacant').length;
            const reserved = allShops.data.filter(shop => shop.status === 'reserved').length;

            const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

            return {
                success: true,
                data: {
                    total,
                    occupied,
                    vacant,
                    reserved,
                    occupancyRate
                }
            };
        } catch (error) {
            console.error('Error calculating occupancy:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const propertyMgmt = new PropertyManagement();
