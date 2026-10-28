import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HistoriaClinicaForm } from "@/components/clinica/HistoriaClinicaForm";

export default async function NuevaHistoriaPage() {
  const supabase = await createClient();

  // 1. Verificamos quién está logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Buscamos su perfil real de Staff
  const { data: fisioActual } = await supabase
    .from("perfiles_staff")
    .select("*")
    .eq("email", user.email)
    .single();

  // 3. LÓGICA DE FOLIO SECUENCIAL (PAC-0001)
  const { data: ultimoPaciente } = await supabase
    .from("pacientes")
    .select("folio")
    .order("id", { ascending: false }) // Trae el último registrado
    .limit(1)
    .single();

  let folioSugerido = "PAC-0001"; // El valor por defecto si la base de datos está vacía

  if (ultimoPaciente?.folio) {
    // Extrae los últimos números del folio anterior usando una expresión regular
    const match = ultimoPaciente.folio.match(/\d+$/);
    if (match) {
      const siguienteNumero = parseInt(match[0], 10) + 1;
      // Convierte el número 2 en "0002"
      folioSugerido = `PAC-${String(siguienteNumero).padStart(4, '0')}`;
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen print:p-0 print:bg-white">
      
      {/* Encabezado - Oculto al imprimir */}
      <div className="print:hidden">
        <h1 className="text-3xl font-bold text-umi-blue">Apertura de Nuevo Expediente</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Llena los campos para registrar la historia clínica de un paciente de primera vez.
        </p>
      </div>

      {/* Formulario recibiendo el nuevo folio inteligente */}
      <div className="mt-4 print:mt-0">
        <HistoriaClinicaForm 
          paciente={null} 
          fisioActual={fisioActual} 
          folioSugerido={folioSugerido} 
        />
      </div>
      
    </div>
  );
}