"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Settings,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    alamat: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    emailDonasi: true,
    emailLaporan: true,
    emailKegiatan: false,
    pushDonasi: true,
    pushLaporan: false,
    pushKegiatan: true,
  });

  const [system, setSystem] = useState({
    namaYayasan: "Yayasan Pipanisasi Bahagia",
    alamatYayasan: "",
    teleponYayasan: "",
    emailYayasan: "",
    website: "",
    deskripsi: "",
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const handleSavePassword = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const sections = [
    { id: "profile", label: "Profil", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "system", label: "Sistem", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun dan sistem</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profil Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Masukkan email"
                />
                <Input
                  label="Telepon"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Masukkan nomor telepon"
                />
                <Textarea
                  label="Alamat"
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  placeholder="Masukkan alamat"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "password" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Ubah Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    label="Password Saat Ini"
                    type={showPassword ? "text" : "password"}
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  label="Password Baru"
                  type={showPassword ? "text" : "password"}
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  placeholder="Masukkan password baru"
                />
                <Input
                  label="Konfirmasi Password Baru"
                  type={showPassword ? "text" : "password"}
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  placeholder="Konfirmasi password baru"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSavePassword} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Ubah Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Pengaturan Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Email Notifikasi</h4>
                  <div className="space-y-3">
                    {[
                      { key: "emailDonasi", label: "Donasi baru masuk" },
                      { key: "emailLaporan", label: "Laporan dipublikasikan" },
                      { key: "emailKegiatan", label: "Kegiatan baru dibuat" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(notifications as any)[item.key]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Push Notifikasi</h4>
                  <div className="space-y-3">
                    {[
                      { key: "pushDonasi", label: "Donasi baru masuk" },
                      { key: "pushLaporan", label: "Laporan dipublikasikan" },
                      { key: "pushKegiatan", label: "Kegiatan baru dibuat" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(notifications as any)[item.key]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "system" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Pengaturan Sistem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nama Yayasan"
                  value={system.namaYayasan}
                  onChange={(e) => setSystem({ ...system, namaYayasan: e.target.value })}
                  placeholder="Masukkan nama yayasan"
                />
                <Textarea
                  label="Alamat Yayasan"
                  value={system.alamatYayasan}
                  onChange={(e) => setSystem({ ...system, alamatYayasan: e.target.value })}
                  placeholder="Masukkan alamat yayasan"
                  rows={2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telepon Yayasan"
                    value={system.teleponYayasan}
                    onChange={(e) => setSystem({ ...system, teleponYayasan: e.target.value })}
                    placeholder="Nomor telepon"
                  />
                  <Input
                    label="Email Yayasan"
                    type="email"
                    value={system.emailYayasan}
                    onChange={(e) => setSystem({ ...system, emailYayasan: e.target.value })}
                    placeholder="Email yayasan"
                  />
                </div>
                <Input
                  label="Website"
                  value={system.website}
                  onChange={(e) => setSystem({ ...system, website: e.target.value })}
                  placeholder="https://example.com"
                />
                <Textarea
                  label="Deskripsi"
                  value={system.deskripsi}
                  onChange={(e) => setSystem({ ...system, deskripsi: e.target.value })}
                  placeholder="Deskripsi yayasan"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveSystem} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
