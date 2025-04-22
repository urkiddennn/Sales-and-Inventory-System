// src/controllers/productController.ts
import { Context } from "hono";
import { Product, IProduct } from "../model/Product"; // Corrected path
import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Define interfaces for request bodies
interface CreateProductBody {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  isOnSale: string;
  salePrice: string;
  ratings: string;
  image: File | string;
  [key: string]: string | File; // Strict index signature for Hono
}

interface UpdateProductBody extends CreateProductBody {}

interface UpdateSaleStatusBody {
  isOnSale: boolean;
  salePrice?: number;
}

// Define type for Cloudinary upload result
type CloudinaryUploadResult = UploadApiResponse | UploadApiErrorResponse;

// Utility to check if Cloudinary response is successful
const isUploadSuccess = (result: CloudinaryUploadResult): result is UploadApiResponse => {
  return "secure_url" in result;
};

export const createProduct = async (c: Context) => {
  try {
    const body = await c.req.parseBody<CreateProductBody>();

    console.log("Received request body:", body);
    const { name, description, price, stock, category, isOnSale, salePrice, ratings } = body;

    // Validate required fields
    if (!name || !price || !stock) {
      return c.json({ error: "Name, price, and stock are required" }, 400);
    }

    // Parse numeric fields
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      return c.json({ error: "Price and stock must be valid numbers" }, 400);
    }

    // Handle file upload
    let imageUrl: string | undefined;
    const file = body.image;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      if (!isUploadSuccess(uploadResult)) {
        throw new Error("Cloudinary upload failed");
      }
      imageUrl = uploadResult.secure_url;
    } else if (typeof file === "string") {
      imageUrl = file; // Use existing URL if provided
    }

    // Create product
    const product = new Product({
      name,
      description: description || undefined,
      price: priceNum,
      stock: stockNum,
      category: category || undefined,
      imageUrl,
      isOnSale: isOnSale === "true",
      salePrice: isOnSale === "true" && salePrice ? parseFloat(salePrice) : undefined,
      ratings: ratings ? parseFloat(ratings) : undefined,
    });

    await product.save();
    return c.json(product, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getProducts = async (c: Context) => {
  try {
    const products = await Product.find();
    return c.json(products);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getProductById = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const product = await Product.findById(id);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    return c.json(product);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateSaleStatus = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { isOnSale, salePrice } = await c.req.json<UpdateSaleStatusBody>();

    const product = await Product.findById(id);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    product.isOnSale = Boolean(isOnSale);
    product.salePrice = product.isOnSale && salePrice ? Number(salePrice) : undefined;

    await product.save();
    return c.json(product);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getSaleProducts = async (c: Context) => {
  try {
    const products = await Product.find({ isOnSale: true });
    return c.json(products);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
export const updateProduct = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.parseBody<UpdateProductBody>();
        console.log("Received update product body:", body); // Add logging

        const { name, description, price, stock, category, isOnSale, salePrice, ratings } = body;

        // Validate required fields
        if (!name || !price || !stock) {
            return c.json({ error: "Name, price, and stock are required" }, 400);
        }

        // Parse numeric fields
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);
        if (isNaN(priceNum) || isNaN(stockNum)) {
            return c.json({ error: "Price and stock must be valid numbers" }, 400);
        }

        // Handle file upload
        let imageUrl: string | undefined;
        const file = body.image;
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error || !result) reject(error || new Error("Upload failed"));
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });

            if (!isUploadSuccess(uploadResult)) {
                throw new Error("Cloudinary upload failed");
            }
            imageUrl = uploadResult.secure_url;
        } else if (typeof file === "string") {
            imageUrl = file; // Use existing URL if provided
        }

        const updates: Partial<IProduct> = {
            name,
            description: description || undefined,
            price: priceNum,
            stock: stockNum,
            category: category || undefined,
            imageUrl,
            isOnSale: isOnSale === "true",
            salePrice: isOnSale === "true" && salePrice ? parseFloat(salePrice) : undefined,
            ratings: ratings ? parseFloat(ratings) : undefined,
        };

        console.log("Applying updates:", updates); // Add logging

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) {
            return c.json({ error: "Product not found" }, 404);
        }

        return c.json(product);
    } catch (error: any) {
        console.error("Error updating product:", error); // Add logging
        return c.json({ error: error.message || "Failed to update product" }, 400);
    }
};
export const deleteProduct = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    return c.json({ message: "Product deleted" });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
