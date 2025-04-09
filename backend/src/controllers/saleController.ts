import { Context } from 'hono';
import { Sale } from '../model/Sale';
import { Product } from '../model/Product';

export const createSale = async (c: Context) => {
  const { products } = await c.req.json();
  const userId = c.get('jwtPayload').id;

  let total = 0;
  const saleProducts = await Promise.all(products.map(async (item: any) => {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error('Invalid product or insufficient stock');
    }
    product.stock -= item.quantity;
    await product.save();

    // Use sale price if product is on sale, otherwise use regular price
    const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const price = unitPrice * item.quantity;
    total += price;

    return {
      product: product._id,
      quantity: item.quantity,
      price: unitPrice
    };
  }));

  const sale = new Sale({
    products: saleProducts,
    total,
    user: userId
  });

  await sale.save();
  return c.json(sale);
};

export const getSales = async (c: Context) => {
  const sales = await Sale.find().populate('products.product').populate('user');
  return c.json(sales);
};
