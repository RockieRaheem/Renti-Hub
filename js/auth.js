// Authentication Module for RentiHub
// Handles user login, registration, role-based access control

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
  }

  // Initialize auth state listener
  init() {
    const { auth, db } = initializeFirebase();
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserRole(user.uid);
        this.redirectBasedOnRole();
      } else {
        this.currentUser = null;
        this.userRole = null;
        // Redirect to login if not on login/register page
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('register')) {
          window.location.href = '/login.html';
        }
      }
    });
  }

  // Load user role from Firestore
  async loadUserRole(uid) {
    const { db } = initializeFirebase();
    
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        this.userRole = userDoc.data().role;
        localStorage.setItem('userRole', this.userRole);
        localStorage.setItem('userName', userDoc.data().fullName);
        return this.userRole;
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
    return null;
  }

  // Register new user
  async register(email, password, userData) {
    const { auth, db } = initializeFirebase();
    
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role || 'tenant',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        active: true
      });

      // Create audit log
      await this.createAuditLog(user.uid, 'USER_REGISTERED', `New user registered: ${email}`);
      
      return { success: true, user: user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(email, password) {
    const { auth } = initializeFirebase();
    
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      await this.loadUserRole(user.uid);
      await this.createAuditLog(user.uid, 'USER_LOGIN', `User logged in: ${email}`);
      
      return { success: true, user: user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    const { auth } = initializeFirebase();
    
    try {
      await auth.signOut();
      localStorage.clear();
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Reset password
  async resetPassword(email) {
    const { auth } = initializeFirebase();
    
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has permission
  hasPermission(requiredRole) {
    const roleHierarchy = {
      'admin': 4,
      'owner': 3,
      'manager': 2,
      'tenant': 1
    };
    
    const userLevel = roleHierarchy[this.userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  // Redirect based on user role
  redirectBasedOnRole() {
    if (window.location.pathname.includes('login') || 
        window.location.pathname.includes('register')) {
      
      switch(this.userRole) {
        case 'admin':
        case 'owner':
          window.location.href = '/executive_dashboard/code.html';
          break;
        case 'manager':
          window.location.href = '/rent_collection_payments/code.html';
          break;
        case 'tenant':
          window.location.href = '/tenant_directory/code.html';
          break;
        default:
          window.location.href = '/executive_dashboard/code.html';
      }
    }
  }

  // Create audit log
  async createAuditLog(userId, action, description) {
    const { db } = initializeFirebase();
    
    try {
      await db.collection('audit_logs').add({
        userId: userId,
        action: action,
        description: description,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        ipAddress: await this.getClientIP()
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  // Get client IP (simplified)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user role
  getUserRole() {
    return this.userRole || localStorage.getItem('userRole');
  }
}

// Create global instance
const authService = new AuthService();
