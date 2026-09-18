"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  BarChart3,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mobileNavItems: MobileNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kegiatan", href: "/kegiatan", icon: FolderKanban },
  { label: "Keuangan", href: "/donasi", icon: Wallet },
  { label: "Laporan", href: "/laporan", icon: BarChart3 },
  { label: "Menu", href: "/menu", icon: Menu },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive && "text-teal-600"
                )}
              />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
