import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  X
} from 'lucide-react';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState({ username: 'Admin' });
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [itemHistory, setItemHistory] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        totalCategories: 0,
        totalRefills: 0,
        totalWithdrawals: 0,
    });
    const [loading, setLoading] = useState({ items: false, categories: false, history: false });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('0');
    const [lowStockItems, setLowStockItems] = useState([]);
    const [modals, setModals] = useState({
        addItem: false,
        withdrawItem: false,
        refillItem: false,
        deleteConfirm: false,
        lowStockModal: false,
        itemHistory: false,
    });
    const [formData, setFormData] = useState({
        newCategory: '',
        itemName: '',
        itemCategory: '',
        itemQuantity: 0,
        itemThreshold: 1,
        refillQuantity: 0,
        withdrawQuantity: 0,
    });
    const [activeItem, setActiveItem] = useState(null);

    const fetchData = async () => {
        try {
            setLoading({ items: true, categories: true, history: true });
            const [itemsRes, categoriesRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/items`),
                axios.get(`${API_BASE_URL}/categories`),
                axios.get(`${API_BASE_URL}/history`),
            ]);
            
            // Ensure we always have arrays
            const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : [];
            const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
            const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];
            
            setItems(itemsData);
            setCategories(categoriesData);
            setItemHistory(historyData);
            setStats({
                totalItems: itemsData.length,
                totalCategories: categoriesData.length,
                totalRefills: historyData.filter(h => h.action === 'Refill').length,
                totalWithdrawals: historyData.filter(h => h.action === 'Withdraw').length,
            });
            setLoading({ items: false, categories: false, history: false });
        } catch (err) {
            setError('Failed to fetch data.');
            setLoading({ items: false, categories: false, history: false });
            
            // Set empty arrays on error
            setItems([]);
            setCategories([]);
            setItemHistory([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterItems = () => {
        // Ensure items is always an array
        const itemsArray = Array.isArray(items) ? items : [];
        
        let filtered = [...itemsArray];
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (categoryFilter !== '0') {
            filtered = filtered.filter(
                item => item.category && item.category._id === categoryFilter
            );
        }
        setFilteredItems(filtered);
        // Check for low stock
        const lowStock = filtered.filter(item => 
            item.quantity !== undefined && item.threshold !== undefined && 
            item.quantity < item.threshold
        );
        setLowStockItems(lowStock);
    };

    useEffect(() => {
        filterItems();
    }, [items, searchTerm, categoryFilter]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleLogout = () => {
        // Implement logout logic
    };

    const openModal = (modalName, item = null) => {
        setActiveItem(item);
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return 'Unknown';
        const category = categories.find(c => c._id === categoryId);
        return category ? category.name : 'Unknown';
    };

    const handleAddCategory = () => {
        if (!formData.newCategory.trim()) return;
        const newCategory = {
            _id: Date.now().toString(),
            name: formData.newCategory.trim(),
            color: '#6b7280'
        };
        setCategories(prev => [...prev, newCategory]);
        setFormData({ ...formData, newCategory: '' });
    };

    const handleAddItem = () => {
        if (!formData.itemName || !formData.itemCategory || !formData.itemQuantity || !formData.itemThreshold) return;
        const newItem = {
            _id: Date.now().toString(),
            name: formData.itemName,
            category: categories.find(c => c._id === formData.itemCategory),
            quantity: Number(formData.itemQuantity),
            threshold: Number(formData.itemThreshold),
        };
        setItems(prev => [...prev, newItem]);
        closeModal('addItem');
    };

    const handleRefillItem = () => {
        if (!activeItem) return;
        const quantityToAdd = prompt('Enter quantity to refill:', '0');
        const qty = Number(quantityToAdd);
        if (isNaN(qty) || qty <= 0) return;
        const updatedItems = items.map(item => {
            if (item._id === activeItem._id) {
                const newQty = item.quantity + qty;
                // Add to history
                setItemHistory(prev => [
                    ...prev,
                    {
                        _id: Date.now().toString(),
                        itemId: item._id,
                        action: 'Refill',
                        quantity: qty,
                        purpose: 'Refilled stock',
                        createdAt: new Date().toISOString(),
                    },
                ]);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setItems(updatedItems);
        closeModal('refillItem');
    };

    const handleWithdrawItem = () => {
        if (!activeItem) return;
        const quantityToWithdraw = prompt('Enter quantity to withdraw:', '0');
        const qty = Number(quantityToWithdraw);
        if (isNaN(qty) || qty <= 0 || qty > activeItem.quantity) return;
        const updatedItems = items.map(item => {
            if (item._id === activeItem._id) {
                const newQty = item.quantity - qty;
                setItemHistory(prev => [
                    ...prev,
                    {
                        _id: Date.now().toString(),
                        itemId: item._id,
                        action: 'Withdraw',
                        quantity: qty,
                        purpose: 'Withdrawn stock',
                        createdAt: new Date().toISOString(),
                    },
                ]);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setItems(updatedItems);
        closeModal('withdrawItem');
    };

    const handleDeleteItem = () => {
        if (!activeItem) return;
        const updatedItems = items.filter(item => item._id !== activeItem._id);
        setItems(updatedItems);
        // Add to history
        setItemHistory(prev => [
            ...prev,
            {
                _id: Date.now().toString(),
                itemId: activeItem._id,
                action: 'Delete',
                quantity: 0,
                purpose: 'Item deleted',
                createdAt: new Date().toISOString(),
            },
        ]);
        closeModal('deleteConfirm');
    };

    const handleAddCategorySubmit = (e) => {
        e.preventDefault();
        handleAddCategory();
    };

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        handleAddItem();
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    // Render logic
    if (loading.items || loading.categories || loading.history) {
        return (
            <div className="app-container flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-t-transparent border-gray-900 dark:border-white rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">Loading your inventory data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container flex items-center justify-center min-h-screen">
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md text-center">
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">⚠️ Oops! Something went wrong</h3>
                    <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Main UI
    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
            {/* Mobile Header */}
            <header className="mobile-header shadow-sm px-4 py-3 flex items-center justify-between">
                <button
                    className="btn btn-ghost"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>
                <div className="page-title font-semibold text-center flex-1 mx-2">
                    {activePage === 'dashboard'
                        ? 'Dashboard Overview'
                        : activePage === 'categories'
                            ? 'Manage Categories'
                            : 'Activity Log'}
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-ghost btn-circle"
                        onClick={toggleDarkMode}
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Overlay for sidebar */}
            <div
                className={`overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
                {/* User profile */}
                <div className="user-profile mb-8 flex items-center gap-4 px-4 py-3">
                    <div className="avatar bg-gray-300 dark:bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-semibold text-white">
                        {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-name font-semibold">{currentUser.username}</div>
                        <div className="user-role text-sm text-gray-500">Administrator</div>
                    </div>
                </div>

                {/* Logo */}
                <div className="logo mb-8 px-4">
                    <h1 className="text-2xl font-bold">
                        Inv<span className="text-emerald-500">Track</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="main-nav mb-8 px-4">
                    <ul className="space-y-2">
                        <li>
                            <button
                                className={`nav-link flex items-center gap-2 px-4 py-2 rounded ${activePage === 'dashboard' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                    }`}
                                onClick={() => setActivePage('dashboard')}
                            >
                                <Box size={20} />
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-link flex items-center gap-2 px-4 py-2 rounded ${activePage === 'categories' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                    }`}
                                onClick={() => setActivePage('categories')}
                            >
                                <Tag size={20} />
                                <span>Categories</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-link flex items-center gap-2 px-4 py-2 rounded ${activePage === 'history' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                    }`}
                                onClick={() => setActivePage('history')}
                            >
                                <Clock size={20} />
                                <span>History</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Sidebar footer */}
                <div className="sidebar-footer mt-auto pt-6 border-t border-gray-300 dark:border-gray-700 px-4 py-3 flex justify-center">
                    <button
                        className="btn btn-ghost flex items-center gap-2 w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
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
                        <div className="page-header mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Inventory Dashboard
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                    Monitor stock levels, track activity, and manage your assets.
                                </p>
                            </div>
                            <div className="actions">
                                <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal('addItem')}>
                                    <Plus size={20} />
                                    <span>Add Item</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats cards */}
                        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Items */}
                            <div className="stat-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 flex items-center justify-start gap-4 transition hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="stat-icon text-emerald-500">
                                    <Box size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number text-3xl font-bold">{stats.totalItems}</div>
                                    <div className="stat-label text-gray-600 dark:text-gray-400">Total Items</div>
                                </div>
                            </div>
                            
                            {/* Total Categories */}
                            <div className="stat-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 flex items-center justify-start gap-4 transition hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="stat-icon text-blue-500">
                                    <Tag size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number text-3xl font-bold">{stats.totalCategories}</div>
                                    <div className="stat-label text-gray-600 dark:text-gray-400">Categories</div>
                                </div>
                            </div>
                            
                            {/* Total Refills */}
                            <div className="stat-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 flex items-center justify-start gap-4 transition hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="stat-icon text-green-500">
                                    <Plus size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number text-3xl font-bold">{stats.totalRefills}</div>
                                    <div className="stat-label text-gray-600 dark:text-gray-400">Refills</div>
                                </div>
                            </div>
                            
                            {/* Total Withdrawals */}
                            <div className="stat-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 flex items-center justify-start gap-4 transition hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="stat-icon text-red-500">
                                    <Box size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number text-3xl font-bold">{stats.totalWithdrawals}</div>
                                    <div className="stat-label text-gray-600 dark:text-gray-400">Withdrawals</div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filters mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Search box */}
                                <div className="relative flex-1 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search size={20} />
                                    </div>
                                </div>
                                {/* Filters dropdowns & buttons */}
                                <div className="flex items-center space-x-4">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="0">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {lowStockItems.length > 0 && (
                                        <button
                                            className="btn btn-outline-danger relative"
                                            onClick={() => openModal('lowStockModal')}
                                        >
                                            <Bell size={20} />
                                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                                {lowStockItems.length}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Items</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Showing {filteredItems.length} items</p>
                            </div>
                            <div className="overflow-x-auto">
                                {filteredItems.length === 0 ? (
                                    <div className="text-center py-16 px-6">
                                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                                            <Box size={48} />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                            No items found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {searchTerm || categoryFilter !== '0'
                                                ? "Try adjusting your search or filter criteria."
                                                : "Get started by adding your first inventory item."}
                                        </p>
                                        {!searchTerm && categoryFilter === '0' && (
                                            <button className="btn btn-primary" onClick={() => openModal('addItem')}>
                                                <Plus size={20} />
                                                Add Your First Item
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Threshold</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredItems.map((item) => {
                                                const isLow = item.quantity < item.threshold;
                                                return (
                                                    <tr
                                                        key={item._id}
                                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isLow ? 'bg-red-50 dark:bg-red-900/10' : ''
                                                            }`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                                            {item._id.toString().slice(-6)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium">{item.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                {getCategoryName(item.category ? item.category._id : '')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{item.quantity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.threshold}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isLow
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    }`}
                                                            >
                                                                {isLow ? 'Low Stock' : 'In Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    onClick={() => openModal('itemHistory', item)}
                                                                    title="View History"
                                                                >
                                                                    History
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                                                                    onClick={() => openModal('refillItem', item)}
                                                                    title="Refill Stock"
                                                                >
                                                                    Refill
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                                    onClick={() => openModal('withdrawItem', item)}
                                                                    title="Withdraw Item"
                                                                >
                                                                    Withdraw
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                    onClick={() => openModal('deleteConfirm', item)}
                                                                    title="Delete Item"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activePage === 'categories' && (
                    <div className="max-w-7xl mx-auto p-4">
                        {/* Header */}
                        <div className="page-header mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Category Management
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                    Organize your inventory by creating and managing categories.
                                </p>
                            </div>
                            <div className="actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setActivePage('dashboard')}
                                >
                                    <Box size={20} />
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                        </div>

                        {/* Add Category Form */}
                        <div className="add-category-form mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h3>
                            <form
                                className="flex flex-col sm:flex-row gap-4"
                                onSubmit={handleAddCategorySubmit}
                            >
                                <input
                                    type="text"
                                    placeholder="e.g., Consumables, Tools, Software"
                                    value={formData.newCategory}
                                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                                <button type="submit" className="btn btn-primary whitespace-nowrap">
                                    <Plus size={20} />
                                    <span>Add Category</span>
                                </button>
                            </form>
                        </div>

                        {/* Categories Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Existing Categories</h2>
                            </div>
                            <div className="overflow-x-auto p-4">
                                {categories.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 dark:text-gray-400">No categories have been created yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Color</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {categories.map((cat) => (
                                                <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {cat.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className="inline-block w-4 h-4 rounded-full border"
                                                            style={{
                                                                backgroundColor: cat.color || '#6b7280',
                                                                borderColor: cat.color || '#6b7280',
                                                            }}
                                                        ></span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button className="btn btn-sm btn-outline-warning">Edit</button>
                                                            <button className="btn btn-sm btn-outline-danger">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activePage === 'history' && (
                    <div className="max-w-7xl mx-auto p-4">
                        {/* Header */}
                        <div className="page-header mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Activity History
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                    Review a log of all inventory actions and changes.
                                </p>
                            </div>
                            <div className="actions">
                                <button className="btn btn-secondary" onClick={() => setActivePage('dashboard')}>
                                    <Box size={20} />
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filters mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Activity</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Date filters */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                {/* Action type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Action Type</label>
                                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                        <option value="">All Actions</option>
                                        <option value="Refill">Refill</option>
                                        <option value="Withdraw">Withdraw</option>
                                        <option value="Add">Add</option>
                                        <option value="Edit">Edit</option>
                                        <option value="Delete">Delete</option>
                                    </select>
                                </div>
                                {/* Buttons */}
                                <div className="flex flex-col justify-end">
                                    <button className="btn btn-primary mb-2">Apply Filters</button>
                                    <button className="btn btn-outline-secondary">Clear Filters</button>
                                </div>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                            </div>
                            <div className="overflow-x-auto p-4">
                                {itemHistory.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                                            <Clock size={48} />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Activity Logged</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Activity will appear here as you add, withdraw, or update items.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Date & Time</th>
                                                <th className="px-4 py-2 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Action</th>
                                                <th className="px-4 py-2 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Quantity</th>
                                                <th className="px-4 py-2 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Purpose</th>
                                                <th className="px-4 py-2 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {itemHistory
                                                .slice()
                                                .reverse()
                                                .map((entry) => (
                                                    <tr
                                                        key={entry._id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatDate(entry.createdAt)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.action === 'Refill'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : entry.action === 'Withdraw'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        : entry.action === 'Add'
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                    }`}
                                                            >
                                                                {entry.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {entry.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {entry.purpose || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.createdAt)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {modals.addItem && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold">Add New Inventory Item</h3>
                                <button className="modal-close" onClick={() => closeModal('addItem')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6">
                                <form className="space-y-4" onSubmit={handleAddItemSubmit}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Item Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Dell Monitor, A4 Paper"
                                            value={formData.itemName}
                                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.itemCategory}
                                            onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Select a Category --</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Initial Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.itemQuantity}
                                                onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Low Stock Threshold *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.itemThreshold}
                                                onChange={(e) => setFormData({ ...formData, itemThreshold: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => closeModal('addItem')}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddItem}
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refill Modal */}
            {modals.refillItem && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold">Refill Stock</h3>
                                <button className="modal-close" onClick={() => closeModal('refillItem')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6">
                                <p className="mb-4">Refilling item: <strong>{activeItem?.name}</strong></p>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter quantity"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    onChange={(e) => setFormData({ ...formData, refillQuantity: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button className="btn btn-secondary" onClick={() => closeModal('refillItem')}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleRefillItem}>
                                    Refill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {modals.withdrawItem && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold">Withdraw Stock</h3>
                                <button className="modal-close" onClick={() => closeModal('withdrawItem')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6">
                                <p className="mb-4">Withdrawing from: <strong>{activeItem?.name}</strong></p>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter quantity"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    onChange={(e) => setFormData({ ...formData, withdrawQuantity: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button className="btn btn-secondary" onClick={() => closeModal('withdrawItem')}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleWithdrawItem}>
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {modals.deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-red-600">Delete Item</h3>
                                <button className="modal-close" onClick={() => closeModal('deleteConfirm')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6">
                                <p>Are you sure you want to delete <strong>{activeItem?.name}</strong>?</p>
                            </div>
                            <div className="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button className="btn btn-secondary" onClick={() => closeModal('deleteConfirm')}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleDeleteItem}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Low Stock Modal */}
            {modals.lowStockModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold">Low Stock Items</h3>
                                <button className="modal-close" onClick={() => closeModal('lowStockModal')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6 max-h-96 overflow-y-auto">
                                {lowStockItems.length === 0 ? (
                                    <p>No low stock items.</p>
                                ) : (
                                    lowStockItems.map((item) => (
                                        <div key={item._id} className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                            <p className="mb-1 font-semibold">{item.name}</p>
                                            <p className="text-sm">Quantity: {item.quantity}</p>
                                            <p className="text-sm">Threshold: {item.threshold}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Item History Modal */}
            {modals.itemHistory && (
                <div className="modal-overlay">
                    <div className="modal-dialog max-w-3xl">
                        <div className="modal-content">
                            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold">Item History - {activeItem?.name}</h3>
                                <button className="modal-close" onClick={() => closeModal('itemHistory')}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body p-6 max-h-96 overflow-y-auto">
                                {itemHistory.length === 0 ? (
                                    <p>No history available for this item.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="p-2 px-4 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Date</th>
                                                <th className="p-2 px-4 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Action</th>
                                                <th className="p-2 px-4 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Quantity</th>
                                                <th className="p-2 px-4 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Purpose</th>
                                                <th className="p-2 px-4 text-left uppercase tracking-wider text-gray-500 dark:text-gray-300">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {itemHistory
                                                .slice()
                                                .reverse()
                                                .filter(entry => entry.itemId === activeItem?._id)
                                                .map((entry) => (
                                                    <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="p-2 px-4">{formatDate(entry.createdAt)}</td>
                                                        <td className="p-2 px-4">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.action === 'Refill'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : entry.action === 'Withdraw'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        : entry.action === 'Add'
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                    }`}
                                                            >
                                                                {entry.action}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 px-4">{entry.quantity}</td>
                                                        <td className="p-2 px-4">{entry.purpose || '—'}</td>
                                                        <td className="p-2 px-4">{formatDate(entry.createdAt)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;