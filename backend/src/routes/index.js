import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as productController from '../controllers/productController.js';
import * as saleController from '../controllers/saleController.js';
import * as chatController from '../controllers/chatController.js';
import * as commentController from '../controllers/commentController.js';
import * as orderController from '../controllers/orderController.js';
import * as cartController from '../controllers/cartController.js';

import * as userController from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Comment routes
router.get('/comments', commentController.getAllComments);
router.post('/comments', authMiddleware, commentController.addComment);
router.get('/comments/:productId', authMiddleware, commentController.getProductComments);

// Public product routes
router.get('/products', productController.getProducts); // Remove
router.get('/products/:id', productController.getProductById);
router.get('/products/sale', productController.getSaleProducts);
router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// Protected routes
router.use('/sales', authMiddleware);
router.use('/chats', authMiddleware);
router.use('/orders', authMiddleware);
router.use('/cart', authMiddleware);
router.use('/users', authMiddleware);

// Protected product routes
router.put('/products/:id/sale', authMiddleware, adminMiddleware, productController.updateSaleStatus);

// Order routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getOrders);
router.patch('/orders/:id/status', orderController.updateOrderStatus);
router.post('/orders/:id/cancel', orderController.cancelOrder);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.delete('/orders/:id', authMiddleware, orderController.deleteOrder);

// Sale routes
router.post('/sales', saleController.createSale);
router.get('/sales', adminMiddleware, saleController.getSales);

// Chat routes
router.get('/chats', chatController.getChats);
router.post('/chats', chatController.sendMessage);

// Cart routes
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.addToCart);
router.delete('/cart', cartController.removeFromCart);
router.put('/cart', cartController.updateCart);

// Users routes
router.get('/users', userController.getUser);
router.put('/users/:id', userController.editUser);
router.delete('/users/:id', userController.deleteUser);
router.get('/users/admin', userController.getAdminUser);
router.get('/getAllUsers', userController.getAllUsers);
router.get('/users/:id', adminMiddleware, userController.getUserById);

export default router;
