let adminID = 2;
let adminsData = [];
let isEditMode = false;
let editingRowId = null;

// Available permissions for each role
const rolePermissions = {
    'Super Admin': ['Read', 'Write', 'Delete', 'Approve'],
    'System Admin': ['Read', 'Write', 'Delete'],
    'Operations Admin': ['Read', 'Write'],
    'Analyst': ['Read'],
    'Auditor': ['Read']
};

// Dark Mode Toggle
window.addEventListener('load', () => {
    initializePage();
    setupDarkMode();
    setupEventListeners();
});

function setupDarkMode() {
    const darkModeBtn = document.getElementById('darkModeBtn');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        darkModeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

function initializePage() {
    // Initialize with sample data
    adminsData = [
        {
            id: 1,
            name: 'John Smith',
            email: 'john@company.com',
            role: 'Super Admin',
            department: 'IT',
            status: 'Active',
            lastLogin: 'Today',
            permissions: ['Read', 'Write', 'Delete']
        }
    ];
    updateStatistics();
    addCustomEventListeners();
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput')?.addEventListener('keyup', filterTable);
    
    // Role filter
    document.getElementById('roleFilter')?.addEventListener('change', filterTable);
    
    // Status filter
    document.getElementById('statusFilter')?.addEventListener('change', filterTable);
    
    // Checkbox interactions
    document.getElementById('selectAll')?.addEventListener('change', toggleSelectAll);
}

function addCustomEventListeners() {
    // Add interactive hover effects to rows
    const rows = document.querySelectorAll('.admin-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = '';
        });

        // Add pointer move effect
        row.addEventListener('pointermove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const moveAmount = (x / rect.width) * 10 - 5;
            this.style.transform = `translateX(${5 + moveAmount}px) rotateY(${moveAmount * 0.5}deg)`;
        });
    });
}

function openForm() {
    isEditMode = false;
    editingRowId = null;
    document.getElementById('formTitle').textContent = 'Add Administrator';
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('role').value = '';
    document.getElementById('department').value = '';
    document.getElementById('status').value = '';
    document.getElementById('phone').value = '';
    document.querySelectorAll('.permissions-grid input').forEach(cb => cb.checked = false);
    
    const overlay = document.getElementById('adminFormOverlay');
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    
    // Animate modal
    const modal = document.getElementById('adminForm');
    modal.style.animation = 'slideUp 0.3s ease';
}

