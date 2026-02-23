import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { DEV_CONFIG } from '../../config/dev-config';

interface EnhancedInventoryItem {
  id: string;
  name: string;
  genericName: string;
  categoryHierarchy: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
    level7: string;
    level8: string;
  };
  brand: string;
  manufacturer: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  expirationDate: Date;
  manufacturingDate: Date;
  batchNumber: string;
  serialNumber: string;
  sku: string;
  barcode: string;
  cost: number;
  supplier: string;
  supplierContact: string;
  storageLocation: string;
  storageConditions: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  description: string;
  notes: string;
  isActive: boolean;
  stockStatus: 'normal' | 'low' | 'critical' | 'overstock';
  expirationStatus: 'good' | 'warning' | 'expiring' | 'expired';
  daysUntilExpiration: number;
  batches: Array<{
    batchNumber: string;
    quantity: number;
    deliveryDate: Date;
    expirationDate: Date;
    manufacturingDate: Date;
    cost: number;
    supplier: string;
    serialNumber: string;
    isActive: boolean;
  }>;
  totalQuantity: number;
  lastUpdated: Date;
  createdAt: Date;
}

const EnhancedInventory = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State management
  const [items, setItems] = useState<EnhancedInventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnhancedInventoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    categoryLevel3: '',
    categoryLevel4: '',
    categoryLevel5: '',
    categoryLevel6: '',
    categoryLevel7: '',
    brand: '',
    manufacturer: '',
    quantity: '',
    unit: 'pcs',
    deliveryDate: '',
    expirationDate: '',
    manufacturingDate: '',
    batchNumber: '',
    serialNumber: '',
    sku: '',
    barcode: '',
    cost: '',
    supplier: '',
    supplierContact: '',
    storageLocation: '',
    storageConditions: '',
    minStockLevel: '10',
    maxStockLevel: '100',
    reorderPoint: '20',
    description: '',
    notes: ''
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      let url = `${DEV_CONFIG.API_URL}/api/enhanced-inventory/items`;
      
      // Add filters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data);
      } else {
        console.error('Failed to fetch inventory items:', result.message);
        // Set empty array to prevent white screen
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      // Set empty array to prevent white screen
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and brands
  const fetchCategoriesAndBrands = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data.categories || []);
        setBrands(result.data.brands || []);
      } else {
        console.error('Failed to fetch categories:', result.message);
        setCategories([]);
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching categories and brands:', error);
      setCategories([]);
      setBrands([]);
    }
  };

  // Fetch expiring items
  const fetchExpiringItems = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/expiring?daysAhead=90`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Expiring items fetched:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch expiring items:', result.message);
      }
    } catch (error) {
      console.error('Error fetching expiring items:', error);
    }
  };

  // Create inventory item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          genericName: '',
          category: '',
          subcategory: '',
          subsubcategory: '',
          categoryLevel3: '',
          categoryLevel4: '',
          categoryLevel5: '',
          categoryLevel6: '',
          categoryLevel7: '',
          brand: '',
          manufacturer: '',
          quantity: '',
          unit: 'pcs',
          deliveryDate: '',
          expirationDate: '',
          manufacturingDate: '',
          batchNumber: '',
          serialNumber: '',
          sku: '',
          barcode: '',
          cost: '',
          supplier: '',
          supplierContact: '',
          storageLocation: '',
          storageConditions: '',
          minStockLevel: '10',
          maxStockLevel: '100',
          reorderPoint: '20',
          description: '',
          notes: ''
        });
        fetchInventoryItems();
        alert('Enhanced inventory item created successfully!');
      } else {
        alert(result.message || 'Failed to create inventory item');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item');
    }
  };

  // Edit inventory item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
        resetForm();
        fetchInventoryItems();
        alert('Enhanced inventory item updated successfully!');
      } else {
        alert(result.message || 'Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    }
  };

  // Delete inventory item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items/${selectedItem.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedItem(null);
        fetchInventoryItems();
        alert('Enhanced inventory item deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete inventory item');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item');
    }
  };

  // Open edit modal with item data
  const openEditModal = (item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      genericName: item.genericName || '',
      category: item.categoryHierarchy?.level1 || '',
      subcategory: item.categoryHierarchy?.level2 || '',
      subsubcategory: item.categoryHierarchy?.level3 || '',
      categoryLevel3: item.categoryHierarchy?.level3 || '',
      categoryLevel4: item.categoryHierarchy?.level4 || '',
      categoryLevel5: item.categoryHierarchy?.level5 || '',
      categoryLevel6: item.categoryHierarchy?.level6 || '',
      categoryLevel7: item.categoryHierarchy?.level7 || '',
      brand: item.brand || '',
      manufacturer: item.manufacturer || '',
      quantity: item.totalQuantity?.toString() || '',
      unit: item.unit || 'pcs',
      deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().split('T')[0] : '',
      expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate).toISOString().split('T')[0] : '',
      batchNumber: item.batchNumber || '',
      serialNumber: item.serialNumber || '',
      sku: item.sku || '',
      barcode: item.barcode || '',
      cost: item.cost?.toString() || '',
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      storageLocation: item.storageLocation || '',
      storageConditions: item.storageConditions || '',
      minStockLevel: item.minStockLevel?.toString() || '10',
      maxStockLevel: item.maxStockLevel?.toString() || '100',
      reorderPoint: item.reorderPoint?.toString() || '20',
      description: item.description || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      subcategory: '',
      subsubcategory: '',
      categoryLevel3: '',
      categoryLevel4: '',
      categoryLevel5: '',
      categoryLevel6: '',
      categoryLevel7: '',
      brand: '',
      manufacturer: '',
      quantity: '',
      unit: 'pcs',
      deliveryDate: '',
      expirationDate: '',
      manufacturingDate: '',
      batchNumber: '',
      serialNumber: '',
      sku: '',
      barcode: '',
      cost: '',
      supplier: '',
      supplierContact: '',
      storageLocation: '',
      storageConditions: '',
      minStockLevel: '10',
      maxStockLevel: '100',
      reorderPoint: '20',
      description: '',
      notes: ''
    });
  };

  // Get stock status color
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'overstock': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Get expiration status color
  const getExpirationStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'N/A';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  useEffect(() => {
    if (user) {
      fetchInventoryItems();
      fetchCategoriesAndBrands();
      fetchExpiringItems();
    }
  }, [user, selectedCategory, selectedBrand, searchTerm]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <AdminTopBar onMenuClick={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Inventory Management</h1>
              <p className="text-gray-600">Comprehensive inventory tracking with 7-level categorization, brand management, and expiry date monitoring</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, SKU, or barcode..."
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="expiringOnly"
                    checked={showExpiringOnly}
                    onChange={(e) => setShowExpiringOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="expiringOnly" className="text-sm text-gray-700">
                    Show expiring items only
                  </label>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Add New Item
                </button>
              </div>
            </div>

            {/* Inventory Items */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="ml-4 text-gray-600">Loading inventory items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l8 4m0-10l-8-4-8 4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-500">Get started by adding your first enhanced inventory item.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.genericName && (
                                <div className="text-xs text-gray-500 italic">{item.genericName}</div>
                              )}
                              <div className="text-xs text-gray-500">SKU: {item.sku || 'N/A'}</div>
                              <div className="text-xs text-gray-500">Batch: {item.batchNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.categoryHierarchy.level1}
                              {item.categoryHierarchy.level2 && (
                                <div className="text-xs text-gray-500">→ {item.categoryHierarchy.level2}</div>
                              )}
                              {item.categoryHierarchy.level3 && (
                                <div className="text-xs text-gray-500">→ {item.categoryHierarchy.level3}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.brand || 'N/A'}</div>
                            {item.manufacturer && (
                              <div className="text-xs text-gray-500">{item.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
                                {item.stockStatus}
                              </span>
                              <span className="ml-2 text-sm text-gray-900">
                                {item.totalQuantity} {item.unit}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpirationStatusColor(item.expirationStatus)}`}>
                                {item.expirationStatus}
                              </span>
                              <span className="ml-2 text-sm text-gray-900">
                                {formatDate(item.expirationDate)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({item.daysUntilExpiration} days)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="bg-blue-text-clinic-green hover:text-clinic-green-hover mr-3"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => openDeleteModal(item)}
                              className="bg-red-500 text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Enhanced Inventory Item</h2>
            
            <form onSubmit={handleCreateItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="ml">Milliliters</option>
                      <option value="mg">Milligrams</option>
                      <option value="g">Grams</option>
                      <option value="kg">Kilograms</option>
                      <option value="l">Liters</option>
                      <option value="box">Boxes</option>
                      <option value="bottles">Bottles</option>
                      <option value="tablets">Tablets</option>
                      <option value="capsules">Capsules</option>
                    </select>
                  </div>
                </div>

                {/* Category Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Category Hierarchy</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 1 Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Medicine"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 2 Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Pain Relief"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 3 Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subsubcategory}
                      onChange={(e) => setFormData({...formData, subsubcategory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Analgesics"
                    />
                  </div>
                </div>

                {/* Brand & Manufacturer */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Brand Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Biogesic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., United Laboratories"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Date Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tracking Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="For unique items"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Stock Keeping Unit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="For scanning"
                    />
                  </div>
                </div>

                {/* Supplier & Cost */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Supplier & Cost</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Contact
                    </label>
                    <input
                      type="text"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost per Unit *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Storage Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Storage Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Cabinet A-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Conditions
                    </label>
                    <input
                      type="text"
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({...formData, storageConditions: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Room temperature, Refrigerated"
                    />
                  </div>
                </div>

                {/* Stock Levels */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Stock Levels</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) => setFormData({...formData, maxStockLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData({...formData, reorderPoint: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Product description, usage instructions, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Additional notes or special handling instructions"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Enhanced Inventory Item</h2>
            
            <form onSubmit={handleEditItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="ml">Milliliters</option>
                      <option value="mg">Milligrams</option>
                      <option value="g">Grams</option>
                      <option value="kg">Kilograms</option>
                      <option value="l">Liters</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                      <option value="vial">Vial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>

                {/* Category Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Contact
                    </label>
                    <input
                      type="text"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Inventory Item</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedItem.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This will permanently remove the item from the inventory.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnhancedInventory;
