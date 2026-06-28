# RentiHub Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" → "Add Project"
3. Name it "RentiHub" → Continue
4. Disable Google Analytics (optional) → Create Project

### 2. Enable Firebase Services

**Authentication:**
1. Click "Authentication" in left sidebar
2. Click "Get Started"
3. Click "Email/Password" → Enable → Save

**Firestore Database:**
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Start in **Production mode**
4. Select region closest to Uganda (europe-west)
5. Click "Enable"

### 3. Get Firebase Config

1. Click ⚙️ (Settings) → Project Settings
2. Scroll to "Your apps" section
3. Click the Web icon `</>`
4. Register app: Name = "RentiHub Web"
5. **Copy the firebaseConfig object**

### 4. Configure Your App

1. Open `config/firebase-config.js`
2. Replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← Paste from Firebase
  authDomain: "rentihub.firebaseapp.com",
  projectId: "rentihub-xxxxx",
  storageBucket: "rentihub-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxx"
};
```

### 5. Update Firestore Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Click "Publish"

### 6. Run the Application

**Option A: Simple Python Server**
```bash
cd /path/to/Renti-Hub
python3 -m http.server 8000
```

**Option B: PHP Server**
```bash
php -S localhost:8000
```

**Option C: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `login.html`
3. Select "Open with Live Server"

### 7. Create First User

1. Open `http://localhost:8000/register.html`
2. Register with your email and password
3. Go to Firebase Console → Firestore Database
4. Find your user in `users` collection
5. Click the document → Edit
6. Change `role` from `tenant` to `admin`
7. Save

### 8. Login

1. Go to `http://localhost:8000/login.html`
2. Login with your credentials
3. You'll be redirected to the Executive Dashboard

## 📱 Using the System

### For Property Managers

**Add a Building:**
1. Go to Property & Shop Management
2. Click "Add Building" button
3. Fill: Name, Address, Floors
4. Click "Save"

**Add Floors:**
1. Click on a building
2. Click "Add Floor"
3. Fill: Floor Number, Name
4. Click "Save"

**Add Shops:**
1. Click on a floor
2. Click "Add Shop"
3. Fill: Shop Number, Monthly Rent, Size
4. Click "Save"

**Register Tenant:**
1. Go to Tenant Directory
2. Click "Add Tenant"
3. Fill: Name, ID, Phone, Email, Business Name
4. Click "Save"

**Assign Tenant to Shop:**
1. Go to Property & Shop Management
2. Find vacant shop
3. Click "Assign Tenant"
4. Select tenant
5. Enter lease start/end dates
6. Click "Assign"

**Record Payment:**
1. Go to Rent Collection
2. Click "Record Payment"
3. Select tenant (shop auto-loads)
4. Enter amount and payment method
5. Click "Submit"
6. Receipt auto-generates
7. Print receipt

**View Reports:**
1. Go to Financial Reports
2. Select report type (Daily/Monthly/Annual)
3. Click "Generate"
4. Click "Export CSV" to download

### For Tenants

**View Balance:**
- Login → Dashboard shows current balance

**View Payment History:**
- Dashboard → Recent Payments section

**Download Receipt:**
- Click "View Receipt" on any payment

**Submit Maintenance Request:**
1. Dashboard → Maintenance section
2. Click "New Request"
3. Fill: Title, Description, Category
4. Click "Submit"

## 🔧 Troubleshooting

### "Permission Denied" Error
- Ensure Firestore rules are updated (Step 5)
- Check that user is authenticated

### "Firebase Config" Error
- Verify you copied ALL config values
- Check for typos in config file

### Page Not Loading
- Check browser console (F12) for errors
- Ensure all script files exist
- Verify Firebase SDK is loading

### Can't Login
- Check email/password are correct
- Verify user exists in Firebase Console
- Clear browser cache

## 📊 Database Structure

Your Firestore will have these collections:

- `users` - User accounts (email, role, name)
- `buildings` - Building info
- `floors` - Floor details  
- `shops` - Shop/unit info with rent amounts
- `tenants` - Tenant profiles
- `leases` - Active and past leases
- `payments` - All payment records
- `receipts` - Receipt records
- `maintenance_requests` - Maintenance tickets
- `notifications` - Notification queue
- `audit_logs` - System activity logs

## 🎯 Next Steps

1. **Add your buildings, floors, and shops**
2. **Register your tenants**
3. **Assign tenants to shops**
4. **Start recording payments**
5. **Generate reports**

## 🆘 Need Help?

**Common Issues:**

- **"Cannot read property..."** - Check if Firebase is initialized
- **"User not authenticated"** - Login again
- **"Collection not found"** - Collections auto-create on first write
- **Receipt not printing** - Check browser popup blocker

**Firebase Console Locations:**
- View users: Authentication → Users
- View data: Firestore Database → Data
- View logs: Firestore Database → Usage
- Change rules: Firestore Database → Rules

## ✅ System Ready!

Your RentiHub system is now fully functional and ready to:
- ✅ Manage multiple buildings, floors, and shops
- ✅ Register and track tenants
- ✅ Record rent payments with auto-receipts
- ✅ Generate financial reports
- ✅ Track maintenance requests
- ✅ Send notifications (once configured)
- ✅ Role-based access control

**Start managing your properties digitally today! 🎉**
