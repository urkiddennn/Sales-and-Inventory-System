// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  isOnSale: boolean;
  salePrice?: number;
  ratings?: number;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: String,
  category: String,
  isOnSale: { type: Boolean, default: false },
  salePrice: Number,
  ratings: Number,
  createdAt: { type: Date, default: Date.now },
});

productSchema.pre("save", function (next) {
  if (!this.isOnSale) {
    this.salePrice = undefined;
  } else if (!this.salePrice || this.salePrice >= this.price) {
    this.salePrice = this.price * 0.9;
  }
  next();
});

export const Product = mongoose.model<IProduct>("Product", productSchema);
