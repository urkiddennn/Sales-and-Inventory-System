import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import "./globals.css"

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <SidebarProvider>
                    <div className="flex h-screen bg-gray-50">
                        <AdminSidebar />
                        <main className="flex-1 overflow-auto p-4">{children}</main>
                    </div>
                </SidebarProvider>
            </body>
        </html>
    )
}


import './globals.css'

export const metadata = {
    generator: 'v0.dev'
};
