"use client";

import { Plus, CheckCircle, Shield, FileText, Image as ImageIcon, Paperclip, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EvolucionTimeline() {
  return (
    <div className="space-y-8">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border border-zinc-200">
            <FileText className="h-5 w-5 text-umi-blue" />
          </div>
          <div>
            <h3 className="font-bold text-umi-blue">Línea de Tiempo Clínico-Terapéutica</h3>
            <p className="text-xs text-zinc-500">Notas estructuradas de rehabilitación bajo metodología SOAP</p>
          </div>
        </div>
        <Button className="bg-umi-blue hover:bg-indigo-900 text-white mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Registrar Nueva Cita
        </Button>
      </div>

      {/* Contenedor de la Línea de Tiempo */}
      <div className="relative border-l-2 border-zinc-200 ml-4 pl-8 space-y-10 pb-8">
        
        {/* VISITA 5 (Vista Expandida) */}
        <div className="relative">
          {/* Icono del Timeline */}
          <div className="absolute -left-[43px] bg-white p-1 rounded-full">
            <CheckCircle className="h-6 w-6 text-orange-500 fill-orange-100" />
          </div>

          {/* Cabecera de la Visita */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-lg bg-umi-blue text-white px-2 py-0.5 rounded-md text-sm">Visita 5</span>
              <span className="font-bold text-zinc-800">18 de Octubre, 2024</span>
              <span className="text-zinc-400 text-sm">- 11:30 hrs</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500">Atendió: Lic. Valeria Mendoza</span>
              <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-bold">Completada</span>
            </div>
          </div>

          {/* Cuadrícula SOAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Subjetivo */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-bold text-umi-blue">
                  <span className="bg-umi-blue text-white w-6 h-6 flex items-center justify-center rounded text-xs">S</span>
                  SUBJETIVO
                </div>
                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">EVA 3/10</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Paciente refiere disminución notable del dolor en reposo. Presenta sensación de tensión y molestia leve clasificada como <span className="font-bold text-orange-600">EVA 3/10</span> exclusivamente durante elevación por encima de los 120°. Niega parestesias nocturnas.
              </p>
              <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-teal-500" /> Mejoría en descanso nocturno sostenido.
              </div>
            </div>

            {/* Objetivo */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-bold text-orange-500">
                  <span className="bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded text-xs">O</span>
                  OBJETIVO
                </div>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Goniometría ↑</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                <span className="font-bold">Goniometría de hombro derecho:</span> flexión activa mejoró a <span className="font-bold">155°</span> (vs 110° basal), abducción a <span className="font-bold">140°</span>. Notoria disminución de contractura hipertrófica en trapecio superior.
              </p>
              <div className="mt-4 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                  <span>Flexión Activa (Meta: 180°)</span>
                  <span>155° (86%)</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-1.5">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
            </div>

            {/* Análisis */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-bold text-teal-600">
                  <span className="bg-teal-600 text-white w-6 h-6 flex items-center justify-center rounded text-xs">A</span>
                  ANÁLISIS / DIAGNÓSTICO
                </div>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Favorable progreso cicatrizal y biomecánico. Se observa óptima tolerancia al ejercicio excéntrico subacromial. Control neuromotor escapulotorácico restablecido en un 70%.
              </p>
              <div className="mt-3">
                <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-700 px-2 py-1 rounded-md font-bold">
                  Fase de Fortalecimiento II
                </span>
              </div>
            </div>

            {/* Plan */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-bold text-indigo-700">
                  <span className="bg-indigo-700 text-white w-6 h-6 flex items-center justify-center rounded text-xs">P</span>
                  PLAN TERAPÉUTICO
                </div>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Continuar con ejercicios de fortalecimiento periescapular progresivo y terapia manual articular glenohumeral grado III. Aplicación de crioterapia compresiva 15 min al finalizar sesión.
              </p>
              <div className="mt-3 text-[11px] text-orange-600 font-medium flex items-center gap-1">
                <Activity className="h-3 w-3" /> Próxima cita programada en 48 hrs.
              </div>
            </div>

          </div>

          {/* Archivos Adjuntos de la Sesión */}
          <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-2">
              <Paperclip className="h-3 w-3" /> Archivos y Evidencias Adjuntas a la Sesión (2)
            </span>
            <div className="flex gap-4">
              {/* Archivo 1 */}
              <div className="bg-white border border-zinc-200 rounded-lg p-2 flex items-center gap-3 w-64 shadow-sm cursor-pointer hover:border-umi-blue transition-colors">
                <div className="bg-blue-50 p-2 rounded text-blue-600"><ImageIcon className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-800 truncate">Foto_Postural_Sesion...</p>
                  <p className="text-[10px] text-zinc-400">3.8 MB · 18 Oct 2024</p>
                </div>
              </div>
              {/* Archivo 2 */}
              <div className="bg-white border border-zinc-200 rounded-lg p-2 flex items-center gap-3 w-64 shadow-sm cursor-pointer hover:border-umi-blue transition-colors">
                <div className="bg-orange-50 p-2 rounded text-orange-600"><FileText className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-800 truncate">Reporte_Electromiog...</p>
                  <p className="text-[10px] text-zinc-400">4.2 MB · Dr. Armenta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VISITA 4 (Vista Compacta) */}
        <div className="relative opacity-60 hover:opacity-100 transition-opacity">
          <div className="absolute -left-[43px] bg-white p-1 rounded-full">
            <Shield className="h-6 w-6 text-umi-blue fill-indigo-100" />
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 text-sm">Visita 4</span>
              <span className="font-bold text-zinc-800">14 de Octubre, 2024</span>
              <span className="text-zinc-400 text-sm">- 10:00 hrs</span>
            </div>
            <span className="text-xs text-zinc-400">Completada</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-2">
             <div className="flex gap-2 text-sm text-zinc-600">
               <span className="bg-umi-blue text-white w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold">S</span>
               <p>Paciente reporta disminución paulatina del dolor residual pero persiste limitación (EVA 5/10).</p>
             </div>
             <div className="flex gap-2 text-sm text-zinc-600">
               <span className="bg-orange-500 text-white w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold">O</span>
               <p>Arco doloroso entre 80° y 110°. Sensibilidad a la palpación del tendón disminuida.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}