function closeForm(event) {
    if (event && event.target !== document.getElementById('adminFormOverlay')) {
        return;
    }
    
    const overlay = document.getElementById('adminFormOverlay');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function addAdmin(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const department = document.getElementById('department').value.trim();
    const status = document.getElementById('status').value;
    const phone = document.getElementById('phone').value.trim();
    
    const selectedPermissions = Array.from(document.querySelectorAll('.permissions-grid input:checked'))
        .map(cb => cb.value);
    
    if (!name || !email || !role || !department || !status) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const adminData = {
        id: isEditMode ? editingRowId : adminID++,
        name,
        email,
        role,
        department,
        status,
        phone,
        permissions: selectedPermissions.length > 0 ? selectedPermissions : rolePermissions[role]
    };
    
    if (isEditMode) {
        // Update existing record
        const index = adminsData.findIndex(a => a.id === editingRowId);
        if (index > -1) {
            adminsData[index] = adminData;
            updateTableRow(adminData);
            showNotification('Administrator updated successfully', 'success');
        }
    } else {
        // Add new record
        adminsData.push(adminData);
        addTableRow(adminData);
        showNotification('Administrator added successfully', 'success');
    }
    
    updateStatistics();
    closeForm();
}

function addTableRow(adminData) {
    const table = document.getElementById('adminList');
    const row = table.insertRow();
    row.className = 'admin-row';
    row.setAttribute('data-id', adminData.id);
    
    const avatarColor = generateAvatarColor(adminData.name);
    const initials = adminData.name.split(' ').map(n => n[0]).join('');
    
    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"> ${adminData.id}</td>
        <td>
            <div class="profile-cell">
                <img src="https://via.placeholder.com/40${avatarColor}/ffffff?text=${initials}" alt="${adminData.name}" class="avatar">
                <div class="profile-info">
                    <span class="name">${adminData.name}</span>
                    <span class="role-badge ${adminData.role.toLowerCase().replace(/\s+/g, '-')}-badge">${adminData.role}</span>
                </div>
            </div>
        </td>
        <td><a href="mailto:${adminData.email}">${adminData.email}</a></td>
        <td><span class="role-tag ${adminData.role.toLowerCase().replace(/\s+/g, '-')}">${adminData.role}</span></td>
        <td>${adminData.department}</td>
        <td><span class="status-badge ${adminData.status.toLowerCase()}">${adminData.status}</span></td>
        <td><span class="last-login">Just Now</span></td>
        <td>
            ${adminData.permissions.map(p => `<span class="permission-badge">${p}</span>`).join('')}
        </td>
        <td class="actions-cell">
            <button class="btn-action edit" title="Edit" onclick="editAdmin(this)">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action view" title="View Details" onclick="viewAdmin(this)">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-action delete" title="Delete" onclick="deleteAdmin(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Add hover effects to new row
    addRowHoverEffects(row);
    updateRecordCount();
}

function updateTableRow(adminData) {
    const row = document.querySelector(`tr[data-id="${adminData.id}"]`);
    if (!row) return;
    
    const avatarColor = generateAvatarColor(adminData.name);
    const initials = adminData.name.split(' ').map(n => n[0]).join('');
    
    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"> ${adminData.id}</td>
        <td>
            <div class="profile-cell">
                <img src="https://via.placeholder.com/40${avatarColor}/ffffff?text=${initials}" alt="${adminData.name}" class="avatar">
                <div class="profile-info">
                    <span class="name">${adminData.name}</span>
                    <span class="role-badge ${adminData.role.toLowerCase().replace(/\s+/g, '-')}-badge">${adminData.role}</span>
                </div>
            </div>
        </td>
        <td><a href="mailto:${adminData.email}">${adminData.email}</a></td>
        <td><span class="role-tag ${adminData.role.toLowerCase().replace(/\s+/g, '-')}">${adminData.role}</span></td>
        <td>${adminData.department}</td>
        <td><span class="status-badge ${adminData.status.toLowerCase()}">${adminData.status}</span></td>
        <td><span class="last-login">Just Now</span></td>
        <td>
            ${adminData.permissions.map(p => `<span class="permission-badge">${p}</span>`).join('')}
        </td>
        <td class="actions-cell">
            <button class="btn-action edit" title="Edit" onclick="editAdmin(this)">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action view" title="View Details" onclick="viewAdmin(this)">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-action delete" title="Delete" onclick="deleteAdmin(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
}

function addRowHoverEffects(row) {
    row.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    row.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
        this.style.boxShadow = '';
    });

    row.addEventListener('pointermove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const moveAmount = (x / rect.width) * 10 - 5;
        this.style.transform = `translateX(${5 + moveAmount}px) rotateY(${moveAmount * 0.5}deg)`;
    });
}

function editAdmin(btn) {
    const row = btn.closest('tr');
    const id = parseInt(row.getAttribute('data-id'));
    const admin = adminsData.find(a => a.id === id);
    
    if (!admin) return;
    
    isEditMode = true;
    editingRowId = id;
    
    document.getElementById('formTitle').textContent = 'Edit Administrator';
    document.getElementById('name').value = admin.name;
    document.getElementById('email').value = admin.email;
    document.getElementById('role').value = admin.role;
    document.getElementById('department').value = admin.department;
    document.getElementById('status').value = admin.status;
    document.getElementById('phone').value = admin.phone || '';
    
    document.querySelectorAll('.permissions-grid input').forEach(cb => {
        cb.checked = admin.permissions.includes(cb.value);
    });
    
    openForm();
}

