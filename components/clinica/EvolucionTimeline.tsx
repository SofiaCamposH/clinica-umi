"use client";

import { useState } from "react";
import { FileText, Calendar, User, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NuevaNotaSoap } from "./NuevaNotaSoap";

export function EvolucionTimeline() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Datos simulados de notas pasadas
  const notas = [
    {
      id: 1,
      fecha: "12 Oct 2026",
      hora: "10:30 AM",
      fisio: "Lic. Valeria Mendoza",
      subjetivo: "Paciente refiere disminución del dolor al caminar. Siente rigidez por las mañanas.",
      eva: "3",
      objetivo: "Flexión de rodilla a 110°. Fuerza muscular 4/5 en cuádriceps.",
      analisis: "Evolución favorable, buena respuesta a los ejercicios isométricos.",
      plan: "Continuar con fase de fortalecimiento. Cita en 48 hrs."
    }
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      
      {/* 1. ENCABEZADO Y BOTÓN DE ACCIÓN */}
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
        
        {/* Botón para mostrar/ocultar */}
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

      {/* 2. FORMULARIO INTEGRADO (Completamente separado del encabezado, usa el 100% del ancho) */}
      {mostrarFormulario && (
        <div className="w-full border-2 border-umi-blue/30 rounded-2xl overflow-hidden shadow-lg animate-in fade-in duration-300 bg-white">
          <NuevaNotaSoap onGuardado={() => setMostrarFormulario(false)} />
        </div>
      )}

      {/* 3. HISTORIAL / LÍNEA DE TIEMPO */}
      <div className="relative border-l-2 border-zinc-200 ml-4 pl-6 space-y-8 mt-4 w-full">
        {notas.map((nota) => (
          <div key={nota.id} className="relative w-full">
            {/* Punto decorativo */}
            <div className="absolute -left-[33px] top-2 h-4 w-4 rounded-full bg-umi-blue ring-4 ring-white" />
            
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow w-full">
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 border-b border-zinc-100 pb-3 gap-2">
                <div className="flex items-center gap-2 text-umi-blue font-bold">
                  <Calendar className="h-4 w-4" />
                  {nota.fecha} <span className="text-zinc-400 font-normal text-xs ml-2">{nota.hora}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 w-fit">
                  <User className="h-3 w-3" />
                  Sello: {nota.fisio}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-umi-blue flex items-center gap-1">
                    <span className="bg-umi-blue text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">S</span> SUBJETIVO (EVA: {nota.eva}/10)
                  </span>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg leading-relaxed">{nota.subjetivo}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                    <span className="bg-orange-500 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">O</span> OBJETIVO
                  </span>
                  <p className="text-sm text-zinc-600 bg-orange-50/50 p-3 rounded-lg leading-relaxed">{nota.objetivo}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                    <span className="bg-teal-600 text-white w-4 h-4 rounded flex items-center justify-center text-[10px]">A</span> ANÁLISIS
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

            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}