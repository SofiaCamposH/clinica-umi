import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Menú Lateral Fijo */}
      <Sidebar />

      {/* Contenedor Principal donde cambiarán las pantallas */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/30">
        {children}
      </main>
    </div>
  );
}