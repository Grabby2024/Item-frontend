// Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Menu,
    Sun,
    Moon,
    LogOut,
    Plus,
    Search,
    Bell,
    Box,
    Tag,
    Clock,
    X,
    AlertTriangle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    // ===== MOCK DATA =====
    const mockCategories = [
        { _id: 'cat1', name: 'Electronics', color: '#3b82f6' },
        { _id: 'cat2', name: 'Office Supplies', color: '#10b981' },
        { _id: 'cat3', name: 'Tools', color: '#f59e0b' },
        { _id: 'cat4', name: 'Consumables', color: '#ef4444' },
    ];

    const mockItems = [
        { _id: 'item1', name: 'Dell Monitor', category: mockCategories[0], quantity: 3, threshold: 5 },
        { _id: 'item2', name: 'A4 Paper (Ream)', category: mockCategories[1], quantity: 20, threshold: 10 },
        { _id: 'item3', name: 'Cordless Drill', category: mockCategories[2], quantity: 2, threshold: 3 },
        { _id: 'item4', name: 'Ink Cartridge', category: mockCategories[3], quantity: 8, threshold: 10 },
        { _id: 'item5', name: 'USB-C Cable', category: mockCategories[0], quantity: 15, threshold: 5 },
    ];

    const mockHistory = [
        { _id: 'h1', itemId: 'item1', action: 'Add', quantity: 5, purpose: 'Initial stock', createdAt: '2024-07-20T10:00:00Z' },
        { _id: 'h2', itemId: 'item2', action: 'Refill', quantity: 30, purpose: 'Bulk order', createdAt: '2024-07-22T14:30:00Z' },
        { _id: 'h3', itemId: 'item1', action: 'Withdraw', quantity: 2, purpose: 'IT Dept', createdAt: '2024-07-24T09:15:00Z' },
        { _id: 'h4', itemId: 'item3', action: 'Withdraw', quantity: 1, purpose: 'Maintenance', createdAt: '2024-07-25T11:00:00Z' },
    ];

    // ===== STATE =====
    const [currentUser] = useState({ username: 'Admin' });
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');

    const [categories] = useState(mockCategories);
    const [items, setItems] = useState(mockItems);
    const [itemHistory] = useState(mockHistory);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('0');

    const [modals, setModals] = useState({
        addItem: false,
        withdrawItem: false,
        refillItem: false,
        deleteConfirm: false,
        lowStockModal: false,
        itemHistory: false,
    });

    const [formData, setFormData] = useState({
        itemName: '',
        itemCategory: '',
        itemQuantity: 0,
        itemThreshold: 1,
        refillQuantity: 1,
        withdrawQuantity: 1,
    });

    const [activeItem, setActiveItem] = useState(null);

    // ===== DERIVED DATA =====
    const filteredItems = items.filter(item => {
        const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === '0' || item.category._id === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const lowStockItems = filteredItems.filter(item => item.quantity < item.threshold);

    const stats = {
        totalItems: items.length,
        totalCategories: categories.length,
        totalRefills: itemHistory.filter(h => h.action === 'Refill').length,
        totalWithdrawals: itemHistory.filter(h => h.action === 'Withdraw').length,
    };

    // ===== UTILS =====
    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c._id === categoryId);
        return cat ? cat.name : 'Uncategorized';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };

    const closeModal = (name) => {
        setModals(prev => ({ ...prev, [name]: false }));
        setActiveItem(null);
    };

    const openModal = (name, item = null) => {
        setActiveItem(item);
        if (name === 'refillItem' || name === 'withdrawItem') {
            setFormData(prev => ({
                ...prev,
                refillQuantity: 1,
                withdrawQuantity: 1,
            }));
        }
        setModals(prev => ({ ...prev, [name]: true }));
    };

    // ===== ACTIONS =====
    const handleAddItem = () => {
        if (!formData.itemName || !formData.itemCategory) return;
        const newItem = {
            _id: `item${Date.now()}`,
            name: formData.itemName,
            category: categories.find(c => c._id === formData.itemCategory),
            quantity: Number(formData.itemQuantity),
            threshold: Number(formData.itemThreshold),
        };
        setItems(prev => [...prev, newItem]);
        setFormData({
            itemName: '',
            itemCategory: '',
            itemQuantity: 0,
            itemThreshold: 1,
        });
        closeModal('addItem');
    };

    const handleRefillItem = () => {
        if (!activeItem) return;
        const qty = Number(formData.refillQuantity);
        if (isNaN(qty) || qty <= 0) return;
        setItems(prev =>
            prev.map(item =>
                item._id === activeItem._id
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            )
        );
        closeModal('refillItem');
    };

    const handleWithdrawItem = () => {
        if (!activeItem) return;
        const qty = Number(formData.withdrawQuantity);
        if (isNaN(qty) || qty <= 0 || qty > activeItem.quantity) return;
        setItems(prev =>
            prev.map(item =>
                item._id === activeItem._id
                    ? { ...item, quantity: item.quantity - qty }
                    : item
            )
        );
        closeModal('withdrawItem');
    };

    const handleDeleteItem = () => {
        if (!activeItem) return;
        setItems(prev => prev.filter(item => item._id !== activeItem._id));
        closeModal('deleteConfirm');
    };

    const handleLogout = () => {
        alert('Logout clicked (demo)');
    };

    // ===== EFFECTS =====
    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // ===== RENDER =====
    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
            {/* Mobile Header */}
            <header className="mobile-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
                    <Menu size={24} />
                </button>
                <div className="page-title">
                    {activePage === 'dashboard'
                        ? 'Dashboard'
                        : activePage === 'categories'
                            ? 'Categories'
                            : 'History'}
                </div>
                <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Overlay */}
            <div
                className={`overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
                <div className="user-profile">
                    <div className="avatar">
                        {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{currentUser.username}</div>
                        <div className="user-role">Administrator</div>
                    </div>
                </div>

                <div className="logo">
                    <h1>
                        Inv<span className="text-emerald">Track</span>
                    </h1>
                </div>

                <nav className="main-nav">
                    <button
                        className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => {
                            setActivePage('dashboard');
                            setSidebarOpen(false);
                        }}
                    >
                        <Box size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`nav-link ${activePage === 'categories' ? 'active' : ''}`}
                        onClick={() => {
                            setActivePage('categories');
                            setSidebarOpen(false);
                        }}
                    >
                        <Tag size={20} />
                        <span>Categories</span>
                    </button>
                    <button
                        className={`nav-link ${activePage === 'history' ? 'active' : ''}`}
                        onClick={() => {
                            setActivePage('history');
                            setSidebarOpen(false);
                        }}
                    >
                        <Clock size={20} />
                        <span>History</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
                {activePage === 'dashboard' && (
                    <div className="max-w-7xl mx-auto p-4">
                        {/* Header */}
                        <div className="page-header">
                            <div>
                                <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
                                <p className="text-lg mt-2">Monitor stock levels and manage your assets.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => openModal('addItem')}>
                                <Plus size={20} />
                                Add Item
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="stats-grid">
                            <StatCard icon={<Box size={32} />} value={stats.totalItems} label="Total Items" color="emerald" />
                            <StatCard icon={<Tag size={32} />} value={stats.totalCategories} label="Categories" color="blue" />
                            <StatCard icon={<Plus size={32} />} value={stats.totalRefills} label="Refills" color="green" />
                            <StatCard icon={<Box size={32} />} value={stats.totalWithdrawals} label="Withdrawals" color="red" />
                        </div>

                        {/* Filters */}
                        <div className="filters">
                            <div className="filter-row">
                                <div className="search-box">
                                    <Search size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="filter-actions">
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                        <option value="0">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {lowStockItems.length > 0 && (
                                        <button className="btn btn-outline-danger relative" onClick={() => openModal('lowStockModal')}>
                                            <Bell size={20} />
                                            <span className="notification-badge">{lowStockItems.length}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-card">
                            <div className="table-header">
                                <h2>Inventory Items</h2>
                                <span>Showing {filteredItems.length} items</span>
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="empty-state">
                                    <Box size={48} />
                                    <h3>No items found</h3>
                                    <p>{searchTerm || categoryFilter !== '0' ? "Try adjusting filters." : "Add your first item to get started."}</p>
                                    {!searchTerm && categoryFilter === '0' && (
                                        <button className="btn btn-primary" onClick={() => openModal('addItem')}>
                                            <Plus size={20} /> Add Item
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Item Name</th>
                                                <th>Category</th>
                                                <th>Qty</th>
                                                <th>Threshold</th>
                                                <th>Status</th>
                                                <th className="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map(item => {
                                                const isLow = item.quantity < item.threshold;
                                                return (
                                                    <tr key={item._id} className={isLow ? 'low-stock-row' : ''}>
                                                        <td>{item._id.slice(-6)}</td>
                                                        <td>{item.name}</td>
                                                        <td>
                                                            <span className="category-badge" style={{ backgroundColor: item.category.color + '20', color: item.category.color }}>
                                                                {item.category.name}
                                                            </span>
                                                        </td>
                                                        <td className="font-medium">{item.quantity}</td>
                                                        <td>{item.threshold}</td>
                                                        <td>
                                                            <span className={`status-badge ${isLow ? 'low' : 'good'}`}>
                                                                {isLow ? 'Low Stock' : 'In Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <button className="action-btn text-blue-600 dark:text-blue-400" onClick={() => openModal('itemHistory', item)}>
                                                                History
                                                            </button>
                                                            <button className="action-btn text-emerald-600 dark:text-emerald-400" onClick={() => openModal('refillItem', item)}>
                                                                Refill
                                                            </button>
                                                            <button className="action-btn text-green-600 dark:text-green-400" onClick={() => openModal('withdrawItem', item)}>
                                                                Withdraw
                                                            </button>
                                                            <button className="action-btn text-red-600 dark:text-red-400" onClick={() => openModal('deleteConfirm', item)}>
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activePage === 'categories' && (
                    <div className="max-w-7xl mx-auto p-4">
                        <div className="page-header">
                            <div>
                                <h1 className="text-3xl font-bold">Category Management</h1>
                                <p className="text-lg mt-2">Organize your inventory with custom categories.</p>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setActivePage('dashboard')}>
                                Back to Dashboard
                            </button>
                        </div>
                        <div className="add-category-form">
                            <h3>Add New Category</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">Categories are predefined in this demo.</p>
                            <div className="category-list">
                                {categories.map(cat => (
                                    <div key={cat._id} className="category-item">
                                        <span className="category-color" style={{ backgroundColor: cat.color }}></span>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activePage === 'history' && (
                    <div className="max-w-7xl mx-auto p-4">
                        <div className="page-header">
                            <div>
                                <h1 className="text-3xl font-bold">Activity History</h1>
                                <p className="text-lg mt-2">Review all inventory actions.</p>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setActivePage('dashboard')}>
                                Back to Dashboard
                            </button>
                        </div>
                        <div className="filters">
                            <h3>Filter Activity</h3>
                            <p className="text-gray-500 dark:text-gray-400">Filtering is disabled in this demo.</p>
                        </div>
                        <div className="table-card">
                            <div className="table-header">
                                <h2>Recent Activity</h2>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Action</th>
                                            <th>Quantity</th>
                                            <th>Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...itemHistory].reverse().map(entry => (
                                            <tr key={entry._id}>
                                                <td>{formatDate(entry.createdAt)}</td>
                                                <td>
                                                    <span className={`status-badge ${entry.action.toLowerCase()}`}>
                                                        {entry.action}
                                                    </span>
                                                </td>
                                                <td>{entry.quantity}</td>
                                                <td>{entry.purpose}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ===== MODALS ===== */}
            {/* Add Item */}
            {modals.addItem && (
                <Modal title="Add New Item" onClose={() => closeModal('addItem')}>
                    <div className="modal-form">
                        <Input label="Item Name *" value={formData.itemName} onChange={(v) => setFormData({ ...formData, itemName: v })} />
                        <Select
                            label="Category *"
                            value={formData.itemCategory}
                            onChange={(v) => setFormData({ ...formData, itemCategory: v })}
                            options={categories.map(c => ({ value: c._id, label: c.name }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Initial Quantity *"
                                type="number"
                                min="0"
                                value={formData.itemQuantity}
                                onChange={(v) => setFormData({ ...formData, itemQuantity: v })}
                            />
                            <Input
                                label="Low Stock Threshold *"
                                type="number"
                                min="1"
                                value={formData.itemThreshold}
                                onChange={(v) => setFormData({ ...formData, itemThreshold: v })}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => closeModal('addItem')}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddItem}>Add Item</button>
                    </div>
                </Modal>
            )}

            {/* Refill */}
            {modals.refillItem && (
                <Modal title="Refill Stock" onClose={() => closeModal('refillItem')}>
                    <p>Refilling: <strong>{activeItem?.name}</strong></p>
                    <Input
                        label="Quantity to Add"
                        type="number"
                        min="1"
                        value={formData.refillQuantity}
                        onChange={(v) => setFormData({ ...formData, refillQuantity: v })}
                    />
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => closeModal('refillItem')}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleRefillItem}>Refill</button>
                    </div>
                </Modal>
            )}

            {/* Withdraw */}
            {modals.withdrawItem && (
                <Modal title="Withdraw Stock" onClose={() => closeModal('withdrawItem')}>
                    <p>Withdrawing from: <strong>{activeItem?.name}</strong></p>
                    <Input
                        label="Quantity to Withdraw"
                        type="number"
                        min="1"
                        max={activeItem?.quantity}
                        value={formData.withdrawQuantity}
                        onChange={(v) => setFormData({ ...formData, withdrawQuantity: v })}
                    />
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => closeModal('withdrawItem')}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleWithdrawItem}>Withdraw</button>
                    </div>
                </Modal>
            )}

            {/* Delete */}
            {modals.deleteConfirm && (
                <Modal title="Confirm Deletion" onClose={() => closeModal('deleteConfirm')}>
                    <div className="text-center py-4">
                        <AlertTriangle className="mx-auto text-red-500" size={48} />
                        <p className="mt-4">
                            Are you sure you want to delete <strong>{activeItem?.name}</strong>?<br />
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => closeModal('deleteConfirm')}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleDeleteItem}>Delete</button>
                    </div>
                </Modal>
            )}

            {/* Low Stock */}
            {modals.lowStockModal && (
                <Modal title="Low Stock Alerts" onClose={() => closeModal('lowStockModal')}>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {lowStockItems.map(item => (
                            <div key={item._id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {item.quantity} in stock (threshold: {item.threshold})
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            {/* Item History */}
            {modals.itemHistory && (
                <Modal title={`Item History - ${activeItem?.name}`} onClose={() => closeModal('itemHistory')}>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="modal-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Action</th>
                                    <th>Qty</th>
                                    <th>Purpose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemHistory
                                    .filter(h => h.itemId === activeItem?._id)
                                    .reverse()
                                    .map(entry => (
                                        <tr key={entry._id}>
                                            <td>{formatDate(entry.createdAt)}</td>
                                            <td>
                                                <span className={`status-badge ${entry.action.toLowerCase()}`}>
                                                    {entry.action}
                                                </span>
                                            </td>
                                            <td>{entry.quantity}</td>
                                            <td>{entry.purpose}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {itemHistory.filter(h => h.itemId === activeItem?._id).length === 0 && (
                            <p className="text-center py-4 text-gray-500">No history available.</p>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ===== SUBCOMPONENTS =====
const StatCard = ({ icon, value, label, color }) => (
    <div className={`stat-card stat-${color}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <div className="stat-number">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);

const Modal = ({ title, children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    </div>
);

const Input = ({ label, value, onChange, type = 'text', min, max }) => (
    <div className="form-group">
        <label>{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            className="form-input"
        />
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div className="form-group">
        <label>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="form-input">
            <option value="">-- Select --</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default Dashboard;