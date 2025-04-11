import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function RecentOrders() {
  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", date: "2023-04-12", total: "$120.50", status: "completed" },
    { id: "ORD-002", customer: "Jane Smith", date: "2023-04-11", total: "$75.20", status: "processing" },
    { id: "ORD-003", customer: "Robert Johnson", date: "2023-04-10", total: "$246.00", status: "completed" },
    { id: "ORD-004", customer: "Emily Davis", date: "2023-04-09", total: "$89.99", status: "pending" },
    { id: "ORD-005", customer: "Michael Brown", date: "2023-04-08", total: "$156.75", status: "completed" },
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href="/orders">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
