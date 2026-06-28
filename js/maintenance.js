// Maintenance Request Module for RentiHub

class MaintenanceManagement {
    constructor() {
        this.requests = [];
        this.statusColors = {
            'pending': 'bg-status-partial',
            'in_progress': 'bg-blue-500',
            'completed': 'bg-status-paid',
            'cancelled': 'bg-gray-500'
        };
    }

    // Create new maintenance request
    async createRequest(requestData) {
        try {
            // Validate required fields
            if (!requestData.tenantId || !requestData.shopId || !requestData.title || !requestData.description) {
                showToast('Please fill in all required fields', 'error');
                return { success: false, error: 'Missing required fields' };
            }

            const result = await dbService.create('maintenance_requests', {
                tenantId: requestData.tenantId,
                shopId: requestData.shopId,
                title: requestData.title,
                description: requestData.description,
                category: requestData.category || 'general',
                priority: requestData.priority || 'medium',
                status: 'pending',
                reportedDate: firebase.firestore.FieldValue.serverTimestamp(),
                assignedTo: null,
                completedDate: null,
                estimatedCost: parseFloat(requestData.estimatedCost || 0),
                actualCost: 0,
                notes: '',
                images: requestData.images || []
            });

            if (result.success) {
                // Notify property manager
                await dbService.create('notifications', {
                    type: 'maintenance_request',
                    message: `New maintenance request: ${requestData.title}`,
                    targetRole: 'manager',
                    status: 'pending',
                    relatedId: result.id
                });

                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'MAINTENANCE_CREATED',
                    `Created maintenance request: ${requestData.title}`
                );

                showToast('Maintenance request submitted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error creating maintenance request:', error);
            showToast('Failed to submit maintenance request', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get all requests
    async getAllRequests() {
        try {
            const result = await dbService.readAll('maintenance_requests', 'reportedDate', 'desc');
            if (result.success) {
                this.requests = result.data;
            }
            return result;
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            return { success: false, error: error.message };
        }
    }

    // Get requests by status
    async getRequestsByStatus(status) {
        try {
            const result = await dbService.query('maintenance_requests', [
                { field: 'status', operator: '==', value: status }
            ], { field: 'reportedDate', direction: 'desc' });
            return result;
        } catch (error) {
            console.error('Error fetching requests by status:', error);
            return { success: false, error: error.message };
        }
    }

    // Get requests by tenant
    async getRequestsByTenant(tenantId) {
        try {
            const result = await dbService.query('maintenance_requests', [
                { field: 'tenantId', operator: '==', value: tenantId }
            ], { field: 'reportedDate', direction: 'desc' });
            return result;
        } catch (error) {
            console.error('Error fetching tenant requests:', error);
            return { success: false, error: error.message };
        }
    }

    // Get pending requests
    async getPendingRequests() {
        return await this.getRequestsByStatus('pending');
    }

    // Get request by ID
    async getRequest(requestId) {
        return await dbService.read('maintenance_requests', requestId);
    }

    // Update request status
    async updateRequestStatus(requestId, newStatus, notes = '') {
        try {
            const updateData = {
                status: newStatus,
                notes: notes
            };

            if (newStatus === 'completed') {
                updateData.completedDate = firebase.firestore.FieldValue.serverTimestamp();
            }

            const result = await dbService.update('maintenance_requests', requestId, updateData);

            if (result.success) {
                // Get request details for notification
                const request = await this.getRequest(requestId);

                // Notify tenant
                if (request.success) {
                    await dbService.create('notifications', {
                        tenantId: request.data.tenantId,
                        type: 'maintenance_update',
                        message: `Your maintenance request "${request.data.title}" status changed to ${newStatus}`,
                        status: 'pending'
                    });
                }

                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'MAINTENANCE_STATUS_UPDATED',
                    `Updated maintenance request ${requestId} to ${newStatus}`
                );

                showToast('Request status updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating request status:', error);
            showToast('Failed to update request status', 'error');
            return { success: false, error: error.message };
        }
    }

    // Assign technician
    async assignTechnician(requestId, technicianId, technicianName) {
        try {
            const result = await dbService.update('maintenance_requests', requestId, {
                assignedTo: technicianId,
                assignedToName: technicianName,
                status: 'in_progress',
                assignedDate: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (result.success) {
                // Notify technician
                await dbService.create('notifications', {
                    userId: technicianId,
                    type: 'maintenance_assigned',
                    message: `You have been assigned a new maintenance request`,
                    status: 'pending',
                    relatedId: requestId
                });

                showToast('Technician assigned successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error assigning technician:', error);
            showToast('Failed to assign technician', 'error');
            return { success: false, error: error.message };
        }
    }

    // Update maintenance costs
    async updateCosts(requestId, estimatedCost, actualCost) {
        try {
            const result = await dbService.update('maintenance_requests', requestId, {
                estimatedCost: parseFloat(estimatedCost),
                actualCost: parseFloat(actualCost || 0)
            });

            if (result.success) {
                showToast('Costs updated successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error updating costs:', error);
            showToast('Failed to update costs', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get maintenance statistics
    async getMaintenanceStats() {
        try {
            const allRequests = await this.getAllRequests();

            if (!allRequests.success) {
                return { success: false, error: 'Failed to fetch requests' };
            }

            const total = allRequests.data.length;
            const pending = allRequests.data.filter(req => req.status === 'pending').length;
            const inProgress = allRequests.data.filter(req => req.status === 'in_progress').length;
            const completed = allRequests.data.filter(req => req.status === 'completed').length;

            const totalCost = allRequests.data.reduce((sum, req) => sum + (req.actualCost || 0), 0);
            const averageCost = completed > 0 ? totalCost / completed : 0;

            // Calculate average completion time
            const completedRequests = allRequests.data.filter(req =>
                req.status === 'completed' && req.completedDate && req.reportedDate
            );

            let averageCompletionDays = 0;
            if (completedRequests.length > 0) {
                const totalDays = completedRequests.reduce((sum, req) => {
                    const reported = req.reportedDate.toDate();
                    const completed = req.completedDate.toDate();
                    const days = Math.ceil((completed - reported) / (1000 * 60 * 60 * 24));
                    return sum + days;
                }, 0);
                averageCompletionDays = totalDays / completedRequests.length;
            }

            return {
                success: true,
                data: {
                    total,
                    pending,
                    inProgress,
                    completed,
                    totalCost,
                    averageCost,
                    averageCompletionDays: averageCompletionDays.toFixed(1)
                }
            };
        } catch (error) {
            console.error('Error calculating maintenance stats:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete request (admin only)
    async deleteRequest(requestId) {
        try {
            if (!authService.hasPermission('admin')) {
                showToast('Unauthorized to delete requests', 'error');
                return { success: false, error: 'Unauthorized' };
            }

            const result = await dbService.delete('maintenance_requests', requestId);

            if (result.success) {
                await authService.createAuditLog(
                    authService.getCurrentUser().uid,
                    'MAINTENANCE_DELETED',
                    `Deleted maintenance request: ${requestId}`
                );
                showToast('Request deleted successfully', 'success');
            }

            return result;
        } catch (error) {
            console.error('Error deleting request:', error);
            showToast('Failed to delete request', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const maintenanceMgmt = new MaintenanceManagement();
