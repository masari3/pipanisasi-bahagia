"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplets,
  Menu,
  X,
  Globe,
  MessageCircle,
  Share2,
  Play,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/laporan", label: "Laporan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/donasi", label: "Donasi" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-primary hidden sm:block">
                Pipanisasi Bahagia
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/donasi" className="hidden sm:block">
                <Button size="sm" className="gradient-accent text-white">
                  Donasi Sekarang
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/donasi"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full gradient-accent text-white mt-2">
                  Donasi Sekarang
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0a3d40] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pipanisasi Bahagia</h3>
                  <p className="text-xs text-white/60">Yayasan Pipanisasi Bahagia</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Mengalirkan air bersih untuk masyarakat yang membutuhkan.
                Setiap donasi Anda adalah berkah bagi sesama.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tautan</h4>
              <ul className="space-y-2 text-sm text-white/70">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/kontak" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Jl. Contoh No. 123, Jakarta</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+62 812 3456 7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>info@pipanisasibahagia.org</span>
                </li>
              </ul>
              <div className="flex items-center gap-3 mt-4">
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Share2 className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Play className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-xs text-white/50">
              &copy; {new Date().getFullYear()} Yayasan Pipanisasi Bahagia. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
