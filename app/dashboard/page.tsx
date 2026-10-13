import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Download, Users, Activity, CheckCircle2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Obtener los pacientes REALES de Supabase
  const { data: pacientesDb } = await supabase
    .from("pacientes")
    .select("*")
    .order("id", { ascending: false });

  // Calcular estadísticas para las tarjetas
  const totalExpedientes = pacientesDb?.length || 0;
  const enTratamiento = pacientesDb?.filter(p => !p.estatus_clinico || p.estatus_clinico === 'En valoración' || p.estatus_clinico === 'Activo').length || 0;
  const altasMedicas = pacientesDb?.filter(p => p.estatus_clinico === 'Alta').length || 0;

  // Función para dar color al estatus
  const getColorEstatus = (estatus: string) => {
    if (!estatus || estatus === "En valoración" || estatus === "Activo") {
      return "text-orange-600 bg-orange-50 border-orange-200";
    }
    if (estatus === "Alta") {
      return "text-teal-700 bg-teal-50 border-teal-200";
    }
    return "text-zinc-600 bg-zinc-100 border-zinc-200";
  };

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-umi-blue">Expedientes de Pacientes</h1>
          <p className="text-sm text-zinc-500 mt-1">Directorio general y control centralizado del historial clínico, evolución funcional y bitácora.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-zinc-600 bg-white shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Exportar Reporte
          </Button>
          {/* ENLACE DIRECTO A NUEVA HISTORIA CLÍNICA */}
          <Link href="/dashboard/nueva-historia">
            <Button className="bg-umi-blue hover:bg-indigo-900 text-white rounded-full px-6 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Expediente
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-zinc-500 tracking-wider">TOTAL EXPEDIENTES</p>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <h2 className="text-4xl font-black text-zinc-800">{totalExpedientes}</h2>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
              <Activity className="h-3 w-3" /> Sincronizado
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-zinc-500 tracking-wider">EN TRATAMIENTO</p>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2">
            <h2 className="text-4xl font-black text-orange-500">{enTratamiento}</h2>
            <p className="text-xs text-zinc-500 mt-1">Pacientes activos en clínica</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-zinc-500 tracking-wider">ALTAS MÉDICAS</p>
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
          </div>
          <div className="mt-2">
            <h2 className="text-4xl font-black text-teal-500">{altasMedicas}</h2>
            <p className="text-xs text-zinc-500 mt-1">Resolución exitosa</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-zinc-500 tracking-wider">NUEVOS INGRESOS</p>
            <Plus className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <h2 className="text-4xl font-black text-zinc-800">0</h2>
            <p className="text-xs text-zinc-500 mt-1">Esta semana</p>
          </div>
        </div>
      </div>

      {/* Tabla y Buscador */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Buscar por nombre, RFC o folio..." className="pl-9 bg-zinc-50 border-zinc-200 h-10 rounded-lg" />
          </div>
          <Button variant="outline" className="text-zinc-600 bg-white">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-zinc-500 font-bold text-[10px] uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Folio Paciente</th>
                <th className="px-6 py-4">Paciente & Demográficos</th>
                <th className="px-6 py-4">Contacto & Canal</th>
                <th className="px-6 py-4">Diagnóstico / Especialidad</th>
                <th className="px-6 py-4">Estatus Clínico</th>
                <th className="px-6 py-4">Última Cita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pacientesDb && pacientesDb.length > 0 ? (
                pacientesDb.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/pacientes/${paciente.id}`}>
                        <div className="inline-flex items-center px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-umi-blue hover:bg-blue-50 transition-colors cursor-pointer text-xs font-bold text-zinc-700">
                          {paciente.folio}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/pacientes/${paciente.id}`}>
                        <div className="font-medium text-umi-blue hover:underline cursor-pointer text-sm">
                          {paciente.nombre_completo}
                        </div>
                      </Link>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {paciente.edad || 0} años • {paciente.genero || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{paciente.telefono || "Sin registro"}</td>
                    <td className="px-6 py-4 text-xs text-zinc-600">Fisioterapia y Rehabilitación</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getColorEstatus(paciente.estatus_clinico)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {paciente.estatus_clinico || "En valoración"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">Sin registro</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No hay pacientes registrados en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}