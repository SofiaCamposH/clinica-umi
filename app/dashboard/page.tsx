import { 
  Plus, Download, Search, Users, Activity, 
  CheckCircle, TrendingUp, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { NuevoPaciente } from "@/components/clinica/NuevoPaciente";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. Inicializar Supabase y consultar los datos reales
  const supabase = await createClient();
  const { data: pacientesDb, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("fecha_registro", { ascending: false });

  // 2. Calcular métricas reales basadas en la base de datos
  const totalExpedientes = pacientesDb?.length || 0;
  const enTratamiento = pacientesDb?.filter(p => p.estatus_clinico === "En tratamiento").length || 0;
  const altas = pacientesDb?.filter(p => p.estatus_clinico === "Alta médica").length || 0;

  // 3. Función auxiliar para asignar colores según el estatus
  const getColorEstatus = (estatus: string) => {
    if (estatus === "En tratamiento") return "text-blue-600 bg-blue-50 border-blue-200";
    if (estatus === "Alta médica") return "text-umi-teal bg-teal-50 border-teal-200";
    return "text-orange-600 bg-orange-50 border-orange-200"; // En valoración
  };

  // 4. Formatear fechas
  const formatFecha = (isoString: string) => {
    if (!isoString) return "Sin registro";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (error) {
    return <div className="p-8 text-red-500">Error cargando expedientes: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-umi-blue">Expedientes de Pacientes</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Directorio general y control centralizado del historial clínico, evolución funcional y bitácora.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-zinc-600">
            <Download className="mr-2 h-4 w-4" /> Exportar Reporte
          </Button>
          <NuevoPaciente />
        </div>
      </div>

      {/* Tarjetas de Métricas Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expedientes</span>
            <Users className="h-4 w-4 text-umi-blue" />
          </div>
          <div className="text-3xl font-bold text-zinc-900">{totalExpedientes}</div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
            <span className="text-green-600 font-medium flex items-center"><TrendingUp className="h-3 w-3 mr-1"/> Sincronizado</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Tratamiento</span>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{enTratamiento}</div>
          <div className="text-xs text-zinc-500 mt-2">
            Pacientes activos en clínica
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Altas Médicas</span>
            <CheckCircle className="h-4 w-4 text-umi-teal" />
          </div>
          <div className="text-3xl font-bold text-umi-teal">{altas}</div>
          <div className="text-xs text-zinc-500 mt-2">
            Resolución exitosa
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nuevos Ingresos</span>
            <Plus className="h-4 w-4 text-umi-blue" />
          </div>
          <div className="text-3xl font-bold text-zinc-900">0</div>
          <div className="text-xs text-zinc-500 mt-2">
            Esta semana
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Buscador y Tabla */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* ... Barra de búsqueda se mantiene igual ... */}
        <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50/50">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Buscar por nombre completo, RFC, CURP o folio..." className="pl-9 bg-white border-zinc-300"/>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="bg-white text-zinc-600"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
          </div>
        </div>

        {/* Tabla de Datos Mapeada desde BD */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Folio Paciente</th>
                <th className="px-6 py-4 font-semibold">Paciente & Demográficos</th>
                <th className="px-6 py-4 font-semibold">Contacto & Canal</th>
                <th className="px-6 py-4 font-semibold">Diagnóstico / Especialidad</th>
                <th className="px-6 py-4 font-semibold">Estatus Clínico</th>
                <th className="px-6 py-4 font-semibold">Última Cita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
  {pacientesDb?.map((paciente) => (
    <tr key={paciente.id} className="hover:bg-zinc-50/80 transition-colors">
      <td className="px-6 py-4">
        {/* Enlace en el Folio */}
        <Link href={`/dashboard/pacientes/${paciente.id}`}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-umi-blue hover:text-white transition-colors cursor-pointer">
            {paciente.folio}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4">
        {/* Enlace en el Nombre */}
        <Link href={`/dashboard/pacientes/${paciente.id}`}>
          <div className="font-medium text-umi-blue hover:underline cursor-pointer">
            {paciente.nombre_completo}
          </div>
        </Link>
        <div className="text-xs text-zinc-500 mt-1">{paciente.edad} años • {paciente.genero} • RFC: {paciente.rfc}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-zinc-700">{paciente.telefono}</div>
        <div className="text-xs text-zinc-500 mt-1">{paciente.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-zinc-900">{paciente.diagnostico_clinico}</div>
        <div className="text-xs text-zinc-500 mt-1">{paciente.especialidad}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getColorEstatus(paciente.estatus_clinico)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
          {paciente.estatus_clinico}
        </span>
      </td>
      <td className="px-6 py-4 font-medium text-zinc-700">
        {formatFecha(paciente.ultima_cita)}
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}