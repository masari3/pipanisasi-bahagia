import {
  Droplets,
  Target,
  Eye,
  MapPin,
  Phone,
  Mail,
  Users,
  Award,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Tentang Kami</h1>
          <p className="text-white/80 max-w-2xl">
            Mengenal lebih dekat Yayasan Pipanisasi Bahagia
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">Visi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Terwujudnya akses air bersih yang layak bagi seluruh masyarakat Indonesia,
              khususnya di daerah yang belum mendapatkan layanan air bersih yang memadai.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Misi</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Droplets className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Menyediakan akses air bersih melalui program pipanisasi</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Memberdayakan masyarakat dalam pengelolaan air bersih</span>
              </li>
              <li className="flex items-start gap-3">
                <Handshake className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Menjalin kerjasama dengan berbagai pihak untuk memperluas dampak</span>
              </li>
              <li className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Menjadi yayasan yang transparan dan akuntabel dalam pengelolaan dana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Droplets,
                title: "Air Bersih",
                desc: "Kami berkomitmen untuk menyediakan akses air bersih bagi semua",
              },
              {
                icon: Target,
                title: "Transparan",
                desc: "Setiap dana yang masuk dan keluar kami laporkan secara terbuka",
              },
              {
                icon: Users,
                title: "Gotong Royong",
                desc: "Bersama-sama kita bisa mewujudkan perubahan yang lebih besar",
              },
              {
                icon: Eye,
                title: "Akuntabel",
                desc: "Pengelolaan yayasan dilakukan dengan penuh tanggung jawab",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Tim Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Ahmad Fauzi",
                role: "Ketua Yayasan",
                desc: "Memimpin dengan penuh dedikasi untuk mewujudkan air bersih bagi semua",
              },
              {
                name: "Siti Rahmawati",
                role: "Sekretaris",
                desc: "Mengkoordinasikan seluruh kegiatan yayasan dengan cermat",
              },
              {
                name: "Budi Santoso",
                role: "Bendahara",
                desc: "Mengelola keuangan yayasan dengan transparan dan akuntabel",
              },
            ].map((person) => (
              <Card key={person.name}>
                <CardContent className="p-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{person.role}</p>
                  <p className="text-sm text-muted-foreground">{person.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Hubungi Kami</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">
                    Jl. Contoh No. 123, Jakarta Selatan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Telepon</p>
                  <p className="text-sm text-muted-foreground">+62 812 3456 7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    info@pipanisasibahagia.org
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
