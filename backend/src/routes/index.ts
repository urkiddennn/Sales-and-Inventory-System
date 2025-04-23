import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { getRateLimitMiddleware } from '../middleware/rateLimit';
import * as authController from '../controllers/authController';
import * as productController from '../controllers/productController';
import * as saleController from '../controllers/saleController';
import * as chatController from '../controllers/chatController';
import * as commentController from '../controllers/commentController';
import * as orderController from '../controllers/orderController';
import * as cartController from '../controllers/cartController';
import * as detailsController from '../controllers/detailsController';
import * as userController from '../controllers/userController';

const router = new Hono();

const rateLimit = getRateLimitMiddleware({ limit: 5, windowMs: 60 * 1000 });

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Protected routes
router.use('/sales/*', authMiddleware);
router.use('/chats/*', authMiddleware);
router.use('/orders/*', authMiddleware);
router.use('/cart/*', authMiddleware);
router.use('/users/*', authMiddleware);

// Comment routes
router.get('/comments', commentController.getAllComments);
router.post('/comments', authMiddleware, commentController.addComment);
router.get('/comments/:productId', authMiddleware, commentController.getProductComments);

// Public product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/sale', productController.getSaleProducts);
router.post('/products', productController.createProduct);
router.delete('/products/:id', productController.deleteProduct);
router.put('/products/:id', productController.updateProduct);

// Protected product routes
router.put('/products/:id/sale', authMiddleware, productController.updateSaleStatus);

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

// Details route
router.post('/details', detailsController.createDetails);

export default router;
