"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, User, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NuevaNotaSoap } from "./NuevaNotaSoap";
import { createClient } from "@/lib/supabase/client";

// Ahora recibe el paciente y el fisio
export function EvolucionTimeline({ pacienteId, fisioActual }: { pacienteId: string; fisioActual: any }) {
  const supabase = createClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [notas, setNotas] = useState<any[]>([]);

  // Función para leer las notas desde Supabase
  const cargarNotas = async () => {
    const { data, error } = await supabase
      .from('notas_soap')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (data) {
      setNotas(data);
    }
  };

  // Cargar notas al abrir el expediente
  useEffect(() => {
    if (pacienteId) {
      cargarNotas();
    }
  }, [pacienteId]);

  // Cuando se guarda una nueva nota, cerramos el formulario y recargamos la lista
  const handleNotaGuardada = () => {
    setMostrarFormulario(false);
    cargarNotas(); 
  };

  return (
    <div className="flex flex-col w-full gap-6">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50 border border-zinc-200 p-4 rounded-xl w-full">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="bg-white p-2 rounded-lg border border-zinc-200">
            <FileText className="h-5 w-5 text-umi-blue" />
          </div>
          <div>
            <h3 className="font-bold text-umi-blue text-lg">Línea de Tiempo Clínico-Terapéutica</h3>
            <p className="text-xs text-zinc-500">Notas estructuradas de rehabilitación bajo metodología SOAP</p>
          </div>
        </div>
        
        {!mostrarFormulario ? (
          <Button onClick={() => setMostrarFormulario(true)} className="bg-umi-blue hover:bg-indigo-900 text-white shadow-md w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Registrar Nueva Cita
          </Button>
        ) : (
          <Button onClick={() => setMostrarFormulario(false)} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" /> Cancelar Registro
          </Button>
        )}
      </div>

      {/* FORMULARIO INTEGRADO */}
      {mostrarFormulario && (
        <div className="w-full border-2 border-umi-blue/30 rounded-2xl overflow-hidden shadow-lg animate-in fade-in duration-300 bg-white">
          <NuevaNotaSoap 
            pacienteId={pacienteId} 
            fisioActual={fisioActual} 
            onGuardado={handleNotaGuardada} 
          />
        </div>
      )}

      {/* LÍNEA DE TIEMPO REAL */}
      <div className="relative border-l-2 border-zinc-200 ml-4 pl-6 space-y-8 mt-4 w-full">
        
        {notas.length === 0 && !mostrarFormulario && (
          <div className="text-center p-8 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            No hay notas clínicas registradas aún.
          </div>
        )}

        {notas.map((nota) => (
          <div key={nota.id} className="relative w-full">
            <div className="absolute -left-[33px] top-2 h-4 w-4 rounded-full bg-umi-blue ring-4 ring-white" />
            
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow w-full">
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 border-b border-zinc-100 pb-3 gap-2">
                <div className="flex items-center gap-2 text-umi-blue font-bold">
                  <Calendar className="h-4 w-4" />
                  {nota.fecha} <span className="text-zinc-400 font-normal text-xs ml-2">{nota.hora}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 w-fit">
                  <User className="h-3 w-3" />
                  Sello: {nota.fisio_nombre}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-umi-blue flex items-center gap-1">
                    <span className="bg-umi-blue text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">S</span> SUBJETIVO (EVA: {nota.eva || '-'}/10)
                  </span>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg leading-relaxed">{nota.subjetivo}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                    <span className="bg-orange-500 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">O</span> OBJETIVO {nota.goniometria && `(${nota.goniometria})`}
                  </span>
                  <p className="text-sm text-zinc-600 bg-orange-50/50 p-3 rounded-lg leading-relaxed">{nota.objetivo}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                    <span className="bg-teal-600 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">A</span> ANÁLISIS {nota.fase && `(${nota.fase})`}
                  </span>
                  <p className="text-sm text-zinc-600 bg-teal-50/50 p-3 rounded-lg leading-relaxed">{nota.analisis}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <span className="bg-indigo-700 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">P</span> PLAN
                  </span>
                  <p className="text-sm text-zinc-600 bg-indigo-50/50 p-3 rounded-lg leading-relaxed">{nota.plan}</p>
                </div>
              </div>
              
              {nota.proximaCita && (
                <div className="mt-4 pt-3 border-t border-zinc-50 text-xs text-zinc-500 flex items-center gap-2">
                  <CalendarClock className="h-3 w-3 text-umi-blue" />
                  Próxima cita sugerida: <span className="font-bold text-zinc-700">{nota.proximaCita}</span>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}