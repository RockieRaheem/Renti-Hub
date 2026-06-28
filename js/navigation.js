// Shared Navigation Component for RentiHub
// Include this file in all pages to add consistent navigation

class NavigationComponent {
    constructor() {
        this.userRole = null;
        this.userName = null;
    }

    // Initialize navigation
    async init() {
        this.userRole = authService.getUserRole();
        this.userName = localStorage.getItem('userName') || 'User';

        // Check if user is authenticated
        if (!authService.getCurrentUser() && !window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
            window.location.href = '/auth/login.html';
            return;
        }

        this.renderNavigation();
        this.attachEventListeners();
    }

    // Get navigation items based on role
    getNavigationItems() {
        const baseItems = [];

        // Admin & Owner
        if (this.userRole === 'admin' || this.userRole === 'owner') {
            baseItems.push(
                { icon: 'dashboard', label: 'Dashboard', href: '/executive_dashboard/code.html' },
                { icon: 'apartment', label: 'Properties', href: '/property_shop_management/code.html' },
                { icon: 'people', label: 'Tenants', href: '/tenant_directory/code.html' },
                { icon: 'payments', label: 'Rent Collection', href: '/rent_collection_payments/code.html' },
                { icon: 'build', label: 'Maintenance', href: '/maintenance_board/code.html' },
                { icon: 'assessment', label: 'Reports', href: '/financial_reports/code.html' }
            );
        }

        // Property Manager
        if (this.userRole === 'manager') {
            baseItems.push(
                { icon: 'payments', label: 'Rent Collection', href: '/rent_collection_payments/code.html' },
                { icon: 'apartment', label: 'Properties', href: '/property_shop_management/code.html' },
                { icon: 'people', label: 'Tenants', href: '/tenant_directory/code.html' },
                { icon: 'build', label: 'Maintenance', href: '/maintenance_requests/code.html' },
                { icon: 'assessment', label: 'Reports', href: '/financial_reports/code.html' }
            );
        }

        // Tenant
        if (this.userRole === 'tenant') {
            baseItems.push(
                { icon: 'home', label: 'My Dashboard', href: '/tenant_directory/code.html' },
                { icon: 'receipt', label: 'Payment History', href: '/rent_collection_payments/code.html' },
                { icon: 'build', label: 'Maintenance', href: '/maintenance_requests/code.html' }
            );
        }

        return baseItems;
    }

    // Render navigation (updates existing sidebar)
    renderNavigation() {
        const sidebar = document.querySelector('aside nav');
        if (!sidebar) return;

        const items = this.getNavigationItems();
        const currentPath = window.location.pathname;

        let html = '';
        items.forEach(item => {
            const isActive = currentPath.includes(item.href);
            html += `
        <a class="flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} rounded-lg ${isActive ? 'font-medium' : 'text-white/70 hover:text-white'} transition-all" href="${item.href}">
          <span class="material-symbols-outlined">${item.icon}</span>
          ${item.label}
        </a>
      `;
        });

        // Add logout button
        html += `
      <a id="logoutBtn" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer mt-auto">
        <span class="material-symbols-outlined">logout</span>
        Logout
      </a>
    `;

        sidebar.innerHTML = html;

        // Update user name in header
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = this.userName;
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await authService.logout();
            });
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('aside');

        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('hidden');
                sidebar.classList.toggle('flex');
            });
        }
    }

    // Update page title
    setPageTitle(title) {
        document.title = `${title} | RentiHub Enterprise`;
        const pageHeader = document.querySelector('h1');
        if (pageHeader) {
            pageHeader.textContent = title;
        }
    }

    // Show user info banner
    showUserInfo() {
        const banner = document.createElement('div');
        banner.className = 'bg-primary text-white px-6 py-2 text-sm';
        banner.innerHTML = `
      <div class="container mx-auto flex items-center justify-between">
        <span>Logged in as <strong>${this.userName}</strong> (${this.userRole})</span>
        <button id="quickLogoutBtn" class="text-white/80 hover:text-white">
          <span class="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    `;

        document.body.insertBefore(banner, document.body.firstChild);

        document.getElementById('quickLogoutBtn').addEventListener('click', async () => {
            await authService.logout();
        });
    }
}

// Create global instance
const navigation = new NavigationComponent();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof authService !== 'undefined') {
            // navigation.init();
        }
    });
} else {
    if (typeof authService !== 'undefined') {
        // navigation.init();
    }
}
