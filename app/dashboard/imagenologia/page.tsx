import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SolicitudImagenologiaForm } from "@/components/clinica/SolicitudImagenologiaForm";

export default async function ImagenologiaPage() {
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

  // 3. Extraer lista de pacientes (Para el buscador/selector)
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, edad, genero")
    .order("nombre_completo", { ascending: true });

  // 4. Calcular el siguiente Folio
  const { data: ultimaSolicitud } = await supabase
    .from("solicitudes_imagenologia")
    .select("folio")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  let folioSugerido = `SOL-IMG-${new Date().getFullYear()}-001`;
  if (ultimaSolicitud?.folio) {
    const match = ultimaSolicitud.folio.match(/\d+$/);
    if (match) {
      const siguienteNumero = parseInt(match[0], 10) + 1;
      folioSugerido = `SOL-IMG-${new Date().getFullYear()}-${String(siguienteNumero).padStart(3, '0')}`;
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 print:bg-white print:h-auto">
      <div className="p-6 pb-2 print:hidden">
        <h1 className="text-2xl font-bold text-umi-blue">Solicitud de Estudios de Imagenología</h1>
        <p className="text-sm text-zinc-500">Gabinete de Imagen • Rehabilitación Osteomuscular</p>
      </div>
      
      <div className="flex-1 p-6 pt-2">
        <SolicitudImagenologiaForm 
          pacientes={pacientes || []} 
          fisioActual={fisioActual} 
          folio={folioSugerido} 
        />
      </div>
    </div>
  );
}