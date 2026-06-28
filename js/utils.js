// Utility Functions for RentiHub

// Format currency to UGX
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const d = date.toDate ? date.toDate() : new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } else if (format === 'long') {
    return d.toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (format === 'time') {
    return d.toLocaleTimeString('en-UG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString();
}

// Generate unique ID
function generateId(prefix = '') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}${timestamp}${random}`;
}

// Generate receipt number
function generateReceiptNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `RH-${year}${month}${day}-${random}`;
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white transition-all transform translate-x-full`;
  
  // Set background color based on type
  switch(type) {
    case 'success':
      toast.classList.add('bg-status-paid');
      break;
    case 'error':
      toast.classList.add('bg-status-unpaid');
      break;
    case 'warning':
      toast.classList.add('bg-status-partial');
      break;
    default:
      toast.classList.add('bg-primary');
  }
  
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Show loading spinner
function showLoading(text = 'Loading...') {
  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  loader.innerHTML = `
    <div class="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p class="text-on-surface font-medium">${text}</p>
    </div>
  `;
  document.body.appendChild(loader);
}

// Hide loading spinner
function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    document.body.removeChild(loader);
  }
}

// Show confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel = null) {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md mx-4">
      <h3 class="text-xl font-bold text-on-surface mb-4">Confirm Action</h3>
      <p class="text-on-surface-variant mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button id="cancel-btn" class="px-6 py-2 rounded-lg border border-outline text-on-surface hover:bg-surface-container">
          Cancel
        </button>
        <button id="confirm-btn" class="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-container">
          Confirm
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  document.getElementById('confirm-btn').addEventListener('click', () => {
    document.body.removeChild(dialog);
    if (onConfirm) onConfirm();
  });
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.body.removeChild(dialog);
    if (onCancel) onCancel();
  });
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (Uganda format)
function validatePhone(phone) {
  // Uganda phone: +256 or 0 followed by 9 digits
  const re = /^(\+256|0)[7][0-9]{8}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Format phone number
function formatPhone(phone) {
  phone = phone.replace(/\s/g, '');
  if (phone.startsWith('0')) {
    return '+256' + phone.substring(1);
  }
  return phone;
}

// Calculate rent balance
function calculateBalance(totalRent, amountPaid) {
  return totalRent - amountPaid;
}

// Get payment status
function getPaymentStatus(totalRent, amountPaid) {
  const balance = calculateBalance(totalRent, amountPaid);
  
  if (balance <= 0) {
    return { status: 'paid', label: 'Paid', class: 'bg-status-paid' };
  } else if (amountPaid > 0) {
    return { status: 'partial', label: 'Partial', class: 'bg-status-partial' };
  } else {
    return { status: 'unpaid', label: 'Unpaid', class: 'bg-status-unpaid' };
  }
}

// Export to CSV
function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    showToast('No data to export', 'warning');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if date is overdue
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  return due < new Date();
}

// Get days until due
function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  const now = new Date();
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
