"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, CheckCircle2, Search, Loader2, X, Plus, Edit3, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/lib/supabase/client";

export function BitacoraAsistencia({ pacientes, fisioActual }: { pacientes: any[], fisioActual: any }) {
  const supabase = createClient();
  const sigPad = useRef<any>(null);
  
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgendando, setIsAgendando] = useState(false);

  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaTerapia, setNuevaTerapia] = useState("");
  const [aseguradora, setAseguradora] = useState(""); // NUEVO CAMPO ASEGURADORA

  const [modalFirma, setModalFirma] = useState<{ tipo: 'paciente' | 'fisio', sesionId: string } | null>(null);
  const [pin, setPin] = useState("");
  const [errorPin, setErrorPin] = useState(false);
  const [isFirmando, setIsFirmando] = useState(false);

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre_completo.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
    p.folio?.toLowerCase().includes(busquedaPaciente.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarSesiones = async (idPaciente: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from("bitacora_asistencia")
      .select("*")
      .eq("paciente_id", idPaciente)
      .order("fecha", { ascending: true });
    
    if (data) setSesiones(data);
    setIsLoading(false);
  };

  const handleSeleccionarPaciente = (p: any) => {
    setPacienteSeleccionado(p);
    setMostrarDropdown(false);
    setBusquedaPaciente("");
    cargarSesiones(p.id);
  };

  const agregarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSeleccionado || !nuevaTerapia) return;
    setIsAgendando(true);
    
    await supabase.from("bitacora_asistencia").insert([{
      paciente_id: pacienteSeleccionado.id,
      fecha: nuevaFecha,
      hora: "00:00", 
      terapia: nuevaTerapia,
      estatus: "Asistió",
      fisio_asignado: fisioActual?.nombre_completo
    }]);

    setNuevaTerapia("");
    setIsAgendando(false);
    cargarSesiones(pacienteSeleccionado.id);
  };

  const procesarFirma = async () => {
    if (!modalFirma) return;
    setIsFirmando(true);
    let actualizacion = {};

    if (modalFirma.tipo === 'paciente') {
      if (sigPad.current?.isEmpty()) {
        alert("El paciente debe dibujar su firma.");
        setIsFirmando(false);
        return;
      }
      const firmaBase64 = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
      actualizacion = { firma_paciente: firmaBase64 };
    } 
    else if (modalFirma.tipo === 'fisio') {
      if (!fisioActual?.pin_firma || String(pin).trim() !== String(fisioActual.pin_firma).trim()) {
        setErrorPin(true);
        setIsFirmando(false);
        setPin("");
        return;
      }
      actualizacion = { sello_fisio: fisioActual.nombre_completo };
    }

    await supabase.from("bitacora_asistencia").update(actualizacion).eq("id", modalFirma.sesionId);
    
    setModalFirma(null);
    setPin("");
    setErrorPin(false);
    setIsFirmando(false);
    cargarSesiones(pacienteSeleccionado.id);
  };

  return (
    <div className="relative">
      
      {/* ESTILO PARA FORZAR COLORES AL IMPRIMIR A PDF */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background-color: white !important; }
        }
      `}} />

      {/* MODAL FIRMAS */}
      {modalFirma && (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-umi-blue">
                {modalFirma.tipo === 'paciente' ? "Firma del Paciente" : "Sello Digital Fisioterapeuta"}
              </h3>
              <button onClick={() => {setModalFirma(null); setErrorPin(false); setPin("");}} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
            </div>

            {modalFirma.tipo === 'paciente' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50">
                  <SignatureCanvas ref={sigPad} penColor="#0f172a" canvasProps={{className: 'w-full h-40'}} />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => sigPad.current?.clear()} className="text-red-500 border-red-200 bg-red-50 hover:bg-red-100">Limpiar</Button>
                  <Button onClick={procesarFirma} disabled={isFirmando} className="bg-umi-blue hover:bg-indigo-900 text-white">
                    {isFirmando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Guardar Firma"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <Lock className="h-12 w-12 text-umi-blue mx-auto mb-2 opacity-20" />
                <p className="text-sm text-zinc-600 mb-4">Ingresa tu NIP de seguridad para sellar la sesión. Quedará registrada a nombre de <b>{fisioActual?.nombre_completo}</b>.</p>
                <Input type="password" maxLength={4} autoFocus placeholder="NIP" value={pin} onChange={e => setPin(e.target.value)} className={`w-32 mx-auto text-center tracking-widest text-lg h-12 ${errorPin ? 'border-red-500 ring-2 ring-red-200' : ''}`} />
                {errorPin && <p className="text-xs text-red-500 font-bold mt-1">NIP incorrecto</p>}
                <Button onClick={procesarFirma} disabled={isFirmando || pin.length < 4} className="w-full bg-umi-blue hover:bg-indigo-900 text-white h-12 mt-4">
                  {isFirmando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sellar Sesión"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANTALLA DIVIDIDA */}
      <div className="flex flex-col lg:flex-row gap-6 h-full print:block print:m-0 print:p-0">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6 print:hidden">
          
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <FileText className="h-5 w-5 text-umi-blue" />
              <h2 className="font-bold text-zinc-700">Filtros y Configuración</h2>
            </div>

            {/* Buscador de Paciente */}
            <div className="relative" ref={dropdownRef}>
              <Label className="text-xs font-bold text-zinc-500 mb-1 block">Paciente Asignado *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="Buscar paciente..." 
                  className="pl-9 bg-zinc-50 border-zinc-200"
                  value={pacienteSeleccionado ? pacienteSeleccionado.nombre_completo : busquedaPaciente}
                  onChange={(e) => {
                    setBusquedaPaciente(e.target.value);
                    setPacienteSeleccionado(null);
                    setMostrarDropdown(true);
                  }}
                  onFocus={() => setMostrarDropdown(true)}
                />
                {pacienteSeleccionado && (
                  <button onClick={() => {setPacienteSeleccionado(null); setBusquedaPaciente(""); setSesiones([]);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                )}
              </div>

              {mostrarDropdown && !pacienteSeleccionado && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {pacientesFiltrados.length > 0 ? (
                    <div className="p-1">
                      {pacientesFiltrados.map(p => (
                        <div key={p.id} onClick={() => handleSeleccionarPaciente(p)} className="px-3 py-2 text-sm hover:bg-umi-blue/10 hover:text-umi-blue rounded-md cursor-pointer flex justify-between items-center transition-colors">
                          <span className="font-medium">{p.nombre_completo}</span>
                          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">{p.folio}</span>
                        </div>
                      ))}
                    </div>
                  ) : (<div className="p-4 text-sm text-center text-zinc-500">No hay resultados.</div>)}
                </div>
              )}
            </div>

            {/* Nuevo Campo Aseguradora */}
            <div>
              <Label className="text-xs font-bold text-zinc-500 mb-1 block">Aseguradora (Opcional)</Label>
              <Input 
                placeholder="Ej. GNP, AXA, MetLife..." 
                value={aseguradora} 
                onChange={(e) => setAseguradora(e.target.value)} 
                className="bg-zinc-50 border-zinc-200"
              />
            </div>

            {/* Agregar Fila */}
            <form onSubmit={agregarSesion} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <Label className="text-xs font-bold text-umi-blue">Registrar Terapia (Llenado Digital)</Label>
              <div className="flex gap-2">
                <Input type="date" required value={nuevaFecha} onChange={e=>setNuevaFecha(e.target.value)} className="bg-white text-xs flex-1" />
              </div>
              <Input placeholder="Descripción de la terapia aplicada..." required value={nuevaTerapia} onChange={e=>setNuevaTerapia(e.target.value)} className="bg-white text-xs" />
              <Button type="submit" disabled={isAgendando || !pacienteSeleccionado} className="w-full bg-umi-blue hover:bg-indigo-900 text-white h-9 text-xs">
                {isAgendando ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" /> Añadir Fila</>}
              </Button>
            </form>

            <div className="space-y-2 pt-2">
              <Button onClick={() => window.print()} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"><Printer className="mr-2 h-4 w-4" /> Generar y Descargar PDF</Button>
            </div>

          </div>
        </div>

        {/* PANEL DERECHO: HOJA A4 PREVIEW (GRID FORMAL) */}
        <div className="w-full lg:w-[65%] flex justify-center bg-zinc-200/50 rounded-xl p-4 overflow-y-auto print:p-0 print:bg-white print:w-full print:block min-h-[800px]">
          
          <div className="bg-white w-full max-w-[800px] shadow-lg p-8 md:p-12 print:shadow-none print:p-0 relative min-h-[1056px]">
            
            {/* Membrete */}
            <div className="flex justify-between items-start border-b-2 border-umi-blue pb-4 mb-4">
              <div className="relative h-14 w-32"><Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain object-left" priority /></div>
              <div className="text-right text-[10px] text-zinc-600">
                <p className="font-bold text-umi-blue text-xs">UNIDAD MÉDICA INTERDISCIPLINARIA</p>
                <p>Clínica de Fisioterapia, Rehabilitación y Medicina Física</p>
                <p>Av. Paulino N. Martí #1206, esq. Pozo Blanco, Ags.</p>
              </div>
            </div>

            {/* Info Paciente y Aseguradora */}
            <div className="bg-zinc-50 p-4 rounded border border-zinc-200 mb-6 text-center text-xs">
              <div>
                <span className="font-bold text-zinc-500">Px: </span>
                <span className="font-bold text-umi-blue uppercase">{pacienteSeleccionado?.nombre_completo || "_________________________________"}</span>
                <span className="mx-3 text-zinc-300">|</span>
                <span className="font-bold text-zinc-500">Folio: </span>
                <span className="font-mono text-zinc-700">{pacienteSeleccionado?.folio || "___________"}</span>
              </div>
              <div className="mt-2">
                <span className="font-bold text-zinc-500">Aseguradora: </span>
                <span className="font-bold text-zinc-800 uppercase">{aseguradora || "_________________________________"}</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest text-umi-blue border-b-2 border-orange-500 pb-1 inline-block">Bitácora de Asistencia</h2>
              <p className="text-[10px] text-zinc-500 mt-2">Control cronológico y validación de sesiones ambulatorias de medicina física</p>
            </div>

            {/* TABLA DEL DOCUMENTO (CUADRÍCULA PARA LLENAR A MANO O DIGITAL) */}
            <table className="w-full text-xs text-left mb-8 border-collapse border border-zinc-400">
              <thead className="bg-umi-blue text-white font-bold text-[10px] uppercase text-center" style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                <tr>
                  <th className="py-3 px-2 w-[15%] border border-zinc-400">Fecha</th>
                  <th className="py-3 px-4 w-[45%] border border-zinc-400 text-left">Tipo de Terapia Aplicada</th>
                  <th className="py-3 px-2 w-[20%] border border-zinc-400">Firma Paciente</th>
                  <th className="py-3 px-2 w-[20%] border border-zinc-400">Firma Fisio</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="py-10 text-center border border-zinc-400"><Loader2 className="h-6 w-6 animate-spin mx-auto text-umi-blue" /></td></tr>
                ) : (
                  <>
                    {sesiones.map((sesion) => (
                      <tr key={sesion.id} className="border border-zinc-400">
                        <td className="py-4 px-2 text-center font-bold text-zinc-700 border border-zinc-400">
                          {new Date(sesion.fecha + "T00:00:00").toLocaleDateString('es-MX', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                        </td>
                        <td className="py-4 px-4 text-zinc-800 border border-zinc-400">{sesion.terapia}</td>
                        <td className="py-2 px-2 text-center align-middle h-16 border border-zinc-400">
                          {sesion.firma_paciente ? (
                            <div className="relative w-full h-12 flex justify-center items-center">
                              <img src={sesion.firma_paciente} alt="Firma Px" className="max-h-full object-contain mix-blend-multiply" />
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setModalFirma({tipo: 'paciente', sesionId: sesion.id})} className="text-[10px] h-7 text-orange-600 border-orange-200 hover:bg-orange-50 print:hidden mx-auto flex">
                              <Edit3 className="h-3 w-3 mr-1" /> Firmar
                            </Button>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center align-middle h-16 border border-zinc-400">
                          {sesion.sello_fisio ? (
                            <div className="flex flex-col items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-umi-blue opacity-50 mb-1 print:opacity-100" />
                              <span className="text-[8px] font-bold text-umi-blue leading-tight">{sesion.sello_fisio}</span>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setModalFirma({tipo: 'fisio', sesionId: sesion.id})} className="text-[10px] h-7 text-umi-blue border-umi-blue/30 hover:bg-blue-50 print:hidden mx-auto flex">
                              <Lock className="h-3 w-3 mr-1" /> Sellar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {/* FILAS VACÍAS COMPLETAMENTE LIMPIAS PARA LLENAR A MANO */}
                    {Array.from({ length: Math.max(0, 10 - sesiones.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="border border-zinc-400">
                        <td className="py-6 px-2 border border-zinc-400"></td>
                        <td className="py-6 px-4 border border-zinc-400"></td>
                        <td className="py-6 px-2 border border-zinc-400"></td>
                        <td className="py-6 px-2 border border-zinc-400"></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-4 border-t border-zinc-300 pt-2">
              <p className="flex items-center gap-1"><span className="text-red-500 font-bold border border-red-500 rounded-full w-3 h-3 flex items-center justify-center text-[7px]">R</span> La firma avala la recepción integral del protocolo kinesiológico.</p>
              <p>Página 1 de 1</p>
            </div>

            {/* Footer Fijo */}
            <div className="absolute bottom-12 left-0 w-full text-center mt-12">
              <p className="font-bold text-xs text-zinc-800">Fisioterapeuta Titular: {fisioActual?.nombre_completo || "_____________________________"}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Cédula Profesional: {fisioActual?.cedula || "N/A"}</p>
              <p className="text-[8px] text-zinc-400 mt-1 tracking-widest uppercase">DOCUMENTO MÉDICO DE CONTROL INTERNO Y SEGUIMIENTO TERAPÉUTICO.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}