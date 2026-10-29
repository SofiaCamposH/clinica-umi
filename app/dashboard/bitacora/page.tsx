import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BitacoraAsistencia } from "@/components/clinica/BitacoraAsistencia";
import { CheckSquare, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BitacoraPage() {
  const supabase = await createClient();

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Extraer perfil del Fisioterapeuta
  const { data: fisioActual } = await supabase
    .from("perfiles_staff")
    .select("*")
    .eq("email", user.email)
    .single();

  // 3. Extraer lista de pacientes (Para el buscador)
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, folio")
    .order("nombre_completo", { ascending: true });

  return (
    <div className="flex flex-col h-full bg-zinc-50/30 min-h-screen print:bg-white print:h-auto">
      
      {/* ENCABEZADO IDÉNTICO AL DISEÑO (Oculto al imprimir) */}
      <div className="p-6 md:p-8 pb-2 print:hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        <div className="flex items-start gap-4">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-umi-blue border border-indigo-100 mt-1 shadow-sm">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-1">
              <span className="text-orange-500 mr-1">MÓDULO CLÍNICO UMI</span> • Expedición A4
            </p>
            <h1 className="text-2xl font-bold text-umi-blue">Bitácora de Asistencia y Control Terapéutico</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
            <CheckCircle2 className="h-4 w-4" /> Cumplimiento Norma Oficial Mexicana
          </span>
          <Button variant="outline" className="text-umi-blue bg-white border-umi-blue/20 hover:bg-blue-50 shadow-sm">
            <Eye className="mr-2 h-4 w-4" /> Vista Rápida
          </Button>
        </div>

      </div>
      
      {/* CONTENEDOR DEL COMPONENTE A4 */}
      <div className="flex-1 p-6 md:p-8 pt-4">
        <BitacoraAsistencia pacientes={pacientes || []} fisioActual={fisioActual} />
      </div>

    </div>
  );
}