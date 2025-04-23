import { Product } from '../model/Product.js';
import cloudinary from '../config/cloudinary.js';

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, isOnSale, salePrice, ratings } = req.body;

        console.log('Received request body:', req.body);

        // Validate required fields
        if (!name || !price || !stock) {
            return res.status(400).json({ error: 'Name, price, and stock are required' });
        }

        // Parse numeric fields
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);
        if (isNaN(priceNum) || isNaN(stockNum)) {
            return res.status(400).json({ error: 'Price and stock must be valid numbers' });
        }

        // Handle file upload
        let imageUrl;
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
            imageUrl = uploadResult.secure_url;
        } else if (req.body.image && typeof req.body.image === 'string') {
            imageUrl = req.body.image; // Use existing URL if provided
        }

        // Create product
        const product = new Product({
            name,
            description: description || undefined,
            price: priceNum,
            stock: stockNum,
            category: category || undefined,
            imageUrl,
            isOnSale: isOnSale === 'true' || isOnSale === true,
            salePrice: isOnSale === 'true' && salePrice ? parseFloat(salePrice) : undefined,
            ratings: ratings ? parseFloat(ratings) : undefined,
        });

        await product.save();
        return res.status(201).json(product);
    } catch (error) {
        console.error('Error in createProduct:', error);
        return res.status(400).json({ error: error.message || 'Failed to create product' });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.json(products);
    } catch (error) {
        console.error('Error in getProducts:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json(product);
    } catch (error) {
        console.error('Error in getProductById:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const updateSaleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isOnSale, salePrice } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.isOnSale = Boolean(isOnSale);
        product.salePrice = product.isOnSale && salePrice ? Number(salePrice) : undefined;

        await product.save();
        return res.json(product);
    } catch (error) {
        console.error('Error in updateSaleStatus:', error);
        return res.status(400).json({ error: error.message });
    }
};

export const getSaleProducts = async (req, res) => {
    try {
        const products = await Product.find({ isOnSale: true });
        return res.json(products);
    } catch (error) {
        console.error('Error in getSaleProducts:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category, isOnSale, salePrice, ratings } = req.body;

        console.log('Received update product body:', req.body);

        // Validate required fields
        if (!name || !price || !stock) {
            return res.status(400).json({ error: 'Name, price, and stock are required' });
        }

        // Parse numeric fields
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);
        if (isNaN(priceNum) || isNaN(stockNum)) {
            return res.status(400).json({ error: 'Price and stock must be valid numbers' });
        }

        // Handle file upload
        let imageUrl;
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
            imageUrl = uploadResult.secure_url;
        } else if (req.body.image && typeof req.body.image === 'string') {
            imageUrl = req.body.image; // Use existing URL if provided
        }

        const updates = {
            name,
            description: description || undefined,
            price: priceNum,
            stock: stockNum,
            category: category || undefined,
            imageUrl,
            isOnSale: isOnSale === 'true' || isOnSale === true,
            salePrice: (isOnSale === 'true' || isOnSale === true) && salePrice ? parseFloat(salePrice) : undefined,
            ratings: ratings ? parseFloat(ratings) : undefined,
        };

        console.log('Applying updates:', updates);

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(400).json({ error: error.message || 'Failed to update product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        return res.status(500).json({ error: error.message });
    }
};
