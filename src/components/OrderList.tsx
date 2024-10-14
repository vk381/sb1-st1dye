import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Eye, PlusCircle, MessageCircle, Edit, Trash } from 'lucide-react';

// ... (keep existing imports and mock data)

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleEditOrder = (order) => {
    setEditedOrder({ ...order });
    setIsEditingOrder(true);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${editedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedOrder),
      });
      if (response.ok) {
        setIsEditingOrder(false);
        fetchOrders();
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // ... (keep existing functions like handleViewDetails, updateItemStatus, etc.)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ... (keep existing nav and header) */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            {user?.role === 'SuperAdmin' && (
              <button
                onClick={() => navigate('/new-order')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New Order
              </button>
            )}
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {order.customer_name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {order.phone_number}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center mr-4"
                        >
                          <Eye className="h-5 w-5 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-yellow-600 hover:text-yellow-900 flex items-center mr-4"
                        >
                          <Edit className="h-5 w-5 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => sendWhatsAppMessage(order.phone_number, `Order #${order.id} Status: ${order.status}`)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <MessageCircle className="h-5 w-5 mr-1" />
                          Send WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={closeDetails}>
          {/* ... (keep existing order details modal content) */}
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditingOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Order</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveOrder(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={editedOrder.customer_name}
                  onChange={(e) => setEditedOrder({ ...editedOrder, customer_name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={editedOrder.phone_number}
                  onChange={(e) => setEditedOrder({ ...editedOrder, phone_number: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={editedOrder.status}
                  onChange={(e) => setEditedOrder({ ...editedOrder, status: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOrder(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;