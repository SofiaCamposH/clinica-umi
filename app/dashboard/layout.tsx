import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificación de seguridad de Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario activo, lo regresamos al login
  if (!user) {
    redirect("/login");
  }

  // 2. Tu diseño exacto del Dashboard
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