import { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Edit2, Trash2, Save, X, Settings, LogOut, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { User } from '@shared/schema';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: number;
  tableNumber: number;
  customerName: string;
  items: CartItem[];
  total: number;
  status: string;
  timestamp: string;
  date: string;
}

interface NewItem {
  name: string;
  price: string;
  category: string;
  description: string;
  image?: File | null;
}

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | null, isAuthenticated: boolean, isLoading: boolean };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Expired", 
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch menu items from API with polling for real-time updates
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['/api/menu'],
    queryFn: async () => {
      const response = await fetch('/api/menu', {
        credentials: 'include', // Include session cookies
      });
      return response.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds for menu updates
    refetchIntervalInBackground: true,
  });

  const menuItems = menuData?.menuItems || [];

  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    price: '',
    category: 'Main Course',
    description: '',
    image: null
  });

  // Fetch orders from API with polling for real-time updates
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        credentials: 'include', // Include session cookies
      });
      return response.json();
    },
    refetchInterval: 2000, // Poll every 2 seconds for new orders
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });

  const orders = ordersData?.orders || [];

  // Calculate daily revenue from fetched orders
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const todaysOrders = orders.filter((order: any) => order.date === today);
    const revenue = todaysOrders.reduce((total: number, order: any) => total + parseFloat(order.total), 0);
    setDailyRevenue(revenue);
  }, [orders]);

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Menu item mutations
  const addMenuItemMutation = useMutation({
    mutationFn: async (newMenuItem: NewItem) => {
      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('price', newMenuItem.price);
      formData.append('category', newMenuItem.category);
      formData.append('description', newMenuItem.description);
      if (newMenuItem.image) {
        formData.append('image', newMenuItem.image);
      }

      const response = await fetch('/api/menu', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      setShowAddForm(false);
      setNewItem({ name: '', price: '', category: 'Main Course', description: '', image: null });
      toast({
        title: "Menu item added",
        description: "The new menu item has been added successfully.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        return;
      }
      toast({
        title: "Add failed",
        description: error.message || "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, updatedItem }: { id: number; updatedItem: any }) => {
      const formData = new FormData();
      formData.append('name', updatedItem.name);
      formData.append('price', updatedItem.price);
      formData.append('category', updatedItem.category);
      formData.append('description', updatedItem.description);
      if (updatedItem.image && updatedItem.image instanceof File) {
        formData.append('image', updatedItem.image);
      }

      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update menu item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      setEditingItem(null);
      toast({
        title: "Menu item updated",
        description: "The menu item has been updated successfully.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        return;
      }
      toast({
        title: "Update failed",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("DELETE", `/api/menu/${itemId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      // Call the logout API with credentials to clear server session
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    }
    
    // Always clear local storage and redirect
    localStorage.removeItem('user');
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // Show success message and redirect
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    
    setTimeout(() => {
      window.location.href = '/auth';
    }, 500);
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    statusUpdateMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'preparing': return 'text-blue-600 bg-blue-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const addMenuItem = () => {
    // Validate all fields are filled including image
    if (!newItem.name.trim() || !newItem.price.trim() || !newItem.category.trim() || !newItem.description.trim() || !newItem.image) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and upload an image before submitting.",
        variant: "destructive",
      });
      return;
    }
    addMenuItemMutation.mutate(newItem);
  };

  const updateMenuItem = (id: number, updatedItem: any) => {
    updateMenuItemMutation.mutate({ id, updatedItem });
  };

  const deleteMenuItem = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMenuItemMutation.mutate(itemId);
    }
  };

  const EditItemForm = ({ item, onSave, onCancel }: { 
    item: MenuItem; 
    onSave: (data: any) => void; 
    onCancel: () => void; 
  }) => {
    const [editData, setEditData] = useState({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description,
      image: null as File | null
    });

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-4 items-center">
          {item.imageUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Update Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditData({...editData, image: e.target.files?.[0] || null})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {editData.image && (
              <p className="text-sm text-green-600">New image: {editData.image.name}</p>
            )}
          </div>
        </div>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({...editData, name: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Item Name"
        />
        <input
          type="number"
          step="0.01"
          value={editData.price}
          onChange={(e) => setEditData({...editData, price: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Price"
        />
        <input
          type="text"
          value={editData.category}
          onChange={(e) => setEditData({...editData, category: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Category"
        />
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({...editData, description: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
          placeholder="Description"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Validate all fields are filled
              if (!editData.name.trim() || !editData.price.trim() || !editData.category.trim() || !editData.description.trim()) {
                toast({
                  title: "Validation Error",
                  description: "Please fill all fields before saving.",
                  variant: "destructive",
                });
                return;
              }
              onSave(editData);
            }}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const todaysOrders = orders.filter((order: any) => order.date === new Date().toLocaleDateString());

  // Menu Management View
  if (currentView === 'menu-management') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add New Menu Item</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    rows={3}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewItem({...newItem, image: e.target.files?.[0] || null})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {newItem.image && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        ✓ Selected: {newItem.image.name}
                      </div>
                    )}
                    {!newItem.image && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        ⚠ Image is required for menu items
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addMenuItem}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Menu Items ({menuItems.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {menuItems.map((item: any) => (
                <div key={item.id} className="p-6">
                  {editingItem === item.id ? (
                    <EditItemForm 
                      item={item}
                      onSave={(updatedItem) => updateMenuItem(item.id, updatedItem)}
                      onCancel={() => setEditingItem(null)}
                    />
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          {item.imageUrl && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            <p className="text-xl font-bold text-green-600">${item.price}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm border border-blue-200 hover:border-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm border border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Restaurant Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Daily Revenue</p>
                <p className="text-2xl font-bold text-green-600">${dailyRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Orders</p>
                <p className="text-2xl font-bold text-blue-600">{todaysOrders.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Menu Items</p>
                <p className="text-2xl font-bold text-purple-600">{menuItems.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentView('menu-management')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Menu
              </button>
              <button
                onClick={() => window.open('/order', '_blank')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                View Customer Page
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">QR Code for Customers</h2>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <div className="w-32 h-32 bg-black mx-auto mb-4 flex items-center justify-center text-white text-xs">
                  QR CODE
                  <br />
                  /order
                </div>
                <p className="text-sm text-gray-600">Customers scan this QR code to access the ordering page</p>
              </div>
              <p className="text-sm text-gray-500">Customer URL: {window.location.origin}/order</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No orders yet. Orders will appear here when customers place them.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">Order #{order.id.toString().slice(-4)}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Table {order.tableNumber} - {order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.timestamp} - ${parseFloat(order.total).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          disabled={order.status !== 'pending'}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          disabled={order.status !== 'preparing'}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Ready
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          disabled={order.status !== 'ready'}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-700 text-sm mb-1">Items:</h4>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          try {
                            const items = JSON.parse(order.items);
                            return items.map((item: any, index: number) => (
                              <span key={index}>
                                {item.quantity}x {item.name}
                                {index < items.length - 1 ? ', ' : ''}
                              </span>
                            ));
                          } catch (e) {
                            return <span>Error parsing items</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;