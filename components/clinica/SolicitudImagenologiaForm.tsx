"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, Lock, CheckCircle2, Loader2, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export function SolicitudImagenologiaForm({ pacientes, fisioActual, folio }: { pacientes: any[], fisioActual: any, folio: string }) {
  const supabase = createClient();
  
  // Estados para el buscador inteligente de pacientes
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [modalidad, setModalidad] = useState("Resonancia Magnética Nuclear (RMN)");
  const [modalidadOtro, setModalidadOtro] = useState(""); // Estado para cuando seleccionan "Otro"
  const [region, setRegion] = useState("");
  const [secuencias, setSecuencias] = useState({ t1: false, t2: false, stir: false, contraste: false });
  const [justificacion, setJustificacion] = useState("");
  const [prioridad, setPrioridad] = useState("Ordinaria");
  const [indicaciones, setIndicaciones] = useState("");

  const [pin, setPin] = useState("");
  const [errorPin, setErrorPin] = useState(false);
  const [isGuardando, setIsGuardando] = useState(false);
  const [isGuardado, setIsGuardado] = useState(false);

  const fechaHoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  // Filtrado de pacientes en tiempo real
  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre_completo.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
    p.folio?.toLowerCase().includes(busquedaPaciente.toLowerCase())
  );

  // Cerrar el buscador al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckbox = (key: keyof typeof secuencias) => {
    setSecuencias(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const obtenerSecuenciasTexto = () => {
    const activas = [];
    if (secuencias.t1) activas.push("Secuencia T1");
    if (secuencias.t2) activas.push("Secuencia T2");
    if (secuencias.stir) activas.push("Secuencia STIR");
    if (secuencias.contraste) activas.push("Con y Sin Contraste (Gadolinio IV)");
    return activas.length > 0 ? activas.join(", ") : "Estándar";
  };

  // Determinar qué modalidad se va a imprimir y guardar (la de la lista o la escrita a mano)
  const modalidadFinal = modalidad === "Otro" ? modalidadOtro : modalidad;

  const handleGuardar = async () => {
    if (!pacienteSeleccionado) return alert("Selecciona un paciente.");
    if (!region || !justificacion) return alert("Llena los campos requeridos (Región y Justificación).");
    if (modalidad === "Otro" && !modalidadOtro) return alert("Por favor especifica la modalidad de imagen.");
    
    if (!fisioActual?.pin_firma || String(pin).trim() !== String(fisioActual.pin_firma).trim()) {
      setErrorPin(true);
      setPin("");
      return;
    }
    setErrorPin(false);
    setIsGuardando(true);

    const { error } = await supabase.from('solicitudes_imagenologia').insert([{
      folio,
      paciente_id: pacienteSeleccionado.id,
      modalidad: modalidadFinal, // Guardamos la modalidad final
      region,
      secuencias: secuencias,
      justificacion,
      prioridad,
      indicaciones,
      fisio_nombre: fisioActual.nombre_completo,
      fisio_cedula: fisioActual.cedula
    }]);

    setIsGuardando(false);
    if (error) alert("Error: " + error.message);
    else setIsGuardado(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full print:block print:m-0 print:p-0">
      
      {/* =========================================
          PANEL IZQUIERDO: FORMULARIO (Oculto al imprimir)
          ========================================= */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6 print:hidden">
        
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
          
          {/* BUSCADOR DE PACIENTES DINÁMICO */}
          <div className="relative" ref={dropdownRef}>
            <Label className="text-xs font-bold text-umi-blue">Buscar Paciente *</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Escribe el nombre o folio..." 
                className="pl-9 bg-zinc-50 border-zinc-200"
                value={pacienteSeleccionado ? pacienteSeleccionado.nombre_completo : busquedaPaciente}
                onChange={(e) => {
                  setBusquedaPaciente(e.target.value);
                  setPacienteSeleccionado(null); // Si vuelve a escribir, deseleccionamos
                  setMostrarDropdown(true);
                }}
                onFocus={() => { if(!isGuardado) setMostrarDropdown(true); }}
                disabled={isGuardado}
              />
              {pacienteSeleccionado && !isGuardado && (
                <button 
                  type="button"
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setBusquedaPaciente("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Lista Desplegable (Dropdown) */}
            {mostrarDropdown && !pacienteSeleccionado && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {pacientesFiltrados.length > 0 ? (
                  <div className="p-1">
                    {pacientesFiltrados.map(p => (
                      <div 
                        key={p.id} 
                        className="px-3 py-2 text-sm hover:bg-umi-blue/10 hover:text-umi-blue rounded-md cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => {
                          setPacienteSeleccionado(p);
                          setMostrarDropdown(false);
                          setBusquedaPaciente("");
                        }}
                      >
                        <span className="font-medium">{p.nombre_completo}</span>
                        <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">{p.folio}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-center text-zinc-500">
                    No se encontraron pacientes.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LISTA COMPLETA DE MODALIDADES */}
          <div>
            <Label className="text-xs font-bold text-umi-blue">Modalidad de Imagen Diagnóstica</Label>
            <select 
              className="w-full mt-1 border-zinc-200 rounded-md text-sm p-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-umi-blue/20" 
              value={modalidad} 
              onChange={e => setModalidad(e.target.value)} 
              disabled={isGuardado}
            >
              <option>Resonancia Magnética Nuclear (RMN)</option>
              <option>Tomografía Axial Computarizada (TAC)</option>
              <option>Radiografía Digital (Rayos X)</option>
              <option>Ultrasonido Musculoesquelético (USG)</option>
              <option>Ultrasonido Doppler</option>
              <option>Densitometría Ósea (DEXA)</option>
              <option>Tomografía por Emisión de Positrones (PET-CT)</option>
              <option>Mastografía / Mamografía</option>
              <option>Gammagrafía Ósea / Medicina Nuclear</option>
              <option>Fluoroscopía</option>
              <option value="Otro">Otro (Especificar manualmente)</option>
            </select>
            
            {/* INPUT EXTRA SI SELECCIONAN "OTRO" */}
            {modalidad === "Otro" && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                <Input 
                  placeholder="Escriba la modalidad específica requerida..." 
                  value={modalidadOtro} 
                  onChange={e => setModalidadOtro(e.target.value)} 
                  disabled={isGuardado} 
                  className="bg-indigo-50/30 border-indigo-200 placeholder:text-indigo-300 focus-visible:ring-indigo-500" 
                  autoFocus
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-bold text-umi-blue">Región Anatómica Específica *</Label>
            <Input placeholder="Ej. Hombro Derecho - Complejo articular..." value={region} onChange={e => setRegion(e.target.value)} disabled={isGuardado} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-bold text-umi-blue mb-2 block">Secuencias / Protocolos</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm bg-zinc-50 p-2 rounded border hover:bg-zinc-100 cursor-pointer transition-colors"><input type="checkbox" checked={secuencias.t1} onChange={() => handleCheckbox('t1')} disabled={isGuardado} className="accent-umi-blue"/> T1 (Anatómico)</label>
              <label className="flex items-center gap-2 text-sm bg-zinc-50 p-2 rounded border hover:bg-zinc-100 cursor-pointer transition-colors"><input type="checkbox" checked={secuencias.t2} onChange={() => handleCheckbox('t2')} disabled={isGuardado} className="accent-umi-blue"/> T2 (Edema)</label>
              <label className="flex items-center gap-2 text-sm bg-zinc-50 p-2 rounded border hover:bg-zinc-100 cursor-pointer transition-colors"><input type="checkbox" checked={secuencias.stir} onChange={() => handleCheckbox('stir')} disabled={isGuardado} className="accent-umi-blue"/> STIR (Supresión grasa)</label>
              <label className="flex items-center gap-2 text-sm bg-zinc-50 p-2 rounded border hover:bg-zinc-100 cursor-pointer transition-colors"><input type="checkbox" checked={secuencias.contraste} onChange={() => handleCheckbox('contraste')} disabled={isGuardado} className="accent-umi-blue"/> Contraste IV</label>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-umi-blue">Justificación Clínica / Dx. Presuntivo *</Label>
            <Textarea placeholder="Describa el mecanismo de lesión, evolución y hallazgos relevantes..." value={justificacion} onChange={e => setJustificacion(e.target.value)} disabled={isGuardado} className="mt-1 resize-none h-24" />
          </div>

          <div>
            <Label className="text-xs font-bold text-umi-blue mb-2 block">Prioridad Clínica</Label>
            <div className="flex gap-2">
              <Button type="button" variant={prioridad === "Ordinaria" ? "default" : "outline"} onClick={() => setPrioridad("Ordinaria")} disabled={isGuardado} className={prioridad === "Ordinaria" ? "bg-umi-blue flex-1" : "flex-1"}>Ordinaria</Button>
              <Button type="button" variant={prioridad === "Urgente" ? "default" : "outline"} onClick={() => setPrioridad("Urgente")} disabled={isGuardado} className={prioridad === "Urgente" ? "bg-red-500 hover:bg-red-600 flex-1" : "flex-1"}>Prioritaria / Urgente</Button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-umi-blue">Indicaciones Especiales (Gabinete)</Label>
            <Input placeholder="Ej. Llevar RX previas. Ayuno de 4 hrs." value={indicaciones} onChange={e => setIndicaciones(e.target.value)} disabled={isGuardado} className="mt-1" />
          </div>
        </div>

        {/* ZONA DE FIRMA */}
        <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 flex flex-col gap-3">
          <Label className="text-sm font-bold text-umi-blue flex items-center gap-2"><Lock className="h-4 w-4" /> Sello Digital del Fisioterapeuta</Label>
          {isGuardado ? (
            <Button onClick={() => window.print()} className="w-full bg-white text-umi-blue border border-umi-blue hover:bg-blue-50 shadow-sm"><Printer className="mr-2 h-4 w-4" /> Imprimir Orden Médica</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input type="password" maxLength={4} placeholder="NIP" value={pin} onChange={e => setPin(e.target.value)} className={`w-20 text-center tracking-widest bg-white ${errorPin ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
              <Button onClick={handleGuardar} disabled={isGuardando || !pacienteSeleccionado} className="flex-1 bg-umi-blue hover:bg-indigo-900 text-white shadow-sm transition-all">
                {isGuardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Emitir Orden Segura</>}
              </Button>
            </div>
          )}
          {errorPin && <p className="text-[10px] text-red-500 text-center font-bold">El NIP no coincide con tu perfil.</p>}
        </div>

      </div>

      {/* =========================================
          PANEL DERECHO: PREVISUALIZACIÓN EN VIVO
          ========================================= */}
      <div className="w-full lg:w-[55%] flex justify-center bg-zinc-200/50 rounded-xl p-4 overflow-y-auto print:p-0 print:bg-white print:w-full print:block">
        
        {/* HOJA TAMAÑO CARTA */}
        <div className="bg-white w-full max-w-[800px] shadow-lg rounded-sm p-8 md:p-12 print:shadow-none print:rounded-none print:p-0">
          
          <div className="flex justify-between items-start border-b-2 border-umi-blue pb-4 mb-6">
            <div className="relative h-14 w-32"><Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain object-left" priority /></div>
            <div className="text-right text-[10px] text-zinc-600">
              <p className="font-bold text-umi-blue text-xs">UNIDAD MÉDICA INTERDISCIPLINARIA</p>
              <p>Clínica de Fisioterapia, Rehabilitación y Medicina Física</p>
              <p>Av. Paulino N. Martí #1206, esq. Pozo Blanco, Ags.</p>
              <p className="mt-1 font-mono text-zinc-400">Folio: {folio}</p>
            </div>
          </div>

          <h2 className="text-center font-black text-sm uppercase tracking-widest text-zinc-800 mb-6">Orden Médica de Estudio Radiológico / Imagenología</h2>

          <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 mb-6 flex flex-wrap justify-between gap-4 text-xs">
            <div>
              <p className="text-zinc-500 font-bold mb-1">PACIENTE</p>
              <p className="font-black text-umi-blue uppercase text-sm">{pacienteSeleccionado?.nombre_completo || "SELECCIONE UN PACIENTE"}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-bold mb-1">EDAD / GÉNERO</p>
              <p className="font-medium text-zinc-800 uppercase">{pacienteSeleccionado ? `${pacienteSeleccionado.edad} años / ${pacienteSeleccionado.genero}` : "-"}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-bold mb-1">FECHA DE EMISIÓN</p>
              <p className="font-medium text-zinc-800">{fechaHoy}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-bold mb-1">PRIORIDAD</p>
              <p className={`font-bold uppercase ${prioridad === "Urgente" ? "text-red-600" : "text-umi-blue"}`}>{prioridad}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Estudio Solicitado:</p>
              <p className="text-lg font-black text-zinc-800 uppercase border-b border-zinc-200 pb-1">
                {modalidadFinal || "..."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Región Anatómica:</p>
                <p className="text-sm font-medium text-zinc-800">{region || "..."}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Secuencias / Protocolos:</p>
                <p className="text-sm font-medium text-zinc-800">{obtenerSecuenciasTexto()}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Justificación Clínica / Diagnóstico Presuntivo:</p>
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 min-h-[100px]">
                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{justificacion || "Esperando descripción clínica..."}</p>
              </div>
            </div>

            {indicaciones && (
              <div>
                <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Indicaciones al Gabinete:</p>
                <p className="text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">{indicaciones}</p>
              </div>
            )}
          </div>

          <div className="mt-16 pt-8 border-t-2 border-dashed border-zinc-200 flex justify-between items-end">
            <div className="text-center w-64">
              <div className="border-b border-zinc-400 pb-2 mb-2 h-16 flex items-end justify-center relative">
                {isGuardado && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <CheckCircle2 className="h-12 w-12 text-umi-blue" />
                  </div>
                )}
                <span className="font-bold text-umi-blue text-sm relative z-10">{fisioActual?.nombre_completo}</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold">Fisioterapeuta Tratante</p>
              <p className="text-[10px] text-zinc-400">Cédula Prof: {fisioActual?.cedula || "N/A"}</p>
            </div>
            
            <div className="text-right text-[9px] text-zinc-400 max-w-[200px]">
              <p className="font-bold text-zinc-500 mb-1">VALIDACIÓN INSTITUCIONAL</p>
              <p>Documento amparado por la NOM-004-SSA3-2012 del Expediente Clínico.</p>
              {isGuardado && <p className="mt-1 text-umi-blue font-bold">✓ Criptográficamente Sellado</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}