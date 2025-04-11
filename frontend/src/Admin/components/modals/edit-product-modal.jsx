"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditProductModal({ open, onClose, product, onSave, categories }) {
  const [editedProduct, setEditedProduct] = useState({ ...product })

  // Update form when product changes
  useEffect(() => {
    setEditedProduct({ ...product })
  }, [product])

  const handleChange = (field, value) => {
    setEditedProduct({ ...editedProduct, [field]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Calculate status based on stock
    const stock = Number.parseInt(editedProduct.stock)
    let status = "in-stock"
    if (stock === 0) {
      status = "out-of-stock"
    } else if (stock <= 10) {
      status = "low-stock"
    }

    // Format price with $ and commas if needed
    let price = editedProduct.price
    if (typeof price === "string" && !price.startsWith("$")) {
      price = `$${Number.parseFloat(price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    onSave({ ...editedProduct, status, price })
  }

  // Remove $ from price for the input field
  const displayPrice = editedProduct.price ? editedProduct.price.replace(/[^0-9.]/g, "") : ""

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Make changes to the product details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id">Product ID</Label>
              <Input id="id" value={editedProduct.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={editedProduct.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={editedProduct.category}
                onValueChange={(value) => handleChange("category", value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={displayPrice}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={editedProduct.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
