import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as productController from '../controllers/productController';
import * as saleController from '../controllers/saleController';
import * as chatController from '../controllers/chatController';
import * as commentController from '../controllers/commentController';
import * as orderController from '../controllers/orderController';
import * as cartController from '../controllers/cartController';
import * as detailsController from "../controllers/detailsController"
const app = new Hono();

// Public routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

// Protected routes
app.use('/products/*', authMiddleware);
app.use('/sales/*', authMiddleware);
app.use('/chats/*', authMiddleware);
app.use('/comments/*', authMiddleware);
app.use('/orders/*', authMiddleware);
app.use('/cart/*', authMiddleware);

// Product routes
app.post('/products', adminMiddleware, productController.createProduct);
app.get('/products', productController.getProducts);
app.get('/products/sale', productController.getSaleProducts);
app.patch('/products/:id/sale', adminMiddleware, productController.updateSaleStatus);
app.put('/products/:id', adminMiddleware, productController.updateProduct);
app.delete('/products/:id', adminMiddleware, productController.deleteProduct);

// Sale routes
app.post('/sales', saleController.createSale);
app.get('/sales', adminMiddleware, saleController.getSales);

// Chat routes
app.get('/chats', chatController.getChats);
app.post('/chats', chatController.sendMessage);

// Comment routes
app.post('/comments', commentController.addComment);
app.get('/comments/:productId', commentController.getProductComments);

// Order routes
app.post('/orders', orderController.createOrder);
app.get('/orders', orderController.getOrders);
app.patch('/orders/:id/status', adminMiddleware, orderController.updateOrderStatus);

// Cart routes
app.get('/cart', cartController.getCart);
app.post('/cart', cartController.addToCart);
app.delete('/cart', cartController.removeFromCart);

// Details route
app.post('/details', detailsController.createDetails)

export default app;
