import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LayoutDashboard, ShoppingCart, Users, MessageSquare, Package, Settings, LogOut, BarChart } from "lucide-react"

export function AdminSidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      href: "/orders",
    },
    {
      title: "Inventory",
      icon: Package,
      href: "/inventory",
    },
    {
      title: "Sales",
      icon: BarChart,
      href: "/sales",
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      href: "/chat",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center font-bold">S</div>
          <span className="text-lg font-bold">SalesAdmin</span>
        </div>
        <div className="ml-auto md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.href} className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button className="flex items-center text-red-500 w-full">
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
