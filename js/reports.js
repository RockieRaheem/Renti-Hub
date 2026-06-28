// Financial Reports Module for RentiHub

class ReportsManagement {
    constructor() {
        this.reportTypes = [
            'daily_revenue',
            'monthly_revenue',
            'annual_revenue',
            'outstanding_balances',
            'occupancy_report',
            'vacant_shops',
            'tenant_payment_history',
            'collector_performance'
        ];
    }

    // Generate daily revenue report
    async generateDailyReport(date = new Date()) {
        try {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            const payments = await rentPayment.getPaymentsByDateRange(startDate, endDate);

            if (!payments.success) {
                return { success: false, error: 'Failed to fetch payments' };
            }

            const totalRevenue = payments.data.reduce((sum, payment) => sum + payment.amount, 0);
            const totalTransactions = payments.data.length;

            // Group by payment method
            const byMethod = {};
            payments.data.forEach(payment => {
                const method = payment.paymentMethod || 'cash';
                byMethod[method] = (byMethod[method] || 0) + payment.amount;
            });

            // Group by collector
            const byCollector = {};
            for (const payment of payments.data) {
                const collectorId = payment.collectedBy;
                if (!byCollector[collectorId]) {
                    byCollector[collectorId] = {
                        name: localStorage.getItem('userName') || 'Unknown',
                        total: 0,
                        count: 0
                    };
                }
                byCollector[collectorId].total += payment.amount;
                byCollector[collectorId].count += 1;
            }

            return {
                success: true,
                data: {
                    date: formatDate(date),
                    totalRevenue,
                    totalTransactions,
                    averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
                    byMethod,
                    byCollector,
                    payments: payments.data
                }
            };
        } catch (error) {
            console.error('Error generating daily report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate monthly revenue report
    async generateMonthlyReport(month, year) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const payments = await rentPayment.getPaymentsByDateRange(startDate, endDate);

            if (!payments.success) {
                return { success: false, error: 'Failed to fetch payments' };
            }

            const totalRevenue = payments.data.reduce((sum, payment) => sum + payment.amount, 0);
            const totalTransactions = payments.data.length;

            // Group by day
            const byDay = {};
            payments.data.forEach(payment => {
                const day = formatDate(payment.paymentDate);
                byDay[day] = (byDay[day] || 0) + payment.amount;
            });

            // Calculate expected revenue
            const occupancyStats = await propertyMgmt.getOccupancyStats();
            const expectedRevenue = await this.calculateExpectedRevenue();

            return {
                success: true,
                data: {
                    month: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    totalRevenue,
                    expectedRevenue: expectedRevenue.total,
                    collectionRate: expectedRevenue.total > 0 ? ((totalRevenue / expectedRevenue.total) * 100).toFixed(1) : 0,
                    totalTransactions,
                    byDay,
                    occupiedShops: occupancyStats.data?.occupied || 0,
                    payments: payments.data
                }
            };
        } catch (error) {
            console.error('Error generating monthly report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate annual revenue report
    async generateAnnualReport(year) {
        try {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59);

            const payments = await rentPayment.getPaymentsByDateRange(startDate, endDate);

            if (!payments.success) {
                return { success: false, error: 'Failed to fetch payments' };
            }

            const totalRevenue = payments.data.reduce((sum, payment) => sum + payment.amount, 0);

            // Group by month
            const byMonth = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            monthNames.forEach(month => {
                byMonth[month] = 0;
            });

            payments.data.forEach(payment => {
                const date = payment.paymentDate.toDate();
                const month = monthNames[date.getMonth()];
                byMonth[month] += payment.amount;
            });

            // Find best and worst months
            let bestMonth = { name: '', revenue: 0 };
            let worstMonth = { name: '', revenue: Infinity };

            Object.entries(byMonth).forEach(([month, revenue]) => {
                if (revenue > bestMonth.revenue) {
                    bestMonth = { name: month, revenue };
                }
                if (revenue < worstMonth.revenue && revenue > 0) {
                    worstMonth = { name: month, revenue };
                }
            });

            return {
                success: true,
                data: {
                    year,
                    totalRevenue,
                    averageMonthly: totalRevenue / 12,
                    totalTransactions: payments.data.length,
                    byMonth,
                    bestMonth,
                    worstMonth: worstMonth.revenue === Infinity ? { name: 'N/A', revenue: 0 } : worstMonth
                }
            };
        } catch (error) {
            console.error('Error generating annual report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate outstanding balances report
    async generateOutstandingReport() {
        try {
            const tenantsWithArrears = await tenantMgmt.getTenantsWithArrears();

            if (!tenantsWithArrears.success) {
                return { success: false, error: 'Failed to fetch arrears' };
            }

            const totalOutstanding = tenantsWithArrears.data.reduce((sum, tenant) => sum + tenant.arrears, 0);
            const totalTenants = tenantsWithArrears.data.length;

            // Sort by amount owed
            const sortedByAmount = [...tenantsWithArrears.data].sort((a, b) => b.arrears - a.arrears);

            // Calculate aging (how long overdue)
            const aging = {
                current: 0,
                '30days': 0,
                '60days': 0,
                '90daysPlus': 0
            };

            for (const tenant of tenantsWithArrears.data) {
                const lastPayment = await dbService.query('payments', [
                    { field: 'tenantId', operator: '==', value: tenant.id }
                ], { field: 'paymentDate', direction: 'desc' }, 1);

                if (lastPayment.data && lastPayment.data.length > 0) {
                    const lastPaymentDate = lastPayment.data[0].paymentDate.toDate();
                    const daysSince = Math.floor((new Date() - lastPaymentDate) / (1000 * 60 * 60 * 24));

                    if (daysSince <= 30) aging.current += tenant.arrears;
                    else if (daysSince <= 60) aging['30days'] += tenant.arrears;
                    else if (daysSince <= 90) aging['60days'] += tenant.arrears;
                    else aging['90daysPlus'] += tenant.arrears;
                } else {
                    aging.current += tenant.arrears;
                }
            }

            return {
                success: true,
                data: {
                    totalOutstanding,
                    totalTenants,
                    averageOutstanding: totalTenants > 0 ? totalOutstanding / totalTenants : 0,
                    tenants: sortedByAmount,
                    aging
                }
            };
        } catch (error) {
            console.error('Error generating outstanding report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate occupancy report
    async generateOccupancyReport() {
        try {
            const stats = await propertyMgmt.getOccupancyStats();

            if (!stats.success) {
                return { success: false, error: 'Failed to fetch occupancy data' };
            }

            // Get all buildings with their occupancy
            const buildings = await propertyMgmt.getAllBuildings();
            const buildingOccupancy = [];

            for (const building of buildings.data) {
                const shops = await propertyMgmt.getShopsByBuilding(building.id);
                const occupied = shops.data.filter(shop => shop.status === 'occupied').length;
                const total = shops.data.length;
                const rate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

                buildingOccupancy.push({
                    buildingName: building.name,
                    total,
                    occupied,
                    vacant: total - occupied,
                    occupancyRate: rate
                });
            }

            return {
                success: true,
                data: {
                    overall: stats.data,
                    byBuilding: buildingOccupancy
                }
            };
        } catch (error) {
            console.error('Error generating occupancy report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate vacant shops report
    async generateVacantShopsReport() {
        try {
            const vacantShops = await propertyMgmt.getVacantShops();

            if (!vacantShops.success) {
                return { success: false, error: 'Failed to fetch vacant shops' };
            }

            // Enrich with building and floor info
            const enrichedShops = [];

            for (const shop of vacantShops.data) {
                const building = await propertyMgmt.getBuilding(shop.buildingId);
                const floor = await dbService.read('floors', shop.floorId);

                enrichedShops.push({
                    ...shop,
                    buildingName: building.data?.name || 'Unknown',
                    floorName: floor.data?.floorName || 'Unknown'
                });
            }

            return {
                success: true,
                data: {
                    totalVacant: vacantShops.data.length,
                    potentialRevenue: vacantShops.data.reduce((sum, shop) => sum + shop.monthlyRent, 0),
                    shops: enrichedShops
                }
            };
        } catch (error) {
            console.error('Error generating vacant shops report:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate tenant payment history report
    async generateTenantPaymentHistory(tenantId) {
        try {
            const tenant = await tenantMgmt.getTenant(tenantId);
            if (!tenant.success) {
                return { success: false, error: 'Tenant not found' };
            }

            const payments = await tenantMgmt.getTenantPayments(tenantId);
            const lease = await tenantMgmt.getTenantLease(tenantId);
            const balance = await tenantMgmt.getTenantBalance(tenantId);

            const totalPaid = payments.data.reduce((sum, payment) => sum + payment.amount, 0);
            const averagePayment = payments.data.length > 0 ? totalPaid / payments.data.length : 0;

            return {
                success: true,
                data: {
                    tenant: tenant.data,
                    currentLease: lease.data && lease.data.length > 0 ? lease.data[0] : null,
                    balance: balance,
                    totalPaid,
                    totalPayments: payments.data.length,
                    averagePayment,
                    payments: payments.data
                }
            };
        } catch (error) {
            console.error('Error generating tenant payment history:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate collector performance report
    async generateCollectorPerformance(startDate, endDate) {
        try {
            const payments = await rentPayment.getPaymentsByDateRange(startDate, endDate);

            if (!payments.success) {
                return { success: false, error: 'Failed to fetch payments' };
            }

            // Group by collector
            const collectorStats = {};

            for (const payment of payments.data) {
                const collectorId = payment.collectedBy;

                if (!collectorStats[collectorId]) {
                    // Fetch collector name
                    const user = await dbService.read('users', collectorId);
                    collectorStats[collectorId] = {
                        name: user.data?.fullName || 'Unknown',
                        totalCollected: 0,
                        transactions: 0,
                        averageTransaction: 0
                    };
                }

                collectorStats[collectorId].totalCollected += payment.amount;
                collectorStats[collectorId].transactions += 1;
            }

            // Calculate averages
            Object.keys(collectorStats).forEach(collectorId => {
                const stats = collectorStats[collectorId];
                stats.averageTransaction = stats.totalCollected / stats.transactions;
            });

            // Convert to array and sort by total collected
            const collectors = Object.entries(collectorStats).map(([id, stats]) => ({
                id,
                ...stats
            })).sort((a, b) => b.totalCollected - a.totalCollected);

            return {
                success: true,
                data: {
                    period: `${formatDate(startDate)} - ${formatDate(endDate)}`,
                    collectors,
                    totalCollected: payments.data.reduce((sum, p) => sum + p.amount, 0)
                }
            };
        } catch (error) {
            console.error('Error generating collector performance:', error);
            return { success: false, error: error.message };
        }
    }

    // Calculate expected monthly revenue
    async calculateExpectedRevenue() {
        try {
            const occupiedShops = await dbService.query('shops', [
                { field: 'status', operator: '==', value: 'occupied' }
            ]);

            if (!occupiedShops.success) {
                return { total: 0, breakdown: [] };
            }

            const total = occupiedShops.data.reduce((sum, shop) => sum + shop.monthlyRent, 0);

            return {
                total,
                breakdown: occupiedShops.data.map(shop => ({
                    shopNumber: shop.shopNumber,
                    monthlyRent: shop.monthlyRent
                }))
            };
        } catch (error) {
            console.error('Error calculating expected revenue:', error);
            return { total: 0, breakdown: [] };
        }
    }

    // Export report to CSV
    exportReportToCSV(reportData, filename) {
        exportToCSV(reportData, filename);
    }
}

// Create global instance
const reportsMgmt = new ReportsManagement();
