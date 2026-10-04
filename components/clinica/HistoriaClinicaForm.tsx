"use client";

import { useRef, useState, useEffect } from "react";
import { Save, Eraser, Printer, Lock, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";

// --- LISTAS DE OPCIONES ---
const AHF_LIST = [
  "Cáncer", "Hipertensión / Cardiopatías", "Diabetes / Metabólicas", 
  "Artritis", "Lupus", "Hiper / Hipotiroidismo", "Asma / Respiratorias / EPOC", 
  "Distrofia", "Esclerosis Múltiple / ELA", "Parkinson", "Marfan", "Steinert", "Huntington"
];

const APP_LIST = [
  "Cirugías", "Fracturas", "Esguinces", "Desgarres", 
  "Luxaciones", "Enf. Crónico Degenerativas", "Alergias", "Transfusiones"
];

const ESCALAS_LIST = [
  "EVA", "Daniels", "Braden", "Tampa Scale", "Barthel", "FIM", "SF-36", 
  "Pruebas de Esfuerzo", "Caminata 6 min", "RM", "Escala de Berg", 
  "Tinetti", "Ashworth", "Campbell", "Tardieu", "Denver"
];

// --- DICCIONARIO DE UNIDADES / EQUIVALENCIAS ---
const ESCALAS_HINTS: Record<string, string> = {
  "Braden": "pts (Riesgo úlceras)",
  "Tampa Scale": "pts / 68",
  "Barthel": "pts / 100",
  "FIM": "pts / 126",
  "SF-36": "puntos",
  "Pruebas de Esfuerzo": "BPM / METs",
  "Caminata 6 min": "metros",
  "RM": "kg / lbs",
  "Escala de Berg": "pts / 56",
  "Tinetti": "pts / 28",
  "Ashworth": "Grado (0-4)",
  "Campbell": "Grado (-3 a +3)",
  "Tardieu": "Grado (0-5)",
  "Denver": "Normal/Dudoso/Anormal"
};

type ItemDinamico = { nombre: string; valor: string };

export function HistoriaClinicaForm({ paciente }: { paciente: any }) {
  const sigPadPaciente = useRef<any>(null);
  const limpiarFirmaPaciente = () => sigPadPaciente.current?.clear();

  const [fechaHoy, setFechaHoy] = useState("");
  const [folioAuto, setFolioAuto] = useState("");
  const [pin, setPin] = useState("");
  const [fisioFirmado, setFisioFirmado] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  const [isGuardado, setIsGuardado] = useState(false);

  const [ahfItems, setAhfItems] = useState<ItemDinamico[]>([]);
  const [appItems, setAppItems] = useState<ItemDinamico[]>([]);
  const [escalaItems, setEscalaItems] = useState<ItemDinamico[]>([]);
  
  const [ahfSelect, setAhfSelect] = useState("");
  const [appSelect, setAppSelect] = useState("");
  const [escalaSelect, setEscalaSelect] = useState("");

  const fisioActual = { nombre: "Lic. Valeria Mendoza", cedula: "8492041-A", pinCorrecto: "1234" };

  useEffect(() => {
    const hoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    setFechaHoy(hoy);
    if (!paciente.folio || paciente.folio.includes("generará")) {
      const random = Math.floor(1000 + Math.random() * 9000);
      setFolioAuto(`PAC-${new Date().getFullYear()}-${random}`);
    } else {
      setFolioAuto(paciente.folio);
    }
  }, [paciente]);

  const agregarAhf = () => { if(ahfSelect) { setAhfItems([...ahfItems, {nombre: ahfSelect, valor: ""}]); setAhfSelect(""); } };
  const removerAhf = (nombre: string) => setAhfItems(ahfItems.filter(x => x.nombre !== nombre));
  const updateAhf = (nombre: string, valor: string) => setAhfItems(ahfItems.map(x => x.nombre === nombre ? {...x, valor} : x));

  const agregarApp = () => { if(appSelect) { setAppItems([...appItems, {nombre: appSelect, valor: ""}]); setAppSelect(""); } };
  const removerApp = (nombre: string) => setAppItems(appItems.filter(x => x.nombre !== nombre));
  const updateApp = (nombre: string, valor: string) => setAppItems(appItems.map(x => x.nombre === nombre ? {...x, valor} : x));

  const agregarEscala = () => { 
    if(escalaSelect) { 
      const valorInicial = escalaSelect === "EVA" ? "0" : "";
      setEscalaItems([...escalaItems, {nombre: escalaSelect, valor: valorInicial}]); 
      setEscalaSelect(""); 
    } 
  };
  const removerEscala = (nombre: string) => setEscalaItems(escalaItems.filter(x => x.nombre !== nombre));
  const updateEscala = (nombre: string, valor: string) => setEscalaItems(escalaItems.map(x => x.nombre === nombre ? {...x, valor} : x));

  const handleFirmaFisio = () => {
    if (pin === fisioActual.pinCorrecto) { setFisioFirmado(true); setErrorPin(false); } 
    else { setErrorPin(true); setPin(""); }
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fisioFirmado) { alert("El fisioterapeuta debe firmar con su PIN antes de guardar."); return; }
    setIsGuardado(true);
  };

  const handlePrint = () => window.print();

  const printInputStyle = "print:border-b print:border-x-0 print:border-t-0 print:border-zinc-300 print:bg-transparent print:p-0 print:h-auto print:text-xs print:font-medium disabled:opacity-100 print:rounded-none";
  const printLabelStyle = "print:text-[10px] print:text-zinc-500 print:mb-0";
  const printSectionStyle = "bg-white p-6 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none print:mt-4 print:break-inside-avoid";
  const sectionTitleStyle = "text-lg font-bold text-umi-blue mb-4 border-b border-zinc-200 pb-2 print:text-sm print:mb-2 print:border-b-2 print:border-umi-blue";

  return (
    <form onSubmit={handleGuardar} className="space-y-6 pb-10 bg-white print:m-0 print:p-0">
      
      {/* MEMBRETE PARA PDF */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-umi-blue pb-4 mb-2">
        <div className="flex justify-between items-center w-full">
          <div className="relative h-14 w-32"><Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain object-left" priority /></div>
          <div className="text-right text-[10px] text-zinc-600">
            <p className="font-bold text-umi-blue text-xs">UNIDAD MÉDICA INTERDISCIPLINARIA</p>
            <p>Clínica de Fisioterapia, Rehabilitación y Medicina Física</p>
            <p>Av. Insurgentes Sur 1450, Col. Actipan, CDMX | Tel: (55) 5684-2910</p>
          </div>
        </div>
        <h1 className="text-base font-bold mt-2 uppercase text-center bg-zinc-100 w-full py-1 text-umi-blue">
          Historia Clínica Fisioterapéutica
        </h1>
      </div>

      {/* SECCIÓN 1: FICHA DE IDENTIFICACIÓN */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>1. Ficha de Identificación</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Folio</Label><Input readOnly value={folioAuto} className={`bg-zinc-100 font-bold text-umi-blue ${printInputStyle}`} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Fecha de Elaboración</Label><Input readOnly value={fechaHoy} className={`bg-zinc-100 ${printInputStyle}`} /></div>
          <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Nombre Completo</Label><Input disabled={isGuardado} defaultValue={paciente.nombre_completo} className={printInputStyle} /></div>
          
          <div className="space-y-1"><Label className={printLabelStyle}>Edad</Label><Input disabled={isGuardado} defaultValue={paciente.edad} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Sexo</Label><Input disabled={isGuardado} defaultValue={paciente.genero} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Ocupación</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Estado Civil</Label><Input disabled={isGuardado} className={printInputStyle} /></div>

          <div className="space-y-1"><Label className={printLabelStyle}>Teléfono</Label><Input disabled={isGuardado} defaultValue={paciente.telefono} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Correo</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>No. Seguridad Social</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Contacto de Emergencia</Label><Input disabled={isGuardado} placeholder="Nombre y Tel" className={printInputStyle} /></div>

          <div className="space-y-1"><Label className={printLabelStyle}>Señas Distintivas</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Tipo de Sangre</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Alergias</Label><Input disabled={isGuardado} className={`${printInputStyle} border-red-200`} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Religión</Label><Input disabled={isGuardado} className={printInputStyle} /></div>

          <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Originario / Domicilio</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Escolaridad</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Servicio</Label><Input disabled={isGuardado} defaultValue="Fisioterapia" className={printInputStyle} /></div>

          <div className="space-y-1"><Label className={printLabelStyle}>Tipo de Interrogatorio</Label>
            <select disabled={isGuardado} className={`flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 ${printInputStyle}`}>
              <option>Directo</option><option>Indirecto</option><option>Mixto</option><option>Urgencia</option>
            </select>
          </div>
          <div className="space-y-1"><Label className={printLabelStyle}>Referido de</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Dx Médico de Envío</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
        </div>
      </div>

      {/* SECCIÓN 2 y 3: AHF Y APP (Listas Dinámicas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:mt-4">
        <div className={printSectionStyle.replace("mt-4","")}>
          <h2 className={sectionTitleStyle}>2. Antecedentes Heredofamiliares</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={ahfSelect} onChange={e => setAhfSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                <option value="">Añadir antecedente...</option>
                {AHF_LIST.filter(item => !ahfItems.some(x => x.nombre === item)).map(item => <option key={item} value={item}>{item}</option>)}
              </select>
              <Button type="button" onClick={agregarAhf} variant="outline" size="icon" className="shrink-0"><Plus className="h-4 w-4 text-umi-blue" /></Button>
            </div>
          )}
          <div className="space-y-2">
            {ahfItems.length === 0 && <p className="text-xs text-zinc-400 italic">Ningún antecedente registrado.</p>}
            {ahfItems.map((item) => (
              <div key={item.nombre} className="flex items-center gap-2">
                <Label className={`w-2/5 text-xs font-semibold text-zinc-700 print:text-[10px]`}>{item.nombre}</Label>
                <Input disabled={isGuardado} placeholder="Parentesco..." value={item.valor} onChange={e => updateAhf(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => removerAhf(item.nombre)} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 print:hidden shrink-0"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className={printSectionStyle.replace("mt-4","")}>
          <h2 className={sectionTitleStyle}>3. Personales Patológicos</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={appSelect} onChange={e => setAppSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
                <option value="">Añadir antecedente...</option>
                {APP_LIST.filter(item => !appItems.some(x => x.nombre === item)).map(item => <option key={item} value={item}>{item}</option>)}
              </select>
              <Button type="button" onClick={agregarApp} variant="outline" size="icon" className="shrink-0"><Plus className="h-4 w-4 text-umi-blue" /></Button>
            </div>
          )}
          <div className="space-y-2">
            {appItems.length === 0 && <p className="text-xs text-zinc-400 italic">Ningún antecedente registrado.</p>}
            {appItems.map((item) => (
              <div key={item.nombre} className="flex items-center gap-2">
                <Label className={`w-2/5 text-xs font-semibold text-zinc-700 print:text-[10px]`}>{item.nombre}</Label>
                <Input disabled={isGuardado} placeholder="Detalles..." value={item.valor} onChange={e => updateApp(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => removerApp(item.nombre)} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 print:hidden shrink-0"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: APNP */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>4. Personales No Patológicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
          <div className="space-y-1"><Label className={printLabelStyle}>¿Fumas? (Cant/Día)</Label><Input disabled={isGuardado} placeholder="Ej. Sí, 5 al día" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>¿Tomas alcohol? (Frecuencia)</Label><Input disabled={isGuardado} placeholder="Ej. Fines de semana" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Otras sustancias (Frecuencia)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Horas de sueño constante</Label><Input disabled={isGuardado} type="number" placeholder="Horas" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>¿Ejercicio/Deporte? (Cuál y Frec)</Label><Input disabled={isGuardado} placeholder="Ej. Gym 3x semana" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Vacunas recientes</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Comidas al día y listado cotidiano</Label><Input disabled={isGuardado} placeholder="Ej. 3 veces. Huevos, pollo..." className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Medicamentos / Suplementos</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1 md:col-span-3 print:col-span-3"><Label className={printLabelStyle}>Vivienda y Servicios (Luz, agua, gas, internet)</Label><Input disabled={isGuardado} placeholder="Cuenta con todos los servicios..." className={printInputStyle} /></div>
        </div>
      </div>

      {/* SECCIÓN 5: PADECIMIENTO E INTERROGATORIO */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>5. Padecimiento Actual e Interrogatorio por Sistemas</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="space-y-1">
            <Label className={`font-semibold text-umi-blue ${printLabelStyle}`}>Padecimiento Actual</Label>
            <Textarea disabled={isGuardado} rows={3} className={`${printInputStyle} print:resize-none`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
            <div className="space-y-1"><Label className={printLabelStyle}>Gastrointestinal (dolor, reflujo, colitis...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Respiratorios (vías superiores, inferiores...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Nefrourinarios (dolor, color, dificultad...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Circulatorios (pesadez, hinchazón, úlceras...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Neurológico (sensibilidad, fuerza...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Muscular (dolor, debilidad...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Ósteoarticular (sonido, restricción...)</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 6: EXPLORACIÓN FÍSICA Y ESCALAS INTERACTIVAS */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>6. Exploración Física y Pruebas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:grid-cols-4 print:gap-2 print:mb-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Tensión Arterial</Label><Input disabled={isGuardado} placeholder="120/80" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Frec. Cardiaca</Label><Input disabled={isGuardado} placeholder="lpm" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Frec. Respiratoria</Label><Input disabled={isGuardado} placeholder="rpm" className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Temp / SpO2</Label><Input disabled={isGuardado} placeholder="°C / %" className={printInputStyle} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3 print:gap-2 print:mb-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Examen Manual Muscular</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Goniometría</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Antropometría</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
        </div>

        {/* ESCALAS DINÁMICAS E INTERACTIVAS */}
        <Label className={`font-semibold text-umi-teal block mb-2 ${printLabelStyle}`}>Escalas Aplicadas</Label>
        
        {!isGuardado && (
          <div className="flex gap-2 mb-4 max-w-md print:hidden">
            <select value={escalaSelect} onChange={e => setEscalaSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm">
              <option value="">Añadir escala interactiva...</option>
              {ESCALAS_LIST.filter(item => !escalaItems.some(x => x.nombre === item)).map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <Button type="button" onClick={agregarEscala} variant="outline" size="icon" className="shrink-0"><Plus className="h-4 w-4 text-umi-blue" /></Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 print:grid-cols-2 print:gap-x-4 print:gap-y-2">
          {escalaItems.length === 0 && <p className="text-xs text-zinc-400 italic col-span-2">Ninguna escala registrada.</p>}
          
          {escalaItems.map((item) => (
             <div key={item.nombre} className="flex items-center gap-3">
               <Label className="w-1/3 text-xs font-bold text-zinc-700 print:text-[10px] truncate">{item.nombre}</Label>
               
               {item.nombre === "EVA" ? (
                  <>
                    <div className="flex-1 flex items-center gap-3 print:hidden">
                      <input 
                        type="range" min="0" max="10" disabled={isGuardado}
                        value={item.valor || "0"} onChange={e => updateEscala(item.nombre, e.target.value)} 
                        className="w-full accent-orange-500" 
                      />
                      <span className={`font-bold w-6 text-center ${parseInt(item.valor) > 6 ? 'text-red-500' : parseInt(item.valor) > 3 ? 'text-orange-500' : 'text-green-500'}`}>{item.valor || "0"}</span>
                    </div>
                    <div className="hidden print:block flex-1 text-[10px] border-b border-zinc-300">{item.valor || "0"} / 10</div>
                  </>
               ) : item.nombre === "Daniels" ? (
                  <>
                    <select disabled={isGuardado} value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className={`flex-1 h-8 text-[11px] rounded-md border border-zinc-200 px-2 print:hidden`}>
                      <option value="">Seleccionar grado...</option>
                      <option value="0 - Ausencia de contracción">0 - Ausencia de contracción</option>
                      <option value="1 - Contracción visible/palpable">1 - Contracción visible/palpable</option>
                      <option value="2 - Mov. sin gravedad">2 - Movimiento sin gravedad</option>
                      <option value="3 - Mov. contra gravedad">3 - Movimiento contra gravedad</option>
                      <option value="4 - Resistencia moderada">4 - Resistencia moderada</option>
                      <option value="5 - Resistencia máxima (Normal)">5 - Resistencia máxima (Normal)</option>
                    </select>
                    <div className="hidden print:block flex-1 text-[10px] border-b border-zinc-300">{item.valor || "No evaluado"}</div>
                  </>
               ) : (
                  // Render para el resto de las escalas
                  <div className="flex-1 flex items-center gap-2">
                    <Input disabled={isGuardado} placeholder="Puntaje/resultado" value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                    {/* Aquí se muestra la equivalencia/unidad obtenida del diccionario */}
                    <span className="text-[10px] text-zinc-400 shrink-0">{ESCALAS_HINTS[item.nombre] || ""}</span>
                  </div>
               )}

               {!isGuardado && <Button type="button" onClick={() => removerEscala(item.nombre)} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 print:hidden shrink-0"><X className="h-4 w-4"/></Button>}
             </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 7: Dx y Tx */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>7. Diagnóstico y Tratamiento</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Resultados previos o actuales de estudios</Label><Input disabled={isGuardado} className={printInputStyle} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
            <div className="space-y-1"><Label className={printLabelStyle}>Terapéutica: Medicamento (Vía, Dosis, Frec)</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Terapéutica: Fisioterapia (Técnica, Dosis, Frec)</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          </div>
          <Label className={`font-semibold text-umi-blue block pt-2 ${printLabelStyle}`}>Diagnóstico Funcional / Problemas Clínicos</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            <div className="space-y-1"><Label className={printLabelStyle}>Estructura corporal y función vs déficit</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Actividad vs limitación en actividad</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Participación vs restricción en participación</Label><Textarea disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          </div>
          <div className="space-y-1"><Label className={`font-semibold text-umi-teal ${printLabelStyle}`}>Pronóstico y Plan de Tratamiento</Label><Textarea disabled={isGuardado} rows={3} className={`${printInputStyle} print:resize-none`} /></div>
        </div>
      </div>

      {/* SECCIÓN FIRMAS */}
      <div className={printSectionStyle}>
        <h2 className={sectionTitleStyle}>Firmas y Autorizaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 print:gap-4 print:mt-2">
          <div className="flex flex-col items-center space-y-2">
            <Label className="font-bold text-zinc-700 print:text-[10px]">Firma del Paciente / Tutor</Label>
            <div className={`border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50 overflow-hidden w-full max-w-[300px] print:border-solid print:border-b-2 print:border-t-0 print:border-x-0 print:bg-transparent print:rounded-none ${isGuardado ? 'pointer-events-none' : ''}`}>
              <SignatureCanvas ref={sigPadPaciente} penColor="#0f172a" canvasProps={{className: 'w-full h-20 cursor-crosshair'}} />
            </div>
            {!isGuardado && (
              <div className="flex justify-between w-full max-w-[300px] items-center print:hidden">
                <span className="text-[10px] text-zinc-400">Trace su firma</span>
                <Button type="button" variant="ghost" size="sm" onClick={limpiarFirmaPaciente} className="text-red-500 h-6 text-xs p-0"><Eraser className="h-3 w-3 mr-1" /> Limpiar</Button>
              </div>
            )}
            <div className="w-full max-w-[300px] text-center mt-2 hidden print:block"><div className="text-[9px] uppercase font-medium">{paciente.nombre_completo || "Nombre del Paciente"}</div></div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Label className="font-bold text-umi-blue print:text-[10px]">Fisioterapeuta Titular</Label>
            {fisioFirmado ? (
              <div className="w-full max-w-[300px] h-20 border-2 border-umi-blue bg-indigo-50/50 rounded-lg flex flex-col items-center justify-center p-2 relative print:border-none print:bg-transparent print:h-auto">
                <CheckCircle2 className="h-5 w-5 text-green-500 mb-1 print:hidden" />
                <span className="font-bold text-umi-blue text-sm print:text-xs">{fisioActual.nombre}</span>
                <span className="text-xs text-zinc-600 print:text-[10px]">Cédula Prof: {fisioActual.cedula}</span>
                <span className="text-[9px] text-zinc-400 mt-1">Validado criptográficamente por PIN</span>
              </div>
            ) : (
              <div className="w-full max-w-[300px] h-20 border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-lg flex flex-col items-center justify-center p-2 print:hidden">
                <div className="flex gap-2">
                  <Input type="password" maxLength={4} placeholder="PIN" className={`w-20 text-center tracking-widest h-8 ${errorPin ? "border-red-500 bg-red-50" : ""}`} value={pin} onChange={(e) => setPin(e.target.value)}/>
                  <Button type="button" size="sm" onClick={handleFirmaFisio} className="bg-umi-blue text-white h-8">Firmar</Button>
                </div>
                {errorPin && <span className="text-[10px] text-red-500 mt-1">PIN incorrecto</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACCIONES POST-GUARDADO */}
      <div className="print:hidden mt-8 border-t border-zinc-200 pt-6">
        {isGuardado ? (
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="h-6 w-6" />
              <div><p className="font-bold">Expediente Guardado</p><p className="text-xs opacity-80">NOM-004 garantizado.</p></div>
            </div>
            <Button type="button" onClick={handlePrint} className="bg-white text-green-800 border border-green-300 hover:bg-green-100">
              <Printer className="mr-2 h-4 w-4" /> Exportar PDF Membretado
            </Button>
          </div>
        ) : (
          <div className="flex justify-end sticky bottom-6 z-10">
            <Button type="submit" className="bg-umi-blue hover:bg-indigo-900 text-white shadow-xl px-8 py-6 text-lg rounded-full">
              <Save className="mr-2 h-5 w-5" /> Cerrar y Guardar Historia Clínica
            </Button>
          </div>
        )}
      </div>

    </form>
  );
}