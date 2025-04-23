import { Sale } from '../model/Sale.js';
import { Product } from '../model/Product.js';

export const createSale = async (req, res) => {
    try {
        const { products } = req.body;
        const userId = req.jwtPayload.id;

        let total = 0;
        const saleProducts = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product || product.stock < item.quantity) {
                throw new Error('Invalid product or insufficient stock');
            }
            product.stock -= item.quantity;
            await product.save();

            const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
            const price = unitPrice * item.quantity;
            total += price;

            return {
                product: product._id,
                quantity: item.quantity,
                price: unitPrice,
            };
        }));

        const sale = new Sale({
            products: saleProducts,
            total,
            user: userId,
        });

        await sale.save();
        res.json(sale);
    } catch (error) {
        console.error('Error in createSale:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('products.product').populate('user');
        res.json(sales);
    } catch (error) {
        console.error('Error in getSales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
