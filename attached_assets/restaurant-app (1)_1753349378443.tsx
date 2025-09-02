import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Clock, CheckCircle, AlertCircle, DollarSign, Users, TrendingUp, Edit2, Trash2, Save, X, Settings } from 'lucide-react';

const RestaurantApp = () => {
  const [currentView, setCurrentView] = useState('customer');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);

  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Margherita Pizza', price: 12.99, category: 'Pizza', description: 'Fresh tomato sauce, mozzarella, basil' },
    { id: 2, name: 'Chicken Caesar Salad', price: 9.99, category: 'Salads', description: 'Grilled chicken, romaine, parmesan, croutons' },
    { id: 3, name: 'Beef Burger', price: 14.99, category: 'Burgers', description: 'Angus beef patty, lettuce, tomato, onion' },
    { id: 4, name: 'Pasta Carbonara', price: 13.99, category: 'Pasta', description: 'Spaghetti with eggs, cheese, pancetta' },
    { id: 5, name: 'Fish & Chips', price: 16.99, category: 'Main Course', description: 'Beer battered cod with fries' },
    { id: 6, name: 'Chocolate Cake', price: 6.99, category: 'Desserts', description: 'Rich chocolate layer cake' },
    { id: 7, name: 'Coca Cola', price: 2.99, category: 'Beverages', description: 'Classic cola drink' },
    { id: 8, name: 'Coffee', price: 3.99, category: 'Beverages', description: 'Freshly brewed coffee' }
  ]);

  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredMenu = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (!tableNumber || !customerName || cart.length === 0) return;
    
    const newOrder = {
      id: Date.now(),
      tableNumber: parseInt(tableNumber),
      customerName: customerName,
      items: [...cart],
      total: getTotalPrice(),
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    
    setOrders([newOrder, ...orders]);
    setCustomerOrders([newOrder, ...customerOrders]);
    setDailyRevenue(prev => prev + getTotalPrice());
    setCart([]);
    setShowCart(false);
    alert('Order placed successfully! Your order will be prepared shortly.');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setCustomerOrders(customerOrders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'preparing': return 'text-blue-600 bg-blue-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const addMenuItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.description) return;
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      description: newItem.description
    };
    
    setMenuItems([...menuItems, item]);
    setNewItem({ name: '', price: '', category: '', description: '' });
    setShowAddForm(false);
  };

  const updateMenuItem = (id, updatedItem) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, ...updatedItem, price: parseFloat(updatedItem.price) } : item
    ));
    setEditingItem(null);
  };

  const deleteMenuItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMenuItems(currentItems => currentItems.filter(menuItem => menuItem.id !== itemId));
    }
  };

  const todaysOrders = orders.filter(order => order.date === new Date().toLocaleDateString());

  // Order Status View for Customer
  if (currentView === 'order-status') {
    const myOrders = customerOrders.filter(order => 
      order.tableNumber === parseInt(tableNumber) && order.customerName === customerName
    );

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <button
              onClick={() => setCurrentView('customer')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Table {tableNumber} - {customerName}</h2>
            <p className="text-gray-600">Track your order status in real-time</p>
          </div>

          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                No orders placed yet
              </div>
            ) : (
              myOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Order #{order.id.toString().slice(-4)}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">{order.timestamp} - ${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Pending</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                      <span>Delivered</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          order.status === 'pending' ? 'w-1/4 bg-orange-500' :
                          order.status === 'preparing' ? 'w-2/4 bg-blue-500' :
                          order.status === 'ready' ? 'w-3/4 bg-green-500' :
                          'w-full bg-green-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Menu Management View
  if (currentView === 'menu-management') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('admin')}
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
                    rows="3"
                  />
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
              {menuItems.map(item => (
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
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <p className="text-xl font-bold text-green-600">${item.price}</p>
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

  // Admin Dashboard View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('menu-management')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Menu
              </button>
              <button
                onClick={() => setCurrentView('customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Customer View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${dailyRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{todaysOrders.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${todaysOrders.length > 0 ? (dailyRevenue / todaysOrders.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Live Orders</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No orders yet today
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">Table {order.tableNumber}</h3>
                          <span className="text-sm text-gray-600">- {order.customerName}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600">{order.timestamp} - ${order.total.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">Order Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Restaurant Menu</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('admin')}
                className="text-sm bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Admin View
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showMenu && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome! Please enter your details</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              <input
                type="number"
                placeholder="Table Number"
                value={tableNumber}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-lg"
                onChange={(e) => setTableNumber(e.target.value)}
              />
              <input
                type="text"
                placeholder="Your Name"
                value={customerName}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-lg"
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <button
                onClick={() => {
                  if (tableNumber && customerName) {
                    setShowMenu(true);
                  }
                }}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!tableNumber || !customerName}
              >
                Continue to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-gray-700">Table {tableNumber} - {customerName}</p>
              {customerOrders.length > 0 && (
                <button
                  onClick={() => setCurrentView('order-status')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  View My Orders ({customerOrders.length})
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <p className="text-xl font-bold text-green-600">${item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold mb-4">
                      <span>Total:</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={placeOrder}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Item Form Component
const EditItemForm = ({ item, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    name: item.name,
    price: item.price.toString(),
    category: item.category,
    description: item.description
  });

  const handleSave = () => {
    if (!editData.name || !editData.price || !editData.category || !editData.description) return;
    onSave(editData);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editData.name}
        onChange={(e) => setEditData({...editData, name: e.target.value})}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          step="0.01"
          value={editData.price}
          onChange={(e) => setEditData({...editData, price: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          type="text"
          value={editData.category}
          onChange={(e) => setEditData({...editData, category: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <textarea
        value={editData.description}
        onChange={(e) => setEditData({...editData, description: e.target.value})}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
        rows="3"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default RestaurantApp;
                