"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar";
import Sidebar, { SidebarProvider } from "./sidebar";
import Navbar from "./navbar";
import MobileBottomNav from "./mobile-nav";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <Navbar />
        <main className="p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
