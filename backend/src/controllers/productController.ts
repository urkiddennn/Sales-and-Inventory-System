import { Context } from 'hono';
import { Product } from "../model/Product"; // Fixed typo 'model' to 'models'
import cloudinary from '../config/cloudinary';

export const createProduct = async (c: Context) => {
  // Parse the multipart form data
  const body = await c.req.parseBody();
  const { name, description, price, stock, category, isOnSale, salePrice } = body;

  // Handle file upload
  let imageUrl: string | undefined;
  const file = body['image']; // Access file from parsed body
  if (file && file instanceof File) { // Check if it's a File object
    const uploadResult = await cloudinary.uploader.upload(await file.text()); // Convert file to text or stream
    imageUrl = uploadResult.secure_url;
  }

  // Convert string values to appropriate types
  const product = new Product({
    name: name as string,
    description: description as string,
    price: Number(price),
    stock: Number(stock),
    category: category as string,
    imageUrl,
    isOnSale: isOnSale === 'true' || Boolean(isOnSale), // Handle string-to-boolean conversion
    salePrice: isOnSale === 'true' && salePrice ? Number(salePrice) : undefined
  });

  await product.save();
  return c.json(product);
};

export const getProducts = async (c: Context) => {
  const products = await Product.find();
  return c.json(products);
};

export const updateSaleStatus = async (c: Context) => {
  const { id } = c.req.param();
  const { isOnSale, salePrice } = await c.req.json();

  const product = await Product.findById(id);
  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  product.isOnSale = Boolean(isOnSale); // Ensure boolean type
  if (product.isOnSale && salePrice) {
    product.salePrice = Number(salePrice);
  } else if (!product.isOnSale) {
    product.salePrice = undefined;
  }

  await product.save();
  return c.json(product);
};

export const getSaleProducts = async (c: Context) => {
  const products = await Product.find({ isOnSale: true });
  return c.json(products);
};

export const updateProduct = async (c: Context) => {
  const { id } = c.req.param();
  const updates = await c.req.json();

  const product = await Product.findByIdAndUpdate(id, updates, { new: true });
  if (!product) return c.json({ error: 'Product not found' }, 404);

  return c.json(product);
};

export const deleteProduct = async (c: Context) => {
  const { id } = c.req.param();
  const product = await Product.findByIdAndDelete(id);
  if (!product) return c.json({ error: 'Product not found' }, 404);

  return c.json({ message: 'Product deleted' });
};
