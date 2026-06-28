// Notification Service for RentiHub
// Handles SMS and Email notifications

class NotificationService {
    constructor() {
        this.notificationQueue = [];
        this.processing = false;
    }

    // Send payment confirmation
    async sendPaymentConfirmation(tenantPhone, tenantEmail, receiptData) {
        const message = `
      RentiHub Payment Confirmation
      Receipt: ${receiptData.receiptNumber}
      Amount Paid: ${formatCurrency(receiptData.amount)}
      New Balance: ${formatCurrency(receiptData.newBalance)}
      Date: ${formatDate(receiptData.paymentDate)}
      Thank you for your payment!
    `.trim();

        return await this.sendNotification({
            type: 'payment_confirmation',
            phone: tenantPhone,
            email: tenantEmail,
            message: message,
            data: receiptData
        });
    }

    // Send rent reminder
    async sendRentReminder(tenantPhone, tenantEmail, tenantName, amountDue, shopNumber) {
        const message = `
      Dear ${tenantName},
      This is a reminder that your rent payment of ${formatCurrency(amountDue)} for Shop ${shopNumber} is due.
      Please make payment at your earliest convenience.
      Thank you - RentiHub Management
    `.trim();

        return await this.sendNotification({
            type: 'rent_reminder',
            phone: tenantPhone,
            email: tenantEmail,
            message: message,
            data: { tenantName, amountDue, shopNumber }
        });
    }

    // Send lease expiry reminder
    async sendLeaseExpiryReminder(tenantPhone, tenantEmail, tenantName, expiryDate, shopNumber) {
        const daysUntil = getDaysUntilDue(expiryDate);

        const message = `
      Dear ${tenantName},
      Your lease for Shop ${shopNumber} will expire in ${daysUntil} days (${formatDate(expiryDate)}).
      Please contact management to discuss renewal.
      Thank you - RentiHub Management
    `.trim();

        return await this.sendNotification({
            type: 'lease_expiry',
            phone: tenantPhone,
            email: tenantEmail,
            message: message,
            data: { tenantName, expiryDate, shopNumber, daysUntil }
        });
    }

    // Send maintenance update
    async sendMaintenanceUpdate(tenantPhone, tenantEmail, requestTitle, newStatus) {
        const message = `
      RentiHub Maintenance Update
      Request: ${requestTitle}
      Status: ${newStatus.toUpperCase()}
      We will keep you updated on the progress.
      Thank you - RentiHub Management
    `.trim();

        return await this.sendNotification({
            type: 'maintenance_update',
            phone: tenantPhone,
            email: tenantEmail,
            message: message,
            data: { requestTitle, newStatus }
        });
    }

