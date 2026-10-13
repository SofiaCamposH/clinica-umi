"use client";

import { useRef, useState, useEffect } from "react";
import { Save, Eraser, Printer, Lock, CheckCircle2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const AHF_LIST = ["Cáncer", "Hipertensión / Cardiopatías", "Diabetes / Metabólicas", "Artritis", "Lupus", "Hiper / Hipotiroidismo", "Asma / Respiratorias / EPOC", "Distrofia", "Esclerosis Múltiple / ELA", "Parkinson", "Marfan", "Steinert", "Huntington"];
const APP_LIST = ["Cirugías", "Fracturas", "Esguinces", "Desgarres", "Luxaciones", "Enf. Crónico Degenerativas", "Alergias", "Transfusiones"];
const ESCALAS_LIST = ["EVA", "Daniels", "Braden", "Tampa Scale", "Barthel", "FIM", "SF-36", "Pruebas de Esfuerzo", "Caminata 6 min", "RM", "Escala de Berg", "Tinetti", "Ashworth", "Campbell", "Tardieu", "Denver"];
const ESCALAS_HINTS: Record<string, string> = { "Braden": "pts", "Tampa Scale": "pts/68", "Barthel": "pts/100", "FIM": "pts/126", "SF-36": "pts", "Pruebas de Esfuerzo": "METs", "Caminata 6 min": "mts", "RM": "kg", "Escala de Berg": "pts/56", "Tinetti": "pts/28", "Ashworth": "Grado 0-4", "Campbell": "Grado -3 a 3", "Tardieu": "Grado 0-5", "Denver": "Normal/Anormal" };

type ItemDinamico = { nombre: string; valor: string };

export function HistoriaClinicaForm({ paciente }: { paciente: any }) {
  const supabase = createClient();
  const sigPadPaciente = useRef<any>(null);
  const limpiarFirmaPaciente = () => sigPadPaciente.current?.clear();

  const [fechaHoy, setFechaHoy] = useState("");
  const [folioAuto, setFolioAuto] = useState("");
  const [pin, setPin] = useState("");
  const [fisioFirmado, setFisioFirmado] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  
  // Estados de Guardado Real
  const [isGuardando, setIsGuardando] = useState(false);
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
    if (!paciente?.folio || paciente.folio.includes("generará")) {
      setFolioAuto(`PAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setFolioAuto(paciente.folio);
    }
  }, [paciente]);

  const agregarAhf = () => { if(ahfSelect) { setAhfItems([...ahfItems, {nombre: ahfSelect, valor: ""}]); setAhfSelect(""); } };
  const updateAhf = (nombre: string, valor: string) => setAhfItems(ahfItems.map(x => x.nombre === nombre ? {...x, valor} : x));
  
  const agregarApp = () => { if(appSelect) { setAppItems([...appItems, {nombre: appSelect, valor: ""}]); setAppSelect(""); } };
  const updateApp = (nombre: string, valor: string) => setAppItems(appItems.map(x => x.nombre === nombre ? {...x, valor} : x));

  const agregarEscala = () => { 
    if(escalaSelect) { 
      setEscalaItems([...escalaItems, {nombre: escalaSelect, valor: escalaSelect === "EVA" ? "0" : ""}]); 
      setEscalaSelect(""); 
    } 
  };
  const updateEscala = (nombre: string, valor: string) => setEscalaItems(escalaItems.map(x => x.nombre === nombre ? {...x, valor} : x));

  const handleFirmaFisio = () => {
    if (pin === fisioActual.pinCorrecto) { setFisioFirmado(true); setErrorPin(false); } 
    else { setErrorPin(true); setPin(""); }
  };

  // --- LÓGICA DE GUARDADO REAL A SUPABASE ---
  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fisioFirmado) { alert("El fisioterapeuta debe firmar con su PIN antes de guardar."); return; }
    
    setIsGuardando(true);

    // 1. Recolectar todos los inputs nativos que tengan la propiedad 'name'
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 2. Empaquetar todo el documento clínico en un JSON
    const historiaJson = {
      ...data,
      antecedentes_familiares: ahfItems,
      antecedentes_personales: appItems,
      escalas_aplicadas: escalaItems,
      fecha_elaboracion: fechaHoy
    };

    // 3. Determinar si es un paciente existente (Update) o uno nuevo (Insert)
    if (paciente && paciente.id) {
      const { error } = await supabase
        .from('pacientes')
        .update({ historia_clinica: historiaJson })
        .eq('id', paciente.id);

      if (error) alert("Error al guardar: " + error.message);
      else setIsGuardado(true);

    } else {
      // Es un paciente completamente nuevo (Desde /nueva-historia)
      const { error } = await supabase
        .from('pacientes')
        .insert([{
          folio: folioAuto,
          nombre_completo: data.nombre_completo,
          edad: parseInt(data.edad as string) || 0,
          genero: data.genero,
          telefono: data.telefono,
          estatus_clinico: 'En valoración',
          historia_clinica: historiaJson
        }]);

      if (error) alert("Error al guardar: " + error.message);
      else setIsGuardado(true);
    }

    setIsGuardando(false);
  };

  const handlePrint = () => window.print();

  const printInputStyle = "print:border-b print:border-x-0 print:border-t-0 print:border-zinc-300 print:bg-transparent print:p-0 print:h-auto print:text-xs print:font-medium disabled:opacity-100 print:rounded-none";
  const printLabelStyle = "print:text-[10px] print:text-zinc-500 print:mb-0";
  const printSectionStyle = "bg-white p-6 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none print:mt-4 print:break-inside-avoid";

  return (
    <form onSubmit={handleGuardar} className="space-y-6 pb-10 bg-white print:m-0 print:p-0">
      
      {/* MEMBRETE PDF */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-umi-blue pb-4 mb-2">
        <div className="flex justify-between items-center w-full">
          <div className="relative h-14 w-32"><Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain object-left" priority /></div>
          <div className="text-right text-[10px] text-zinc-600">
            <p className="font-bold text-umi-blue text-xs">UNIDAD MÉDICA INTERDISCIPLINARIA</p>
            <p>Clínica de Fisioterapia y Rehabilitación | Av. Insurgentes Sur 1450, CDMX</p>
          </div>
        </div>
        <h1 className="text-base font-bold mt-2 uppercase text-center bg-zinc-100 w-full py-1 text-umi-blue">Historia Clínica Fisioterapéutica</h1>
      </div>

      {/* 1. FICHA DE IDENTIFICACIÓN */}
      <div className={printSectionStyle}>
        <div className="mb-6 bg-umi-blue/5 p-4 rounded-xl border border-umi-blue/10 print:bg-transparent print:border-none print:p-0 print:mb-4 print:border-b print:border-zinc-300 print:rounded-none">
          <Label className="text-umi-blue font-bold uppercase tracking-wider text-xs print:text-[10px]">Nombre Completo del Paciente</Label>
          <Input name="nombre_completo" required disabled={isGuardado} defaultValue={paciente?.nombre_completo} placeholder="Ej. Ana Pérez Gómez" className="text-2xl md:text-3xl font-black text-zinc-900 border-none bg-transparent shadow-none px-0 h-12 focus-visible:ring-0 print:text-xl print:h-auto print:p-0 mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Folio</Label><Input readOnly value={folioAuto} className={`bg-zinc-100 font-bold text-umi-blue ${printInputStyle}`} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Fecha</Label><Input readOnly value={fechaHoy} className={`bg-zinc-100 ${printInputStyle}`} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Edad</Label><Input name="edad" disabled={isGuardado} defaultValue={paciente?.edad} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Sexo</Label><Input name="genero" disabled={isGuardado} defaultValue={paciente?.genero} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Ocupación</Label><Input name="ocupacion" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Estado Civil</Label><Input name="estado_civil" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Teléfono</Label><Input name="telefono" disabled={isGuardado} defaultValue={paciente?.telefono} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Correo</Label><Input name="correo" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>NSS</Label><Input name="nss" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Emergencia</Label><Input name="contacto_emergencia" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Señas / Sangre</Label><Input name="senas_sangre" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Alergias</Label><Input name="alergias" disabled={isGuardado} className={`${printInputStyle} border-red-200`} /></div>
          <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Domicilio</Label><Input name="domicilio" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Tipo Interrogatorio</Label><Input name="tipo_interrogatorio" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Dx Médico</Label><Input name="dx_medico" disabled={isGuardado} className={printInputStyle} /></div>
        </div>
      </div>

      {/* 2 Y 3. AHF Y APP (Listas Dinámicas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:mt-4">
        <div className={printSectionStyle.replace("mt-4","")}>
          <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">2. Antecedentes Familiares</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={ahfSelect} onChange={e => setAhfSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm"><option value="">Añadir...</option>{AHF_LIST.filter(i => !ahfItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}</select>
              <Button type="button" onClick={agregarAhf} variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
            </div>
          )}
          <div className="space-y-2">
            {ahfItems.map((item) => (
              <div key={item.nombre} className="flex gap-2 items-center">
                <Label className="w-2/5 text-xs font-bold">{item.nombre}</Label>
                <Input disabled={isGuardado} value={item.valor} onChange={e => updateAhf(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => setAhfItems(ahfItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="h-8 w-8 text-red-400 print:hidden"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className={printSectionStyle.replace("mt-4","")}>
          <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">3. Antecedentes Personales</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={appSelect} onChange={e => setAppSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm"><option value="">Añadir...</option>{APP_LIST.filter(i => !appItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}</select>
              <Button type="button" onClick={agregarApp} variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
            </div>
          )}
          <div className="space-y-2">
            {appItems.map((item) => (
              <div key={item.nombre} className="flex gap-2 items-center">
                <Label className="w-2/5 text-xs font-bold">{item.nombre}</Label>
                <Input disabled={isGuardado} value={item.valor} onChange={e => updateApp(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => setAppItems(appItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="h-8 w-8 text-red-400 print:hidden"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. APNP */}
      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">4. Estilo de Vida y APNP</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Fumas/Alcohol/Sustancias</Label><Input name="habitos_toxicos" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Sueño y Deporte</Label><Input name="sueno_deporte" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Comidas al día</Label><Input name="dieta" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1 md:col-span-3 print:col-span-3"><Label className={printLabelStyle}>Vivienda y Servicios Generales</Label><Input name="vivienda" disabled={isGuardado} className={printInputStyle} /></div>
        </div>
      </div>

      {/* 5. INTERROGATORIO */}
      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">5. Padecimiento Actual e Interrogatorio</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="space-y-1"><Label className={`font-bold text-umi-blue ${printLabelStyle}`}>Padecimiento Actual</Label><Textarea name="padecimiento_actual" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
            <div className="space-y-1"><Label className={printLabelStyle}>Gastrointestinal / Respiratorio</Label><Input name="sist_gastro_resp" disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Neurológico / Circulatorio</Label><Input name="sist_neuro_circ" disabled={isGuardado} className={printInputStyle} /></div>
            <div className="space-y-1 md:col-span-2 print:col-span-2"><Label className={printLabelStyle}>Ósteoarticular / Muscular</Label><Input name="sist_osteo_muscular" disabled={isGuardado} className={printInputStyle} /></div>
          </div>
        </div>
      </div>

      {/* 6. EXPLORACIÓN Y ESCALAS */}
      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">6. Exploración Física y Escalas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:grid-cols-4 print:gap-2">
          <div className="space-y-1"><Label className={printLabelStyle}>TA</Label><Input name="signos_ta" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>FC</Label><Input name="signos_fc" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>FR</Label><Input name="signos_fr" disabled={isGuardado} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Temp/SpO2</Label><Input name="signos_temp" disabled={isGuardado} className={printInputStyle} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:grid-cols-2">
          <div className="space-y-1"><Label className={printLabelStyle}>Examen Muscular y Goniometría</Label><Textarea name="examen_fisico" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          <div className="space-y-1"><Label className={printLabelStyle}>Resultados de Estudios Previos</Label><Textarea name="estudios_previos" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
        </div>

        <Label className={`font-bold text-umi-teal block mb-2 ${printLabelStyle}`}>Escalas Aplicadas</Label>
        {!isGuardado && (
          <div className="flex gap-2 mb-4 max-w-md print:hidden">
            <select value={escalaSelect} onChange={e => setEscalaSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm"><option value="">Añadir escala...</option>{ESCALAS_LIST.filter(i => !escalaItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}</select>
            <Button type="button" onClick={agregarEscala} variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 print:grid-cols-2 print:gap-x-4">
          {escalaItems.map((item) => (
             <div key={item.nombre} className="flex items-center gap-3">
               <Label className="w-1/3 text-xs font-bold truncate">{item.nombre}</Label>
               {item.nombre === "EVA" ? (
                  <div className="flex-1 flex items-center gap-3"><input type="range" min="0" max="10" disabled={isGuardado} value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className="w-full print:hidden" /><span className="font-bold print:text-[10px]">{item.valor}/10</span></div>
               ) : (
                  <Input disabled={isGuardado} value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
               )}
               {!isGuardado && <Button type="button" onClick={() => setEscalaItems(escalaItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="text-red-400 print:hidden"><X className="h-4 w-4"/></Button>}
             </div>
          ))}
        </div>
      </div>

      {/* 7. Dx y Tx */}
      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">7. Diagnóstico y Plan</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            <div className="space-y-1"><Label className={printLabelStyle}>Dx: Estructura y Función</Label><Textarea name="dx_estructura" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Dx: Actividad</Label><Textarea name="dx_actividad" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
            <div className="space-y-1"><Label className={printLabelStyle}>Dx: Participación</Label><Textarea name="dx_participacion" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
          </div>
          <div className="space-y-1"><Label className={`font-bold text-umi-teal ${printLabelStyle}`}>Plan de Tratamiento y Pronóstico</Label><Textarea name="plan_tratamiento" disabled={isGuardado} rows={2} className={printInputStyle} /></div>
        </div>
      </div>

      {/* FIRMAS */}
      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-sm">Firmas y Autorizaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
          <div className="flex flex-col items-center space-y-2">
            <Label className="font-bold print:text-[10px]">Firma del Paciente / Tutor</Label>
            <div className={`border-2 border-dashed border-zinc-300 rounded-lg w-full max-w-[300px] print:border-solid print:border-b-2 print:border-t-0 print:border-x-0 print:rounded-none ${isGuardado ? 'pointer-events-none' : ''}`}><SignatureCanvas ref={sigPadPaciente} penColor="#0f172a" canvasProps={{className: 'w-full h-20'}} /></div>
            {!isGuardado && <Button type="button" variant="ghost" size="sm" onClick={limpiarFirmaPaciente} className="text-red-500 h-6 text-xs p-0 print:hidden"><Eraser className="h-3 w-3 mr-1" /> Limpiar</Button>}
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Label className="font-bold text-umi-blue print:text-[10px]">Fisioterapeuta Titular</Label>
            {fisioFirmado ? (
              <div className="w-full max-w-[300px] border-2 border-umi-blue bg-indigo-50/50 rounded-lg flex flex-col items-center justify-center p-2 print:border-none print:bg-transparent">
                <CheckCircle2 className="h-5 w-5 text-green-500 print:hidden" />
                <span className="font-bold text-umi-blue text-sm print:text-xs">{fisioActual.nombre}</span>
                <span className="text-xs text-zinc-600 print:text-[10px]">Cédula: {fisioActual.cedula}</span>
              </div>
            ) : (
              <div className="w-full max-w-[300px] border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-lg flex flex-col items-center p-2 print:hidden">
                <div className="flex gap-2">
                  <Input type="password" maxLength={4} placeholder="PIN" className={`w-20 text-center tracking-widest h-8 ${errorPin ? "border-red-500" : ""}`} value={pin} onChange={(e) => setPin(e.target.value)}/>
                  <Button type="button" size="sm" onClick={handleFirmaFisio} className="bg-umi-blue text-white h-8">Firmar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="print:hidden mt-8 border-t pt-6">
        {isGuardado ? (
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 text-green-800"><CheckCircle2 className="h-6 w-6" /><div><p className="font-bold">Guardado en Base de Datos</p></div></div>
            <Button type="button" onClick={handlePrint} className="bg-white text-green-800 border-green-300"><Printer className="mr-2 h-4 w-4" /> Exportar PDF</Button>
          </div>
        ) : (
          <div className="flex justify-end sticky bottom-6 z-10">
            <Button type="submit" disabled={isGuardando} className="bg-umi-blue hover:bg-indigo-900 text-white shadow-xl px-8 py-6 text-lg rounded-full">
              {isGuardando ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Cerrar y Guardar
            </Button>
          </div>
        )}
      </div>

    </form>
  );
}