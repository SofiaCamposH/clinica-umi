import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Activity, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoriaClinicaForm } from "@/components/clinica/HistoriaClinicaForm";
import { EvolucionTimeline } from "@/components/clinica/EvolucionTimeline";

// En Next.js 15 los params son una promesa
type Props = {
  params: Promise<{ id: string }>
}

export default async function ExpedientePacientePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Consultar los datos del paciente específico
  const { data: paciente, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !paciente) {
    return notFound(); // Muestra pantalla de error 404 si el paciente no existe
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
          <Button variant="outline" className="text-zinc-600">Editar Perfil</Button>
          <Button className="bg-umi-blue hover:bg-indigo-900 text-white">Alta Médica</Button>
        </div>
      </div>

      {/* Pestañas del Expediente Unificado */}
      <Tabs defaultValue="historia" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-100 p-1 rounded-lg">
          <TabsTrigger value="historia" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <FileText className="w-4 h-4 mr-2" />
            Historia Clínica Inicial
          </TabsTrigger>
          <TabsTrigger value="evolucion" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <Activity className="w-4 h-4 mr-2" />
            Notas de Evolución (SOAP)
          </TabsTrigger>
          <TabsTrigger value="archivos" className="data-[state=active]:bg-white data-[state=active]:text-umi-blue">
            <FolderOpen className="w-4 h-4 mr-2" />
            Estudios y Archivos
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 min-h-[500px]">
          
          <TabsContent value="historia">
            {/* Aquí mandamos a llamar a nuestro mega-formulario y le pasamos los datos del paciente */}
            <HistoriaClinicaForm paciente={paciente} />
          </TabsContent>
          
          <TabsContent value="evolucion" className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
  <EvolucionTimeline />
</TabsContent>
          
          <TabsContent value="archivos" className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="text-center py-10 text-zinc-500">
              <p>Aquí conectaremos el Storage de Supabase para subir PDFs y radiografías.</p>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}