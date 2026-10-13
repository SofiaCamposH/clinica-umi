"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Lock, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NuevaNotaSoap({ onGuardado }: { onGuardado: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [errorPin, setErrorPin] = useState(false);

  // Simulación de datos del fisio
  const fisioActual = { nombre: "Lic. Valeria Mendoza", pinCorrecto: "1234" };

  const [formData, setFormData] = useState({
    subjetivo: "", eva: "",
    objetivo: "", goniometria: "",
    analisis: "", fase: "",
    plan: "", proximaCita: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== fisioActual.pinCorrecto) {
      setErrorPin(true);
      setPin("");
      return;
    }
    setIsLoading(true);
    setErrorPin(false);

    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false);
      setPin("");
      onGuardado(); // Cierra el formulario
    }, 800);
  };

  return (
    <div className="bg-white">
      {/* Encabezado del Formulario */}
      <div className="p-6 bg-umi-blue/5 border-b border-umi-blue/10 flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg text-umi-blue shadow-sm border border-umi-blue/20">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-umi-blue text-lg font-bold">Registro de Sesión Subsecuente</h2>
          <p className="text-xs text-zinc-500">Metodología SOAP. Llena los campos para actualizar el historial.</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* CUADRÍCULA 2x2 PARA LOS MÓDULOS SOAP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* S - SUBJETIVO */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <Label className="flex items-center gap-2 font-bold text-umi-blue text-sm">
                <span className="bg-umi-blue text-white w-6 h-6 flex items-center justify-center rounded text-xs">S</span> SUBJETIVO
              </Label>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-zinc-500">Dolor (EVA)</Label>
                <Input 
                  placeholder="3/10" className="w-16 h-7 text-xs border-orange-200 bg-orange-50 text-orange-700 font-bold px-2 text-center" 
                  value={formData.eva} onChange={e => setFormData({...formData, eva: e.target.value})}
                />
              </div>
            </div>
            <Textarea 
              required placeholder="¿Qué refiere el paciente hoy? Evolución del dolor, síntomas en casa..." 
              className="text-sm resize-none flex-1 min-h-[100px]" 
              value={formData.subjetivo} onChange={e => setFormData({...formData, subjetivo: e.target.value})}
            />
          </div>

          {/* O - OBJETIVO */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <Label className="flex items-center gap-2 font-bold text-orange-500 text-sm">
                <span className="bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded text-xs">O</span> OBJETIVO
              </Label>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-zinc-500">Dato Clave</Label>
                <Input 
                  placeholder="Ej. Flexión 140°" className="w-28 h-7 text-xs border-teal-200 bg-teal-50 text-teal-700 font-bold px-2" 
                  value={formData.goniometria} onChange={e => setFormData({...formData, goniometria: e.target.value})}
                />
              </div>
            </div>
            <Textarea 
              required placeholder="Hallazgos en la exploración de hoy, palpación, pruebas específicas..." 
              className="text-sm resize-none flex-1 min-h-[100px]" 
              value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})}
            />
          </div>

          {/* A - ANÁLISIS */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <Label className="flex items-center gap-2 font-bold text-teal-600 text-sm">
                <span className="bg-teal-600 text-white w-6 h-6 flex items-center justify-center rounded text-xs">A</span> ANÁLISIS / DIAGNÓSTICO
              </Label>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-zinc-500">Fase actual</Label>
                <Input 
                  placeholder="Ej. Readaptación" className="w-28 h-7 text-xs bg-zinc-50 px-2" 
                  value={formData.fase} onChange={e => setFormData({...formData, fase: e.target.value})}
                />
              </div>
            </div>
            <Textarea 
              required placeholder="Análisis clínico del progreso, respuesta al tratamiento anterior..." 
              className="text-sm resize-none flex-1 min-h-[100px]" 
              value={formData.analisis} onChange={e => setFormData({...formData, analisis: e.target.value})}
            />
          </div>

          {/* P - PLAN */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <Label className="flex items-center gap-2 font-bold text-indigo-700 text-sm">
                <span className="bg-indigo-700 text-white w-6 h-6 flex items-center justify-center rounded text-xs">P</span> PLAN TERAPÉUTICO
              </Label>
            </div>
            <Textarea 
              required placeholder="Terapia aplicada hoy, ejercicios prescritos para casa..." 
              className="text-sm resize-none flex-1 min-h-[100px]" 
              value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}
            />
          </div>

        </div>

        {/* PRÓXIMA CITA (Separada para no romper la simetría) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <Label className="text-sm font-bold text-zinc-700 flex items-center gap-2 min-w-[120px]">
            <CalendarClock className="h-4 w-4 text-umi-blue" /> Próxima cita:
          </Label>
          <Input 
            placeholder="Ej. En 48 hrs / Mismo horario (Opcional)" className="h-10 text-sm bg-white flex-1" 
            value={formData.proximaCita} onChange={e => setFormData({...formData, proximaCita: e.target.value})}
          />
        </div>

        {/* ZONA DE FIRMA Y GUARDADO */}
        <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <Label className="text-base font-bold text-umi-blue flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5" /> Firma Digital (Fisioterapeuta)
            </Label>
            <p className="text-xs text-zinc-500 leading-tight">
              Al sellar esta nota, quedará guardada permanentemente bajo el usuario <span className="font-bold">{fisioActual.nombre}</span> cumpliendo con la NOM-004.
            </p>
            {errorPin && <p className="text-sm text-red-500 mt-2 font-medium">PIN incorrecto. Ingresa 1234 para probar.</p>}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input 
              type="password" required maxLength={4} placeholder="PIN" 
              className={`w-24 text-center text-lg tracking-widest bg-white h-12 ${errorPin ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={pin} onChange={(e) => setPin(e.target.value)}
            />
            <Button type="submit" disabled={isLoading} className="flex-1 md:w-48 h-12 text-sm bg-umi-blue hover:bg-indigo-900 text-white shadow-md">
              {isLoading ? "Guardando..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Sellar y Guardar</>}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}