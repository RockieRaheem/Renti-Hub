# RentiHub - Smart Commercial Rent & Property Management System

A comprehensive digital platform for managing commercial properties, rent collection, tenant management, and financial reporting in Uganda.

## 🚀 Features

- **Multi-Role Authentication** - Admin, Owner, Property Manager, and Tenant roles
- **Building & Property Management** - Manage buildings, floors, and shops
- **Tenant Management** - Complete tenant profiles with lease tracking
- **Rent Collection** - Digital payment recording with automatic receipt generation
- **Financial Reports** - Daily, monthly, and annual revenue reports
- **Maintenance Requests** - Submit and track maintenance issues
- **Dashboard Analytics** - Role-specific dashboards with real-time data
- **Notification System** - SMS and Email notifications (configurable)
- **Occupancy Tracking** - Real-time vacancy and occupancy reports

## 📋 Prerequisites

Before you begin, ensure you have the following:

- A Firebase account ([firebase.google.com](https://firebase.google.com))
- A modern web browser
- A web server (Apache, Nginx, or simple HTTP server for development)
- (Optional) SMS provider account (e.g., Africa's Talking)
- (Optional) Email provider account (e.g., SendGrid)

## 🔧 Installation & Setup

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "RentiHub"
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** provider
4. Enable **Cloud Firestore**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose your region (closest to Uganda)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click the Web icon (</>) to add a web app
   - Register app with name "RentiHub Web"
   - Copy the firebaseConfig object

### Step 2: Configure Firebase

1. Open `config/firebase-config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Firestore Security Rules

Go to Firebase Console > Firestore Database > Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Buildings, Floors, Shops
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'owner']);
    }
    
    // Tenants can read their own data
    match /tenants/{tenantId} {
      allow read: if request.auth != null;
    }
    
    // Payments & Receipts
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    match /receipts/{receiptId} {
      allow read: if request.auth != null;
    }
    
    // Maintenance requests
    match /maintenance_requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
  }
}
```

### Step 4: Deploy Application

#### Option 1: Local Development Server

```bash
# Using Python 3
cd /path/to/Renti-Hub
python3 -m http.server 8000

# Or using PHP
php -S localhost:8000

# Or using Node.js http-server
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd /path/to/Renti-Hub
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Step 5: Create First Admin User

1. Register a new user at `http://localhost:8000/register.html`
2. Go to Firebase Console > Firestore Database
3. Find the `users` collection and your user document
4. Edit the document and change `role` from `tenant` to `admin`
5. Log out and log back in

## 📁 Project Structure

```
Renti-Hub/
├── config/
│   └── firebase-config.js         # Firebase configuration
├── js/
│   ├── auth.js                    # Authentication service
│   ├── database.js                # Database operations
│   ├── property-management.js     # Building, Floor, Shop management
│   ├── tenant-management.js       # Tenant operations
│   ├── rent-payment.js            # Payment & receipt handling
│   ├── maintenance.js             # Maintenance requests
│   ├── reports.js                 # Financial reports
│   ├── dashboard.js               # Dashboard data
│   ├── notifications.js           # SMS/Email notifications
│   └── utils.js                   # Utility functions
├── executive_dashboard/
│   └── code.html                  # Owner dashboard
├── property_shop_management/
│   └── code.html                  # Property management page
├── tenant_directory/
│   └── code.html                  # Tenant directory
├── rent_collection_payments/
│   └── code.html                  # Rent collection page
├── maintenance_requests/
│   └── code.html                  # Maintenance page
├── financial_reports/
│   └── code.html                  # Reports page
├── maintenance_board/
│   └── code.html                  # Maintenance board
├── login.html                     # Login page
├── register.html                  # Registration page
└── README.md                      # This file
```

## 🎯 User Roles & Permissions

### Admin
- Full system access
- Manage all users and roles
- Delete records
- View audit logs

### Building Owner
- View financial dashboards
- Monitor all buildings
- View reports (read-only)

### Property Manager / Rent Collector
- Register tenants
- Record rent payments
- Generate receipts
- Manage shops and leases
- Handle maintenance requests

### Tenant
- View payment history
- Download receipts
- Submit maintenance requests
- View lease information

## 💡 Usage Guide

### For Property Managers

#### Adding a Building
1. Navigate to Property & Shop Management
2. Click "Add Building"
3. Enter building details (name, address, floors)
4. Click "Save"

#### Adding Shops
1. Select a building
2. Click "Add Shop"
3. Enter shop details (number, floor, monthly rent)
4. Click "Save"

#### Registering a Tenant
1. Navigate to Tenant Directory
2. Click "Add Tenant"
3. Fill in tenant information
4. Click "Save"

#### Assigning Tenant to Shop
1. Go to Property & Shop Management
2. Find a vacant shop
3. Click "Assign Tenant"
4. Select tenant and enter lease details
5. Click "Assign"

#### Recording Rent Payment
1. Navigate to Rent Collection
2. Click "Record Payment"
3. Select tenant and shop
4. Enter payment amount
5. Click "Submit" - Receipt auto-generates

### For Tenants

#### Viewing Payment History
1. Log in to your account
2. Dashboard shows your balance and recent payments
3. Click on any payment to download receipt

#### Submitting Maintenance Request
1. Go to Maintenance Requests
2. Click "New Request"
3. Fill in details and submit

## 🔌 Optional Integrations

### SMS Notifications (Africa's Talking)

Edit `js/notifications.js` and uncomment the SMS integration code:

```javascript
async sendSMS(phone, message) {
  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'apiKey': 'YOUR_API_KEY',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      username: 'YOUR_USERNAME',
      to: phone,
      message: message
    })
  });
  return await response.json();
}
```

### Email Notifications (SendGrid)

Edit `js/notifications.js` and uncomment the email integration code.

## 🛠️ Troubleshooting

### Firebase Authentication Error
- Ensure Email/Password provider is enabled in Firebase Console
- Check that Firebase config is correctly set

### Firestore Permission Denied
- Update Firestore security rules as shown in Step 3
- Ensure user has correct role in Firestore

### Page Not Loading
- Check browser console for errors
- Ensure all script files are properly linked
- Verify Firebase SDK is loading

## 📊 Database Collections

The system uses the following Firestore collections:

- `users` - User accounts and roles
- `buildings` - Building information
- `floors` - Floor details
- `shops` - Shop/unit information
- `tenants` - Tenant profiles
- `leases` - Lease agreements
- `payments` - Payment records
- `receipts` - Receipt records
- `maintenance_requests` - Maintenance tickets
- `notifications` - Notification queue
- `audit_logs` - System audit trail

## 🚧 Future Enhancements

- Mobile Money integration (MTN, Airtel)
- QR Code receipt verification
- Mobile application (Android & iOS)
- WhatsApp notifications
- AI-based rent predictions
- Digital lease signing
- Multi-language support
- Advanced analytics

## 📄 License

Copyright © 2026 RentiHub. All rights reserved.

## 👥 Support

For technical support or questions:
- Email: support@rentihub.com
- Documentation: [Link to docs]

---

Built with ❤️ for property management in Uganda
