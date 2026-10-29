import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PerfilForm } from "@/components/PerfilForm";
import { UserCircle } from "lucide-react";

export default async function PerfilPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles_staff")
    .select("*")
    .eq("email", user.email)
    .single();

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen">
      <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
        <div className="bg-umi-blue/10 p-3 rounded-full text-umi-blue">
          <UserCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-umi-blue">Mi Perfil Profesional</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona tus datos, tu NIP de seguridad y tu firma autógrafa digitalizada.</p>
        </div>
      </div>
      
      <div className="max-w-3xl">
        <PerfilForm perfilActual={perfil} emailAuth={user.email} />
      </div>
    </div>
  );
}