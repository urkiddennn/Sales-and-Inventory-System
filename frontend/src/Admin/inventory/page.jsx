"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react"
import { AddProductModal } from "@/components/modals/add-product-modal"
import { EditProductModal } from "@/components/modals/edit-product-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InventoryPage() {
  const [products, setProducts] = useState([
    {
      id: "PRD-001",
      name: "Laptop Pro",
      category: "Electronics",
      price: "$1,299.99",
      stock: 24,
      status: "in-stock",
    },
    {
      id: "PRD-002",
      name: "Wireless Headphones",
      category: "Electronics",
      price: "$149.99",
      stock: 36,
      status: "in-stock",
    },
    { id: "PRD-003", name: "Office Chair", category: "Furniture", price: "$249.99", stock: 12, status: "in-stock" },
    { id: "PRD-004", name: "Coffee Maker", category: "Appliances", price: "$89.99", stock: 8, status: "low-stock" },
    {
      id: "PRD-005",
      name: "Smartphone X",
      category: "Electronics",
      price: "$899.99",
      stock: 0,
      status: "out-of-stock",
    },
    { id: "PRD-006", name: "Desk Lamp", category: "Furniture", price: "$39.99", stock: 45, status: "in-stock" },
    {
      id: "PRD-007",
      name: "Bluetooth Speaker",
      category: "Electronics",
      price: "$79.99",
      stock: 5,
      status: "low-stock",
    },
    {
      id: "PRD-008",
      name: "Ergonomic Keyboard",
      category: "Electronics",
      price: "$129.99",
      stock: 18,
      status: "in-stock",
    },
  ])

  const categories = ["Electronics", "Furniture", "Appliances", "Office Supplies", "Accessories"]

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = (product) => {
    const newId = `PRD-${String(products.length + 1).padStart(3, "0")}`
    setProducts([...products, { ...product, id: newId }])
    setIsAddModalOpen(false)
  }

  const handleEditProduct = (updatedProduct) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
    setIsEditModalOpen(false)
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  const getStockBadge = (status) => {
    const statusStyles = {
      "in-stock": "bg-green-100 text-green-800 border-green-200",
      "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "out-of-stock": "bg-red-100 text-red-800 border-red-200",
    }

    const statusText = {
      "in-stock": "In Stock",
      "low-stock": "Low Stock",
      "out-of-stock": "Out of Stock",
    }

    return <Badge className={`${statusStyles[status]} border`}>{statusText[status]}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{getStockBadge(product.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentProduct(product)
                          setIsEditModalOpen(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
        categories={categories}
      />

      {currentProduct && (
        <EditProductModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={currentProduct}
          onSave={handleEditProduct}
          categories={categories}
        />
      )}
    </div>
  )
}
