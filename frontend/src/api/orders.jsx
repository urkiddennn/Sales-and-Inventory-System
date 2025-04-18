// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// export const createOrder = async (token, orderData) => {
//     const response = await fetch(`${API_URL}/orders`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(orderData),
//     });
//     if (!response.ok) throw new Error('Failed to create order');
//     return response.json();
// };

// export const getOrders = async (token) => {
//     const response = await fetch(`${API_URL}/orders`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     if (!response.ok) throw new Error('Failed to fetch orders');
//     return response.json();
// };

// export const updateOrderStatus = async (token, id, status) => {
//     const response = await fetch(`${API_URL}/orders/${id}/status`, {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status }),
//     });
//     if (!response.ok) throw new Error('Failed to update order status');
//     return response.json();
// };
