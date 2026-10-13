import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Activity, FolderOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoriaClinicaForm } from "@/components/clinica/HistoriaClinicaForm";
import { EvolucionTimeline } from "@/components/clinica/EvolucionTimeline";

type Props = {
  params: Promise<{ id: string }>
}

export default async function ExpedientePacientePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: paciente, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  // PANEL DE DIAGNÓSTICO (Reemplaza al 404)
  if (error || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 p-8">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-zinc-900">Lectura Bloqueada por Supabase</h1>
        <div className="bg-white p-6 rounded-lg border border-red-200 shadow-sm text-center max-w-lg">
          <p className="text-sm text-red-600 font-bold mb-2">Mensaje devuelto por la Base de Datos:</p>
          <code className="text-xs bg-zinc-100 p-3 rounded block mb-2 font-mono text-zinc-800 text-left overflow-x-auto">
            {error?.message || "Row not found (Paciente no encontrado en la base de datos)"}
          </code>
          <p className="text-xs text-zinc-500 mt-4 text-left">
            Si el error dice "Row not found", la Seguridad RLS de Supabase sigue activa bloqueando la lectura, o no se insertaron correctamente los datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Encabezado del Paciente */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <Button variant="outline" className="text-zinc-600 bg-white">Editar Perfil</Button>
          <Button className="bg-umi-blue hover:bg-indigo-900 text-white">Alta Médica</Button>
        </div>
      </div>

      {/* Pestañas del Expediente */}
      <Tabs defaultValue="historia" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-100 p-1 rounded-lg">
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

        <div className="mt-6 min-h-[500px]">
          <TabsContent value="historia">
            <HistoriaClinicaForm paciente={paciente} />
          </TabsContent>
          <TabsContent value="evolucion">
            <EvolucionTimeline />
          </TabsContent>
          <TabsContent value="archivos" className="bg-white p-6 rounded-xl border border-zinc-200 text-center text-zinc-500 py-10">
            <p>Módulo de archivos (Próximamente)</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}