function viewAdmin(btn) {
    const row = btn.closest('tr');
    const id = parseInt(row.getAttribute('data-id'));
    const admin = adminsData.find(a => a.id === id);
    
    if (!admin) return;
    
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Name</label>
                <span>${admin.name}</span>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <span><a href="mailto:${admin.email}">${admin.email}</a></span>
            </div>
            <div class="detail-item">
                <label>Role</label>
                <span><span class="role-tag ${admin.role.toLowerCase().replace(/\s+/g, '-')}">${admin.role}</span></span>
            </div>
            <div class="detail-item">
                <label>Department</label>
                <span>${admin.department}</span>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <span>${admin.phone || 'Not provided'}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span><span class="status-badge ${admin.status.toLowerCase()}">${admin.status}</span></span>
            </div>
            <div class="detail-item full-width">
                <label>Permissions</label>
                <div class="permissions-display">
                    ${admin.permissions.map(p => `<span class="permission-badge">${p}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    const overlay = document.getElementById('viewModalOverlay');
    overlay.classList.add('active');
    overlay.style.display = 'flex';
}

function closeViewModal(event) {
    if (event && event.target !== document.getElementById('viewModalOverlay')) {
        return;
    }
    
    const overlay = document.getElementById('viewModalOverlay');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function deleteAdmin(btn) {
    const row = btn.closest('tr');
    const id = parseInt(row.getAttribute('data-id'));
    
    if (confirm('Are you sure you want to delete this administrator?\n\nThis action cannot be undone.')) {
        adminsData = adminsData.filter(a => a.id !== id);
        row.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            row.remove();
            updateStatistics();
            updateRecordCount();
            showNotification('Administrator deleted successfully', 'success');
        }, 300);
    }
}

function filterTable() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const rows = document.querySelectorAll('.admin-row');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const name = row.querySelector('.name').textContent.toLowerCase();
        const email = row.querySelector('[href*="mailto"]').textContent.toLowerCase();
        const role = row.querySelector('.role-tag').textContent.trim();
        const status = row.querySelector('.status-badge').textContent.trim();
        
        const matchesSearch = name.includes(searchText) || email.includes(searchText);
        const matchesRole = !roleFilter || role === roleFilter;
        const matchesStatus = !statusFilter || status === statusFilter;
        
        if (matchesSearch && matchesRole && matchesStatus) {
            row.style.display = '';
            visibleCount++;
            row.style.animation = 'fadeIn 0.3s ease';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateRecordCount(visibleCount);
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    
    if (checkboxes.length > 0) {
        bulkActions.style.display = 'flex';
        bulkActions.style.animation = 'slideUp 0.3s ease';
    } else {
        bulkActions.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            bulkActions.style.display = 'none';
        }, 300);
    }
}

// Add event listener for bulk actions visibility
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('row-checkbox')) {
        updateBulkActionsVisibility();
    }
});

function bulkDelete() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    const count = checkboxes.length;
    
    if (count === 0) {
        showNotification('Please select at least one administrator', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${count} selected administrator(s)?\n\nThis action cannot be undone.`)) {
        checkboxes.forEach(cb => {
            const row = cb.closest('tr');
            const id = parseInt(row.getAttribute('data-id'));
            adminsData = adminsData.filter(a => a.id !== id);
            row.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => row.remove(), 300);
        });
        
        updateStatistics();
        updateRecordCount();
        document.getElementById('selectAll').checked = false;
        document.getElementById('bulkActions').style.display = 'none';
        showNotification(`${count} administrator(s) deleted successfully`, 'success');
    }
}

function bulkStatusChange(newStatus) {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('Please select at least one administrator', 'warning');
        return;
    }
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const id = parseInt(row.getAttribute('data-id'));
        const admin = adminsData.find(a => a.id === id);
        
        if (admin) {
            admin.status = newStatus;
            const statusBadge = row.querySelector('.status-badge');
            statusBadge.textContent = newStatus;
            statusBadge.className = `status-badge ${newStatus.toLowerCase()}`;
        }
    });
    
    updateStatistics();
    document.getElementById('selectAll').checked = false;
    document.getElementById('bulkActions').style.display = 'none';
    showNotification(`Status changed to ${newStatus} for selected records`, 'success');
}

function updateStatistics() {
    const total = adminsData.length;
    const active = adminsData.filter(a => a.status === 'Active').length;
    const inactive = total - active;
    
    const superAdminCount = adminsData.filter(a => a.role === 'Super Admin').length;
    const systemAdminCount = adminsData.filter(a => a.role === 'System Admin').length;
    const operationsAdminCount = adminsData.filter(a => a.role === 'Operations Admin').length;
    const analystCount = adminsData.filter(a => a.role === 'Analyst').length;
    
    document.getElementById('totalAdmins').textContent = total;
    document.getElementById('activeAdmins').textContent = active;
    document.getElementById('inactiveAdmins').textContent = inactive;
    
    document.getElementById('superAdminCount').textContent = superAdminCount;
    document.getElementById('systemAdminCount').textContent = systemAdminCount;
    document.getElementById('operationsAdminCount').textContent = operationsAdminCount;
    document.getElementById('analystCount').textContent = analystCount;
}

function updateRecordCount(visibleCount = null) {
    const rows = document.querySelectorAll('.admin-row:not([style*="display: none"])');
    const count = visibleCount !== null ? visibleCount : rows.length;
    document.getElementById('recordCount').textContent = `Showing ${count} record${count !== 1 ? 's' : ''}`;
}

function generateAvatarColor(name) {
    const colors = [
        '/FF6B6B', '/4ECDC4', '/45B7D1', '/FFA07A', '/98D8C8',
        '/F7DC6F', '#FF85A2', '/7FB3D5', '/A29BFE', '/FD79A8'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    notification.style.animation = 'slideInTop 0.3s ease';
    
    setTimeout(() => {
        notification.style.animation = 'slideOutTop 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}