    // Generic send notification method
    async sendNotification(notificationData) {
        try {
            // Create notification record
            const notification = await dbService.create('notifications', {
                type: notificationData.type,
                phone: notificationData.phone,
                email: notificationData.email,
                message: notificationData.message,
                status: 'pending',
                sentDate: null,
                deliveryStatus: null,
                data: notificationData.data || {}
            });

            if (notification.success) {
                // Add to queue for processing
                this.notificationQueue.push({
                    id: notification.id,
                    ...notificationData
                });

                // Process queue if not already processing
                if (!this.processing) {
                    await this.processQueue();
                }

                return { success: true, notificationId: notification.id };
            }

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Process notification queue
    async processQueue() {
        if (this.processing || this.notificationQueue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();

            try {
                // Simulate sending SMS (integrate with actual SMS API like Africa's Talking)
                if (notification.phone) {
                    await this.sendSMS(notification.phone, notification.message);
                }

                // Simulate sending Email (integrate with actual Email service like SendGrid)
                if (notification.email) {
                    await this.sendEmail(notification.email, notification.type, notification.message);
                }

                // Update notification status
                await dbService.update('notifications', notification.id, {
                    status: 'sent',
                    sentDate: firebase.firestore.FieldValue.serverTimestamp(),
                    deliveryStatus: 'delivered'
                });

                console.log(`Notification ${notification.id} sent successfully`);
            } catch (error) {
                console.error(`Error processing notification ${notification.id}:`, error);

                // Update notification with error
                await dbService.update('notifications', notification.id, {
                    status: 'failed',
                    deliveryStatus: 'failed',
                    errorMessage: error.message
                });
            }

            // Small delay between notifications
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.processing = false;
    }

    // Send SMS (placeholder - integrate with SMS provider)
    async sendSMS(phone, message) {
        // TODO: Integrate with Africa's Talking or other SMS provider
        // Example:
        // const response = await fetch('https://api.africastalking.com/version1/messaging', {
        //   method: 'POST',
        //   headers: {
        //     'apiKey': 'YOUR_API_KEY',
        //     'Content-Type': 'application/x-www-form-urlencoded'
        //   },
        //   body: new URLSearchParams({
        //     username: 'YOUR_USERNAME',
        //     to: phone,
        //     message: message
        //   })
        // });

        console.log(`SMS would be sent to ${phone}: ${message}`);
        return { success: true };
    }

    // Send Email (placeholder - integrate with email provider)
    async sendEmail(email, subject, message) {
        // TODO: Integrate with SendGrid, AWS SES, or other email provider
        // Example with SendGrid:
        // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': 'Bearer YOUR_API_KEY',
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     personalizations: [{ to: [{ email: email }] }],
        //     from: { email: 'noreply@rentihub.com', name: 'RentiHub' },
        //     subject: subject,
        //     content: [{ type: 'text/plain', value: message }]
        //   })
        // });

        console.log(`Email would be sent to ${email} with subject "${subject}": ${message}`);
        return { success: true };
    }

    // Get all notifications
    async getAllNotifications() {
        return await dbService.readAll('notifications', 'createdAt', 'desc');
    }

    // Get pending notifications
    async getPendingNotifications() {
        return await dbService.query('notifications', [
            { field: 'status', operator: '==', value: 'pending' }
        ]);
    }

    // Get notifications by tenant
    async getNotificationsByTenant(tenantId) {
        return await dbService.query('notifications', [
            { field: 'tenantId', operator: '==', value: tenantId }
        ], { field: 'createdAt', direction: 'desc' });
    }

    // Schedule rent reminders (run daily)
    async scheduleRentReminders() {
        try {
            // Get all tenants with arrears
            const tenantsWithArrears = await tenantMgmt.getTenantsWithArrears();

            if (!tenantsWithArrears.success || tenantsWithArrears.data.length === 0) {
                console.log('No tenants with arrears to remind');
                return;
            }

            for (const tenant of tenantsWithArrears.data) {
                // Get shop info
                const lease = await tenantMgmt.getTenantLease(tenant.id);
                if (lease.data && lease.data.length > 0) {
                    const shop = await propertyMgmt.getShop(lease.data[0].shopId);

                    await this.sendRentReminder(
                        tenant.phone,
                        tenant.email,
                        tenant.fullName,
                        tenant.arrears,
                        shop.data?.shopNumber || 'N/A'
                    );
                }
            }

            console.log(`Sent ${tenantsWithArrears.data.length} rent reminders`);
        } catch (error) {
            console.error('Error scheduling rent reminders:', error);
        }
    }

    // Schedule lease expiry reminders (run daily)
    async scheduleLeaseExpiryReminders() {
        try {
            // Get all active leases
            const leases = await dbService.query('leases', [
                { field: 'status', operator: '==', value: 'active' }
            ]);

            if (!leases.success || leases.data.length === 0) {
                return;
            }

            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            for (const lease of leases.data) {
                const expiryDate = lease.endDate.toDate();

                // Send reminder if lease expires within 30 days
                if (expiryDate <= thirtyDaysFromNow && expiryDate > now) {
                    const tenant = await tenantMgmt.getTenant(lease.tenantId);
                    const shop = await propertyMgmt.getShop(lease.shopId);

                    if (tenant.success && shop.success) {
                        await this.sendLeaseExpiryReminder(
                            tenant.data.phone,
                            tenant.data.email,
                            tenant.data.fullName,
                            expiryDate,
                            shop.data.shopNumber
                        );
                    }
                }
            }

            console.log('Lease expiry reminders processed');
        } catch (error) {
            console.error('Error scheduling lease expiry reminders:', error);
        }
    }
}

// Create global instance
const notificationService = new NotificationService();
