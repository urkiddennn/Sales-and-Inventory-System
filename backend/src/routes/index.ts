import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { getRateLimitMiddleware } from "../middleware/rateLimit";
import * as authController from '../controllers/authController';
import * as productController from '../controllers/productController';
import * as saleController from '../controllers/saleController';
import * as chatController from '../controllers/chatController';
import * as commentController from '../controllers/commentController';
import * as orderController from '../controllers/orderController';
import * as cartController from '../controllers/cartController';
import * as detailsController from "../controllers/detailsController"
import * as userController from "../controllers/userController"

const app = new Hono();

app.use(
    '*',
    cors({
        origin: ["*"], // Using "*" here for now, but specific is better
        // ... other options
    })
);


const rateLimit = getRateLimitMiddleware({ limit: 5, windowMs: 60 * 1000 });
// Public routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

// Protected routes
app.use('/sales/*', authMiddleware);
app.use('/chats/*', authMiddleware);
app.use('/orders/*', authMiddleware);
app.use('/cart/*', authMiddleware);
app.use('/users/*', authMiddleware);

// Comment routes
app.get('/comments', commentController.getAllComments); // Public
app.post('/comments', authMiddleware, commentController.addComment);
app.get('/comments/:productId', authMiddleware, commentController.getProductComments);

// Public routes (accessible to everyone)
app.get("/products", productController.getProducts); // Fetch all products
app.get("/products/:id", productController.getProductById); // Fetch a single product by ID
app.get("/products/sale", productController.getSaleProducts); // Fetch sale products

// Protected routes (require authentication)
app.patch("/products/:id/sale", authMiddleware, productController.updateSaleStatus); // Update sale status

// Admin-only routes (require authentication + admin role)
app.post('/orders', orderController.createOrder);
app.get('/orders', orderController.getOrders);
app.patch('/orders/:id/status', orderController.updateOrderStatus);
app.post('/orders/:id/cancel', orderController.cancelOrder); // New cancel route
app.get('/orders/:id', authMiddleware, orderController.getOrderById);
app.delete('/orders/:id', authMiddleware, orderController.deleteOrder); // New route

// Sale routes
app.post('/sales', saleController.createSale);
app.get('/sales', adminMiddleware, saleController.getSales);

// Chat routes
app.get('/chats', chatController.getChats);
app.post('/chats', chatController.sendMessage);

// Order routes
app.post('/orders', orderController.createOrder);
app.get('/orders', orderController.getOrders);
app.patch('/orders/:id/status', orderController.updateOrderStatus);

// Cart routes
app.get('/cart', cartController.getCart);
app.post('/cart', cartController.addToCart);
app.delete('/cart', cartController.removeFromCart);
app.put('/cart', cartController.updateCart)

// Users routes
app.get('/users', userController.getUser); // Matches Profile component
app.put('/users/:id', userController.editUser);
app.delete('/users/:id', userController.deleteUser);
app.get("/users/admin", userController.getAdminUser);
app.get('/getAllUsers', userController.getAllUsers)
app.get('/users/:id', adminMiddleware, userController.getUserById)

// Details route
app.post('/details', detailsController.createDetails)

export default app;
