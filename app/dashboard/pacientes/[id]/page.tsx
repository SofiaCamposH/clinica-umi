import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Activity, FolderOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoriaClinicaForm } from "@/components/clinica/HistoriaClinicaForm";
import { EvolucionTimeline } from "@/components/clinica/EvolucionTimeline";
import { GestorArchivos } from "@/components/clinica/GestorArchivos";

type Props = {
  params: Promise<{ id: string }>
}

export default async function ExpedientePacientePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Extraemos el paciente específico de la base de datos
  const { data: paciente, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  // 2. Extraemos el fisio que inició sesión
  const { data: { user } } = await supabase.auth.getUser();
  let fisioActual = null;
  
  if (user) {
    const { data: staffData } = await supabase
      .from("perfiles_staff")
      .select("*")
      .eq("email", user.email)
      .single();
      
    fisioActual = staffData;
  }

  // Si no se encuentra el paciente, mostramos un error
  if (error || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 p-8">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-zinc-900">Expediente no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 print:p-0 print:bg-white">
      
      {/* ENCABEZADO DEL PACIENTE (Oculto al imprimir) */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-umi-blue/10 rounded-full flex items-center justify-center text-umi-blue">
            <User className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">{paciente.nombre_completo}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-umi-blue border border-indigo-100">
                {paciente.folio}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {paciente.edad} años • {paciente.genero} • Tel: {paciente.telefono}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-umi-blue hover:bg-indigo-900 text-white">Alta Médica</Button>
        </div>
      </div>

      {/* PESTAÑAS DEL EXPEDIENTE */}
      <Tabs defaultValue="historia" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-100 p-1 rounded-lg print:hidden">
          <TabsTrigger value="historia" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <FileText className="w-4 h-4 mr-2" /> Historia Clínica
          </TabsTrigger>
          <TabsTrigger value="evolucion" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <Activity className="w-4 h-4 mr-2" /> Notas SOAP
          </TabsTrigger>
          <TabsTrigger value="archivos" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <FolderOpen className="w-4 h-4 mr-2" /> Archivos
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 min-h-[500px] print:mt-0">
          
          <TabsContent value="historia" className="print:m-0">
            {/* Aquí mandamos el paciente cargado al formulario para que se auto-llene */}
            <HistoriaClinicaForm paciente={paciente} fisioActual={fisioActual} />
          </TabsContent>
          
          <TabsContent value="evolucion" className="print:hidden">
            <EvolucionTimeline pacienteId={paciente.id} fisioActual={fisioActual} />
          </TabsContent>
          
          <TabsContent value="archivos" className="print:hidden mt-6">
            <GestorArchivos pacienteId={paciente.id} fisioActual={fisioActual} />
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}