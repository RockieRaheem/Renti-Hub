// Tenant Management Module for RentiHub

class TenantManagement {
    constructor() {
        this.tenants = [];
    }

    // Create new tenant
    async createTenant(tenantData) {
        try {
            // Validate required fields
            if (!tenantData.fullName || !tenantData.phone || !tenantData.nationalId) {
                showToast('Please fill in all required fields', 'error');
                return { success: false, error: 'Missing required fields' };
            }

            // Check for duplicate National ID
            const existing = await dbService.query('tenants', [
                { field: 'nationalId', operator: '==', value: tenantData.nationalId }
            ]);

            if (existing.data && existing.data.length > 0) {
                showToast('Tenant with this National ID already exists', 'error');
                return { success: false, error: 'Duplicate National ID' };
            }

            const result = await dbService.create('tenants', {
                fullName: tenantData.fullName,
                nationalId: tenantData.nationalId,
                phone: formatPhone(tenantData.phone),
                email: tenantData.email || '',
                businessName: tenantData.businessName || '',
                businessType: tenantData.businessType || '',
                emergencyContact: tenantData.emergencyContact || '',
                emergencyPhone: tenantData.emergencyPhone ? formatPhone(tenantData.emergencyPhone) : '',
                address: tenantData.address || '',
                status: 'active',
                totalPaid: 0,
                totalArrears: 0
            });

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'TENANT_CREATED',
                    `Created tenant: ${tenantData.fullName}`
                );
                showToast('Tenant created successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error creating tenant:', error);
            showToast('Failed to create tenant', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get all tenants
    async getAllTenants() {
        try {
            const result = await dbService.readAll('tenants', 'fullName', 'asc');
            if (result.success) {
                this.tenants = result.data;
            }
            return result;
        } catch (error) {
            console.error('Error fetching tenants:', error);
            return { success: false, error: error.message };
        }
    }

    // Get active tenants
    async getActiveTenants() {
        try {
            const result = await dbService.query('tenants', [
                { field: 'status', operator: '==', value: 'active' }
            ], { field: 'fullName', direction: 'asc' });
            return result;
        } catch (error) {
            console.error('Error fetching active tenants:', error);
            return { success: false, error: error.message };
        }
    }

    // Get tenant by ID
    async getTenant(tenantId) {
        return await dbService.read('tenants', tenantId);
    }

    // Update tenant
    async updateTenant(tenantId, updateData) {
        try {
            if (updateData.phone) {
                updateData.phone = formatPhone(updateData.phone);
            }
            if (updateData.emergencyPhone) {
                updateData.emergencyPhone = formatPhone(updateData.emergencyPhone);
            }

            const result = await dbService.update('tenants', tenantId, updateData);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'TENANT_UPDATED',
                    `Updated tenant: ${tenantId}`
                );
                showToast('Tenant updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating tenant:', error);
            showToast('Failed to update tenant', 'error');
            return { success: false, error: error.message };
        }
    }

    // Delete tenant
    async deleteTenant(tenantId) {
        try {
            // Check if tenant has active lease
            const leases = await dbService.query('leases', [
                { field: 'tenantId', operator: '==', value: tenantId },
                { field: 'status', operator: '==', value: 'active' }
            ]);

            if (leases.data && leases.data.length > 0) {
                showToast('Cannot delete tenant with active lease', 'error');
                return { success: false, error: 'Tenant has active lease' };
            }

            const result = await dbService.delete('tenants', tenantId);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'TENANT_DELETED',
                    `Deleted tenant: ${tenantId}`
                );
                showToast('Tenant deleted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error deleting tenant:', error);
            showToast('Failed to delete tenant', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get tenant's current lease
    async getTenantLease(tenantId) {
        try {
            const result = await dbService.query('leases', [
                { field: 'tenantId', operator: '==', value: tenantId },
                { field: 'status', operator: '==', value: 'active' }
            ]);
            return result;
        } catch (error) {
            console.error('Error fetching tenant lease:', error);
            return { success: false, error: error.message };
        }
    }

    // Get tenant's payment history
    async getTenantPayments(tenantId) {
        try {
            const result = await dbService.query('payments', [
                { field: 'tenantId', operator: '==', value: tenantId }
            ], { field: 'paymentDate', direction: 'desc' });
            return result;
        } catch (error) {
            console.error('Error fetching tenant payments:', error);
            return { success: false, error: error.message };
        }
    }

    // Calculate tenant balance
    async getTenantBalance(tenantId) {
        try {
            // Get active lease
            const leases = await this.getTenantLease(tenantId);
            if (!leases.success || leases.data.length === 0) {
                return { success: true, balance: 0, monthlyRent: 0 };
            }

            const lease = leases.data[0];
            const monthlyRent = lease.monthlyRent;

            // Calculate months since lease start
            const startDate = lease.startDate.toDate();
            const now = new Date();
            const monthsPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30));
            const totalDue = monthlyRent * monthsPassed;

            // Get total paid
            const payments = await this.getTenantPayments(tenantId);
            const totalPaid = payments.data.reduce((sum, payment) => sum + payment.amount, 0);

            const balance = totalDue - totalPaid;

            return {
                success: true,
                balance: balance,
                totalDue: totalDue,
                totalPaid: totalPaid,
                monthlyRent: monthlyRent,
                monthsPassed: monthsPassed
            };
        } catch (error) {
            console.error('Error calculating tenant balance:', error);
            return { success: false, error: error.message };
        }
    }

    // Search tenants
    async searchTenants(searchTerm) {
        try {
            const allTenants = await this.getAllTenants();
            if (!allTenants.success) {
                return allTenants;
            }

            const term = searchTerm.toLowerCase();
            const filtered = allTenants.data.filter(tenant =>
                tenant.fullName.toLowerCase().includes(term) ||
                tenant.phone.includes(term) ||
                tenant.nationalId.toLowerCase().includes(term) ||
                (tenant.businessName && tenant.businessName.toLowerCase().includes(term))
            );

            return { success: true, data: filtered };
        } catch (error) {
            console.error('Error searching tenants:', error);
            return { success: false, error: error.message };
        }
    }

    // Get tenants with arrears
    async getTenantsWithArrears() {
        try {
            const allTenants = await this.getActiveTenants();
            if (!allTenants.success) {
                return allTenants;
            }

            const tenantsWithArrears = [];

            for (const tenant of allTenants.data) {
                const balance = await this.getTenantBalance(tenant.id);
                if (balance.success && balance.balance > 0) {
                    tenantsWithArrears.push({
                        ...tenant,
                        arrears: balance.balance,
                        monthlyRent: balance.monthlyRent
                    });
                }
            }

            return { success: true, data: tenantsWithArrears };
        } catch (error) {
            console.error('Error fetching tenants with arrears:', error);
            return { success: false, error: error.message };
        }
    }

    // Send reminder to tenant
    async sendReminder(tenantId, message) {
        try {
            const tenant = await this.getTenant(tenantId);
            if (!tenant.success) {
                return tenant;
            }

            // Create notification
            const notification = await dbService.create('notifications', {
                tenantId: tenantId,
                type: 'reminder',
                message: message,
                phone: tenant.data.phone,
                email: tenant.data.email,
                status: 'pending',
                sentBy: authService.getCurrentUser().uid
            });

            if (notification.success) {
                showToast('Reminder sent successfully', 'success');
            }

            return notification;
        } catch (error) {
            console.error('Error sending reminder:', error);
            showToast('Failed to send reminder', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const tenantMgmt = new TenantManagement();
