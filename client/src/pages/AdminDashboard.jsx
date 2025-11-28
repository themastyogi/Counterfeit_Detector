import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Package, Settings, Image, Plus, Trash2, Edit, BarChart2, AlertTriangle, Database, LayoutGrid, CheckCircle
} from 'lucide-react';
import { TenantModal, ProductModal, UserModal } from '../components/AdminModals';

const AdminDashboard = () => {
  const { token, isAdmin, isTenantAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'tenant' | 'product' | 'user'
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalScans: 0,
    scanTrend: '+0%',
    totalCounterfeits: 0,
    counterfeitTrend: '+0%',
    activeUsers: 0,
    activeUserTrend: '+0%',
    systemStatus: 'Loading...'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchTenants();
      fetchPlans();
      fetchUsers();
      fetchAdminStats();
    } else if (isTenantAdmin) {
      fetchProducts();
    }
  }, [isAdmin, isTenantAdmin, token]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/tenants/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  // Fetch users (admin only)
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleSaveTenant = async (e) => {
    e.preventDefault();
    const url = editMode ? `/api/tenants/${editingId}` : '/api/tenants';
    const method = editMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchTenants();
        setShowModal(false);
        setFormData({});
        setEditMode(false);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to save tenant', err);
    }
  };

  // Save user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    const url = editMode ? `/api/users/${editingId}` : '/api/users';
    const method = editMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchUsers();
        setShowModal(false);
        setFormData({});
        setEditMode(false);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const url = editMode ? `/api/products/${editingId}` : '/api/products';
    const method = editMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchProducts();
        setShowModal(false);
        setFormData({});
        setEditMode(false);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleEditTenant = (tenant) => {
    setFormData(tenant);
    setEditMode(true);
    setEditingId(tenant._id);
    setModalType('tenant');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setFormData(user);
    setEditMode(true);
    setEditingId(user._id);
    setModalType('user');
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setFormData(product);
    setEditMode(true);
    setEditingId(product._id);
    setModalType('product');
    setShowModal(true);
  };

  const handleDeleteTenant = async (id) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchTenants();
    } catch (err) {
      console.error('Failed to delete tenant', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const openCreateModal = (type) => {
    setFormData({});
    setEditMode(false);
    setEditingId(null);
    setModalType(type);
    setShowModal(true);
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Scans"
        value={adminStats.totalScans.toLocaleString()}
        icon={<BarChart2 size={24} />}
        trend={adminStats.scanTrend}
        color="text-blue-500"
        bg="bg-blue-50"
      />
      <StatCard
        title="Counterfeits"
        value={adminStats.totalCounterfeits.toLocaleString()}
        icon={<AlertTriangle size={24} />}
        trend={adminStats.counterfeitTrend}
        color="text-red-500"
        bg="bg-red-50"
      />
      <StatCard
        title="Active Users"
        value={adminStats.activeUsers.toLocaleString()}
        icon={<Users size={24} />}
        trend={adminStats.activeUserTrend}
        color="text-emerald-500"
        bg="bg-emerald-50"
      />
      <StatCard
        title="System Status"
        value={adminStats.systemStatus}
        icon={<Database size={24} />}
        color="text-purple-500"
        bg="bg-purple-50"
      />
    </div>
  );

  const renderTenantManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">Tenants</h3>
        <button onClick={() => openCreateModal('tenant')} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Tenant
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Domain</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.map(tenant => (
                <tr key={tenant._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{tenant.name}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{tenant.domain}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tenant.plan || 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {tenant.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleEditTenant(tenant)} className="text-text-muted hover:text-primary mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteTenant(tenant._id)} className="text-text-muted hover:text-danger"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render User Management
  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">Users</h3>
        <button onClick={() => openCreateModal('user')} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add User
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{user.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleEditUser(user)} className="text-text-muted hover:text-primary mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteUser(user._id)} className="text-text-muted hover:text-danger"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">Subscription Plans</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="card hover:shadow-lg transition-shadow border-t-4 border-primary">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-primary">{plan.name}</h4>
              <p className="text-2xl font-bold text-text-main mt-2">
                ${plan.price_per_month}<span className="text-sm text-text-muted font-normal">/month</span>
              </p>
              <p className="text-sm text-text-muted mt-1">{plan.description}</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle size={16} className="text-green-500" />
                {plan.local_quota_per_month === -1 ? 'Unlimited' : plan.local_quota_per_month} Local Scans
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle size={16} className="text-green-500" />
                {plan.high_quota_per_month === -1 ? 'Unlimited' : plan.high_quota_per_month} AI Scans
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">Products</h3>
        <button onClick={() => openCreateModal('product')} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-accent">
                <Package size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditProduct(product)} className="p-1 text-text-muted hover:text-primary"><Edit size={16} /></button>
                <button onClick={() => handleDeleteProduct(product._id)} className="p-1 text-text-muted hover:text-danger"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="text-lg font-bold text-primary mb-1">{product.product_name}</h4>
            <p className="text-sm text-text-muted mb-4 font-mono">{product.sku}</p>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-gray-100 text-gray-700">{product.category || 'General'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-4 sticky top-24">
            <div className="space-y-1">
              <SidebarItem icon={<LayoutGrid size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              {isAdmin && (
                <>
                  <SidebarItem icon={<Users size={20} />} label="Tenants" active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} />
                  <SidebarItem icon={<Settings size={20} />} label="Plans" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
                  <SidebarItem icon={<Users size={20} />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                  <SidebarItem icon={<Image size={20} />} label="References" onClick={() => window.location.href = '/references'} />
                </>
              )}
              {isTenantAdmin && (
                <SidebarItem icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                <SidebarItem icon={<Image size={20} />} label="References" onClick={() => window.location.href='/references'} />
              )}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="text-text-muted">Manage your organization and resources</p>
          </div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tenants' && renderTenantManagement()}
          {activeTab === 'products' && renderProductManagement()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'plans' && renderPlans()}
        </div>
      </div>
      {/* Modals */}
      <TenantModal show={showModal && modalType === 'tenant'} onClose={() => { setShowModal(false); setFormData({}); setEditMode(false); setEditingId(null); }} onSubmit={handleSaveTenant} formData={formData} setFormData={setFormData} mode={editMode ? 'edit' : 'create'} plans={plans} />
      <ProductModal show={showModal && modalType === 'product'} onClose={() => { setShowModal(false); setFormData({}); setEditMode(false); setEditingId(null); }} onSubmit={handleSaveProduct} formData={formData} setFormData={setFormData} mode={editMode ? 'edit' : 'create'} />
      <UserModal show={showModal && modalType === 'user'} onClose={() => { setShowModal(false); setFormData({}); setEditMode(false); setEditingId(null); }} onSubmit={handleSaveUser} formData={formData} setFormData={setFormData} mode={editMode ? 'edit' : 'create'} tenants={tenants} />
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color, bg }) => (
  <div className="card hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <h3 className="text-2xl font-bold text-primary mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className={`text-sm font-medium ${trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend} <span className="text-text-muted font-normal">from last month</span>
      </div>
    )}
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-gray-50 hover:text-primary'}`}>
    {icon}
    {label}
  </button>
);

export default AdminDashboard;
