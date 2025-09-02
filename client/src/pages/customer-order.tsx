import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  items: string; // JSON string of cart items
  total: string;
  status: string;
  timestamp: string;
  date: string;
}

const CustomerOrder = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [currentView, setCurrentView] = useState('customer');
  
  // Fetch customer orders from API
  const { data: ordersData } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      return response.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds
    enabled: currentView === 'order-status', // Only fetch when viewing track orders
  });

  const customerOrders = ordersData?.orders || [];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch menu items from API
  const { data: menuData } = useQuery({
    queryKey: ['/api/menu'],
    queryFn: async () => {
      const response = await fetch('/api/menu');
      return response.json();
    },
  });

  const menuItems = menuData?.menuItems || [];

  const categories: string[] = ['All', ...Array.from(new Set(menuItems.map((item: any) => String(item?.category || 'Other'))))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredMenu = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter((item: MenuItem) => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
      // Show toast for quantity increase
      toast({
        title: "Added to cart!",
        description: `${item.name} quantity updated (${existingItem.quantity + 1})`,
      });
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
      // Show toast for new item added
      toast({
        title: "Added to cart!",
        description: `${item.name} has been added to your cart`,
      });
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setCart([]);
      setShowCart(false);
      toast({
        title: "Order placed successfully!",
        description: "Your order will be prepared shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const placeOrder = () => {
    if (!tableNumber || !customerName || cart.length === 0) return;
    
    const orderData = {
      tableNumber: parseInt(tableNumber),
      customerName: customerName,
      items: JSON.stringify(cart),
      total: getTotalPrice().toFixed(2),
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    
    orderMutation.mutate(orderData);
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

  // Order Status View for Customer
  if (currentView === 'order-status') {
    const myOrders = customerOrders.filter((order: Order) => 
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
              myOrders.map((order: Order) => (
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
                      <p className="text-gray-600">{order.timestamp} - ${parseFloat(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {(() => {
                        try {
                          const items = JSON.parse(order.items);
                          return items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ));
                        } catch (e) {
                          return <span className="text-red-500 text-sm">Error loading items</span>;
                        }
                      })()}
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

  // Cart Modal
  if (showCart) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total: ${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={!tableNumber || !customerName}
                    className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Customer Ordering Interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Delicious Restaurant</h1>
              <p className="text-gray-600">Order from your table</p>
            </div>
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cart.length})
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </button>
              )}
              <button
                onClick={() => setCurrentView('order-status')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Track Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {!showMenu ? (
          // Table Information Form
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-center mb-6">Welcome!</h2>
              <p className="text-gray-600 text-center mb-6">Please provide your details to start ordering</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your table number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                
                <button
                  onClick={() => setShowMenu(true)}
                  disabled={!tableNumber || !customerName}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  View Menu
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Menu Display
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item: MenuItem) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600">${item.price}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrder;