import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    { id: "ORD-001", customer: "John Doe", date: "2023-04-12", total: "$120.50", status: "completed" },
    { id: "ORD-002", customer: "Jane Smith", date: "2023-04-11", total: "$75.20", status: "processing" },
    { id: "ORD-003", customer: "Robert Johnson", date: "2023-04-10", total: "$246.00", status: "completed" },
    { id: "ORD-004", customer: "Emily Davis", date: "2023-04-09", total: "$89.99", status: "pending" },
    { id: "ORD-005", customer: "Michael Brown", date: "2023-04-08", total: "$156.75", status: "completed" },
    { id: "ORD-006", customer: "Sarah Wilson", date: "2023-04-07", total: "$210.30", status: "processing" },
    { id: "ORD-007", customer: "David Taylor", date: "2023-04-06", total: "$45.00", status: "cancelled" },
    { id: "ORD-008", customer: "Lisa Anderson", date: "2023-04-05", total: "$189.50", status: "completed" },
    { id: "ORD-009", customer: "James Martin", date: "2023-04-04", total: "$67.25", status: "pending" },
    { id: "ORD-010", customer: "Jennifer White", date: "2023-04-03", total: "$124.99", status: "completed" },
  ]

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    }

    return <Badge className={`${statusStyles[status]} border`}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button>New Order</Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search orders..." className="pl-8" />
        </div>

        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing 10 of 100 orders</div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
