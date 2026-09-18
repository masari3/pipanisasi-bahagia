"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplets,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Calculator,
  HandCoins,
  Receipt,
  Calendar,
  Camera,
  Image,
  BarChart3,
  Archive,
  Users,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kegiatan", href: "/kegiatan", icon: FolderKanban },
  { label: "Proposal", href: "/proposal", icon: FileText },
  { label: "RAB", href: "/rab", icon: Calculator },
  { label: "Donasi", href: "/donasi", icon: HandCoins },
  { label: "Pengeluaran", href: "/pengeluaran", icon: Receipt },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Dokumentasi", href: "/dokumentasi", icon: Camera },
  { label: "Galeri", href: "/galeri", icon: Image },
  { label: "Laporan", href: "/laporan", icon: BarChart3 },
  { label: "Arsip", href: "/arsip", icon: Archive },
  { label: "Donatur", href: "/donatur", icon: Users, roles: ["admin", "keuangan"] },
  { label: "User Management", href: "/user-management", icon: UserCog, roles: ["admin"] },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings, roles: ["admin"] },
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return (user as any)?.role && item.roles.includes((user as any).role);
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]",
        "hidden md:flex"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 shrink-0">
        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">
            PIPANISASI BAHAGIA
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-2 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {(user as any)?.role || "user"}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
