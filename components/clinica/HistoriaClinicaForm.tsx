"use client";

import { useRef, useState, useEffect } from "react";
import { Save, Eraser, Printer, Lock, CheckCircle2, Plus, X, Loader2, Edit } from "lucide-react";
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

type ItemDinamico = { nombre: string; valor: string };

export function HistoriaClinicaForm({ paciente, fisioActual, folioSugerido }: { paciente: any; fisioActual: any; folioSugerido?: string }) {
  const supabase = createClient();
  const sigPadPaciente = useRef<any>(null);
  const limpiarFirmaPaciente = () => sigPadPaciente.current?.clear();

  const [fechaHoy, setFechaHoy] = useState("");
  const [folioAuto, setFolioAuto] = useState("");
  const [pin, setPin] = useState("");
  const [fisioFirmado, setFisioFirmado] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  
  const [isGuardando, setIsGuardando] = useState(false);
  const [isGuardado, setIsGuardado] = useState(false);

  const [ahfItems, setAhfItems] = useState<ItemDinamico[]>([]);
  const [appItems, setAppItems] = useState<ItemDinamico[]>([]);
  const [escalaItems, setEscalaItems] = useState<ItemDinamico[]>([]);
  const [ahfSelect, setAhfSelect] = useState("");
  const [appSelect, setAppSelect] = useState("");
  const [escalaSelect, setEscalaSelect] = useState("");

  // EXTRAEMOS LA HISTORIA CLÍNICA GUARDADA (Si existe)
  const hc = paciente?.historia_clinica || {};

  useEffect(() => {
    const hoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    setFechaHoy(hoy);
    
    if (!paciente?.folio || paciente.folio.includes("generará")) {
      setFolioAuto(folioSugerido || "PAC-0001");
    } else {
      setFolioAuto(paciente.folio);
    }

    // SI EL PACIENTE YA TIENE HISTORIA, CARGAMOS TODO Y BLOQUEAMOS EL FORMULARIO
    if (paciente?.historia_clinica) {
      setAhfItems(hc.antecedentes_familiares || []);
      setAppItems(hc.antecedentes_personales || []);
      setEscalaItems(hc.escalas_aplicadas || []);
      setIsGuardado(true);
      setFisioFirmado(true); // Mostramos el sello de quien lo guardó
    }
  }, [paciente, folioSugerido]);

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
    if (!fisioActual || !fisioActual.pin_firma) {
      alert("⚠️ No se pudo cargar tu NIP de seguridad desde Supabase. Intenta recargar la página.");
      return;
    }
    const pinIngresado = String(pin).trim();
    const pinGuardado = String(fisioActual.pin_firma).trim();

    if (pinIngresado === pinGuardado) { 
      setFisioFirmado(true); 
      setErrorPin(false); 
    } else { 
      setErrorPin(true); 
      setPin(""); 
    }
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fisioFirmado) { alert("El fisioterapeuta debe firmar con su PIN antes de guardar."); return; }
    
    setIsGuardando(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const historiaJson = {
      ...data,
      antecedentes_familiares: ahfItems,
      antecedentes_personales: appItems,
      escalas_aplicadas: escalaItems,
      fecha_elaboracion: hc.fecha_elaboracion || fechaHoy,
      elaborado_por: fisioActual?.nombre_completo,
      cedula_responsable: fisioActual?.cedula
    };

    if (paciente && paciente.id) {
      const { error } = await supabase.from('pacientes').update({ historia_clinica: historiaJson }).eq('id', paciente.id);
      if (error) alert("Error al guardar: " + error.message);
      else setIsGuardado(true);
    } else {
      const { error } = await supabase.from('pacientes').insert([{
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

  const printInputStyle = "print:border-b print:border-x-0 print:border-t-0 print:border-zinc-300 print:bg-transparent print:p-0 print:h-auto print:text-[11px] print:font-medium disabled:opacity-100 print:rounded-none print:text-zinc-900";
  const printLabelStyle = "print:text-[9px] print:text-zinc-500 print:mb-0";
  const printSectionStyle = "bg-white p-6 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none print:mb-4 print:break-inside-avoid";

  return (
    <form onSubmit={handleGuardar} className="space-y-8 pb-10 bg-white print:m-0 print:p-0 print:space-y-4">
      
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-umi-blue pb-3 mb-2">
        <div className="flex justify-between items-center w-full">
          <div className="relative h-12 w-28"><Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain object-left" priority /></div>
          <div className="text-right text-[9px] text-zinc-600">
            <p className="font-bold text-umi-blue text-[11px]">UNIDAD MÉDICA INTERDISCIPLINARIA</p>
            <p>Clínica de Fisioterapia, Rehabilitación y Medicina Física</p>
            <p>Av. Paulino N. Martí #1206, esq. Pozo Blanco, 20126 Aguascalientes, Ags.</p>
          </div>
        </div>
        <h1 className="text-xs font-bold mt-2 uppercase text-center bg-zinc-100 w-full py-1 text-umi-blue">Historia Clínica Fisioterapéutica</h1>
      </div>

      <div className={printSectionStyle}>
        <div className="mb-8 bg-umi-blue/5 p-6 rounded-xl border border-umi-blue/10 print:bg-transparent print:p-0 print:border-none print:mb-3">
          <Label className={`text-umi-blue font-bold uppercase tracking-wider text-sm mb-2 block print:text-[10px] print:mb-0`}>Nombre Completo del Paciente</Label>
          <Input 
            name="nombre_completo" required disabled={isGuardado} defaultValue={paciente?.nombre_completo} placeholder="Ej. Ana Pérez Gómez" 
            className="text-3xl font-black text-zinc-900 border-none bg-transparent shadow-none px-0 h-14 focus-visible:ring-0 placeholder:text-zinc-300 print:text-lg print:font-bold print:text-black print:h-auto print:border-b print:border-zinc-300 print:rounded-none disabled:opacity-100" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2">
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Folio</Label><Input readOnly value={folioAuto} className={`bg-zinc-50 font-bold text-umi-blue h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Fecha de Elaboración</Label><Input readOnly value={hc.fecha_elaboracion || fechaHoy} className={`bg-zinc-50 h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Edad</Label><Input name="edad" disabled={isGuardado} defaultValue={paciente?.edad} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Sexo</Label><Input name="genero" disabled={isGuardado} defaultValue={paciente?.genero} className={`h-9 ${printInputStyle}`} /></div>

          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Ocupación</Label><Input name="ocupacion" disabled={isGuardado} defaultValue={hc.ocupacion} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Estado Civil</Label><Input name="estado_civil" disabled={isGuardado} defaultValue={hc.estado_civil} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Teléfono</Label><Input name="telefono" disabled={isGuardado} defaultValue={paciente?.telefono} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Correo</Label><Input name="correo" disabled={isGuardado} defaultValue={hc.correo} className={`h-9 ${printInputStyle}`} /></div>

          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>No. Seguridad Social</Label><Input name="nss" disabled={isGuardado} defaultValue={hc.nss} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 md:col-span-2 print:col-span-2 print:space-y-0"><Label className={printLabelStyle}>Contacto de Emergencia (Nombre y Tel)</Label><Input name="contacto_emergencia" disabled={isGuardado} defaultValue={hc.contacto_emergencia} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Señas Distintivas</Label><Input name="senas_distintivas" disabled={isGuardado} defaultValue={hc.senas_distintivas} className={`h-9 ${printInputStyle}`} /></div>

          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Tipo de Sangre</Label><Input name="tipo_sangre" disabled={isGuardado} defaultValue={hc.tipo_sangre} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Alergias</Label><Input name="alergias" disabled={isGuardado} defaultValue={hc.alergias} className={`h-9 border-red-200 focus-visible:ring-red-500 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Religión</Label><Input name="religion" disabled={isGuardado} defaultValue={hc.religion} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Servicio</Label><Input name="servicio" disabled={isGuardado} defaultValue={hc.servicio} className={`h-9 ${printInputStyle}`} /></div>

          <div className="space-y-2 md:col-span-2 print:col-span-2 print:space-y-0"><Label className={printLabelStyle}>Originario/Domicilio</Label><Input name="domicilio" disabled={isGuardado} defaultValue={hc.domicilio} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Referido de</Label><Input name="referido" disabled={isGuardado} defaultValue={hc.referido} className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Escolaridad</Label><Input name="escolaridad" disabled={isGuardado} defaultValue={hc.escolaridad} className={`h-9 ${printInputStyle}`} /></div>

          <div className="space-y-2 print:space-y-0"><Label className={printLabelStyle}>Tipo de Interrogatorio</Label><Input name="tipo_interrogatorio" disabled={isGuardado} defaultValue={hc.tipo_interrogatorio} placeholder="Directo / Indirecto" className={`h-9 ${printInputStyle}`} /></div>
          <div className="space-y-2 md:col-span-3 print:col-span-3 print:space-y-0"><Label className={printLabelStyle}>Dx. Médico de Envío</Label><Input name="dx_medico" disabled={isGuardado} defaultValue={hc.dx_medico} className={`h-9 ${printInputStyle}`} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4">
        <div className={printSectionStyle}>
          <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">2. Antecedentes Heredofamiliares</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={ahfSelect} onChange={e => setAhfSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm bg-white">
                <option value="">Seleccionar padecimiento...</option>
                {AHF_LIST.filter(i => !ahfItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <Button type="button" onClick={agregarAhf} variant="outline" size="sm" className="shrink-0"><Plus className="h-4 w-4 mr-1"/> Añadir</Button>
            </div>
          )}
          <div className="space-y-2 print:space-y-1">
            {ahfItems.map((item) => (
              <div key={item.nombre} className="flex gap-2 items-center">
                <Label className="w-1/3 text-xs font-semibold print:text-[10px]">{item.nombre}</Label>
                <Input disabled={isGuardado} placeholder="Parentesco..." value={item.valor} onChange={e => updateAhf(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => setAhfItems(ahfItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="h-8 w-8 text-red-500 print:hidden"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className={printSectionStyle}>
          <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">3. Personales Patológicos</h2>
          {!isGuardado && (
            <div className="flex gap-2 mb-4 print:hidden">
              <select value={appSelect} onChange={e => setAppSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm bg-white">
                <option value="">Seleccionar padecimiento...</option>
                {APP_LIST.filter(i => !appItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <Button type="button" onClick={agregarApp} variant="outline" size="sm" className="shrink-0"><Plus className="h-4 w-4 mr-1"/> Añadir</Button>
            </div>
          )}
          <div className="space-y-2 print:space-y-1">
            {appItems.map((item) => (
              <div key={item.nombre} className="flex gap-2 items-center">
                <Label className="w-1/3 text-xs font-semibold print:text-[10px]">{item.nombre}</Label>
                <Input disabled={isGuardado} placeholder="Detalles..." value={item.valor} onChange={e => updateApp(item.nombre, e.target.value)} className={`flex-1 h-8 text-xs ${printInputStyle}`} />
                {!isGuardado && <Button type="button" onClick={() => setAppItems(appItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="h-8 w-8 text-red-500 print:hidden"><X className="h-4 w-4"/></Button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">4. Personales No Patológicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2">
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>¿Fumas? (Cant/Día)</Label><Input name="apnp_fuma" disabled={isGuardado} defaultValue={hc.apnp_fuma} placeholder="Ej. Sí, 5 al día" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>¿Tomas alcohol? (Frecuencia)</Label><Input name="apnp_alcohol" disabled={isGuardado} defaultValue={hc.apnp_alcohol} placeholder="Ej. Fines de semana" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Otras sustancias (Frecuencia)</Label><Input name="apnp_sustancias" disabled={isGuardado} defaultValue={hc.apnp_sustancias} className={`h-9 text-sm ${printInputStyle}`} /></div>
          
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Horas de sueño constante</Label><Input name="apnp_sueno" disabled={isGuardado} defaultValue={hc.apnp_sueno} placeholder="Horas" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>¿Ejercicio/Deporte? (Cuál y Frec)</Label><Input name="apnp_deporte" disabled={isGuardado} defaultValue={hc.apnp_deporte} placeholder="Ej. Gym 3x semana" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Vacunas recientes</Label><Input name="apnp_vacunas" disabled={isGuardado} defaultValue={hc.apnp_vacunas} className={`h-9 text-sm ${printInputStyle}`} /></div>
          
          <div className="space-y-1 md:col-span-2 print:col-span-2 print:space-y-0"><Label className={printLabelStyle}>Comidas al día y listado cotidiano</Label><Input name="apnp_comidas" disabled={isGuardado} defaultValue={hc.apnp_comidas} placeholder="Ej. 3 veces. Huevos, pollo..." className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Medicamentos/Suplementos</Label><Input name="apnp_medicamentos" disabled={isGuardado} defaultValue={hc.apnp_medicamentos} className={`h-9 text-sm ${printInputStyle}`} /></div>
          
          <div className="space-y-1 md:col-span-3 print:col-span-3 print:space-y-0"><Label className={printLabelStyle}>Vivienda y Servicios (Luz, agua, gas, internet)</Label><Input name="apnp_vivienda" disabled={isGuardado} defaultValue={hc.apnp_vivienda} placeholder="Cuenta con todos los servicios..." className={`h-9 text-sm ${printInputStyle}`} /></div>
        </div>
      </div>

      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">5. Padecimiento Actual e Interrogatorio por Sistemas</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="space-y-1 print:space-y-0">
            <Label className={printLabelStyle}>Padecimiento Actual</Label>
            <Textarea name="padecimiento_actual" disabled={isGuardado} defaultValue={hc.padecimiento_actual} rows={3} className={`text-sm ${printInputStyle}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2">
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Gastrointestinal (dolor, reflujo, colitis...)</Label><Input name="sist_gastro" disabled={isGuardado} defaultValue={hc.sist_gastro} className={`h-9 text-sm ${printInputStyle}`} /></div>
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Respiratorios (vías superiores, inferiores...)</Label><Input name="sist_resp" disabled={isGuardado} defaultValue={hc.sist_resp} className={`h-9 text-sm ${printInputStyle}`} /></div>
            
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Nefrourinarios (dolor, color, dificultad...)</Label><Input name="sist_nefro" disabled={isGuardado} defaultValue={hc.sist_nefro} className={`h-9 text-sm ${printInputStyle}`} /></div>
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Circulatorios (pesadez, hinchazón, úlceras...)</Label><Input name="sist_circ" disabled={isGuardado} defaultValue={hc.sist_circ} className={`h-9 text-sm ${printInputStyle}`} /></div>
            
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Neurológico (sensibilidad, fuerza...)</Label><Input name="sist_neuro" disabled={isGuardado} defaultValue={hc.sist_neuro} className={`h-9 text-sm ${printInputStyle}`} /></div>
            <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Muscular (dolor, debilidad...)</Label><Input name="sist_mus" disabled={isGuardado} defaultValue={hc.sist_mus} className={`h-9 text-sm ${printInputStyle}`} /></div>
            
            <div className="space-y-1 md:col-span-2 print:col-span-2 print:space-y-0"><Label className={printLabelStyle}>Ósteoarticular (sonido, restricción...)</Label><Input name="sist_osteo" disabled={isGuardado} defaultValue={hc.sist_osteo} className={`h-9 text-sm ${printInputStyle}`} /></div>
          </div>
        </div>
      </div>

      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">6. Exploración Física y Pruebas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-2">
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Tensión Arterial</Label><Input name="signos_ta" disabled={isGuardado} defaultValue={hc.signos_ta} placeholder="120/80" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Frec. Cardiaca</Label><Input name="signos_fc" disabled={isGuardado} defaultValue={hc.signos_fc} placeholder="lpm" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Frec. Respiratoria</Label><Input name="signos_fr" disabled={isGuardado} defaultValue={hc.signos_fr} placeholder="rpm" className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Temp/SpO2</Label><Input name="signos_temp" disabled={isGuardado} defaultValue={hc.signos_temp} placeholder="°C / %" className={`h-9 text-sm ${printInputStyle}`} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-2">
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Examen Manual Muscular</Label><Input name="examen_muscular" disabled={isGuardado} defaultValue={hc.examen_muscular} className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Goniometría</Label><Input name="goniometria" disabled={isGuardado} defaultValue={hc.goniometria} className={`h-9 text-sm ${printInputStyle}`} /></div>
          <div className="space-y-1 print:space-y-0"><Label className={printLabelStyle}>Antropometría</Label><Input name="antropometria" disabled={isGuardado} defaultValue={hc.antropometria} className={`h-9 text-sm ${printInputStyle}`} /></div>
        </div>

        <Label className="text-xs text-zinc-500 font-bold block mb-2 print:text-[10px] print:mb-1">Escalas Aplicadas</Label>
        {!isGuardado && (
          <div className="flex gap-2 mb-4 max-w-md print:hidden">
            <select value={escalaSelect} onChange={e => setEscalaSelect(e.target.value)} className="flex-1 rounded-md border border-zinc-200 px-3 py-1 text-sm bg-white">
              <option value="">Añadir escala...</option>
              {ESCALAS_LIST.filter(i => !escalaItems.some(x => x.nombre === i)).map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <Button type="button" onClick={agregarEscala} variant="outline" size="sm" className="shrink-0"><Plus className="h-4 w-4 mr-1"/> Añadir</Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2">
          {escalaItems.map((item) => (
             <div key={item.nombre} className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 print:bg-transparent print:border-none print:p-0">
               <Label className="w-1/3 text-xs font-bold text-zinc-700 print:text-[10px]">{item.nombre}</Label>
               {item.nombre === "EVA" ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input type="range" min="0" max="10" disabled={isGuardado} value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className="w-full print:hidden" />
                    <span className="font-bold text-orange-500 text-xs w-6 print:text-[10px]">{item.valor}/10</span>
                  </div>
               ) : (
                  <Input disabled={isGuardado} placeholder="Puntaje/resultado..." value={item.valor} onChange={e => updateEscala(item.nombre, e.target.value)} className={`flex-1 h-7 text-xs ${printInputStyle}`} />
               )}
               {!isGuardado && <Button type="button" onClick={() => setEscalaItems(escalaItems.filter(x => x.nombre !== item.nombre))} variant="ghost" size="icon" className="h-6 w-6 text-red-400 print:hidden"><X className="h-3 w-3"/></Button>}
             </div>
          ))}
        </div>
      </div>

      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-4 print:text-xs print:mb-2 print:pb-1">7. Diagnóstico y Tratamiento</h2>
        <div className="space-y-4 print:space-y-2">
          <div className="space-y-1 print:space-y-0">
            <Label className={printLabelStyle}>Resultados previos o actuales de estudios</Label>
            <Input name="estudios_previos" disabled={isGuardado} defaultValue={hc.estudios_previos} className={`h-9 text-sm ${printInputStyle}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2">
            <div className="space-y-1 print:space-y-0">
              <Label className={printLabelStyle}>Terapéutica: Medicamento (Vía, Dosis, Frec)</Label>
              <Input name="tx_medicamento" disabled={isGuardado} defaultValue={hc.tx_medicamento} className={`h-9 text-sm ${printInputStyle}`} />
            </div>
            <div className="space-y-1 print:space-y-0">
              <Label className={printLabelStyle}>Terapéutica: Fisioterapia (Técnica, Dosis, Frec)</Label>
              <Input name="tx_fisioterapia" disabled={isGuardado} defaultValue={hc.tx_fisioterapia} className={`h-9 text-sm ${printInputStyle}`} />
            </div>
          </div>
          <div className="space-y-1 print:space-y-0">
            <Label className={printLabelStyle}>Diagnóstico Funcional/Problemas Clínicos</Label>
            <Input name="dx_funcional" disabled={isGuardado} defaultValue={hc.dx_funcional} className={`h-9 text-sm ${printInputStyle}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2">
            <div className="space-y-1 print:space-y-0">
              <Label className={printLabelStyle}>Estructura corporal y función vs déficit</Label>
              <Textarea name="dx_estructura" disabled={isGuardado} defaultValue={hc.dx_estructura} rows={2} className={`text-sm ${printInputStyle}`} />
            </div>
            <div className="space-y-1 print:space-y-0">
              <Label className={printLabelStyle}>Actividad vs limitación en actividad</Label>
              <Textarea name="dx_actividad" disabled={isGuardado} defaultValue={hc.dx_actividad} rows={2} className={`text-sm ${printInputStyle}`} />
            </div>
            <div className="space-y-1 print:space-y-0">
              <Label className={printLabelStyle}>Participación vs restricción en participación</Label>
              <Textarea name="dx_participacion" disabled={isGuardado} defaultValue={hc.dx_participacion} rows={2} className={`text-sm ${printInputStyle}`} />
            </div>
          </div>
          <div className="space-y-1 border-t border-zinc-100 pt-4 mt-2 print:border-none print:pt-0 print:mt-1">
            <Label className={`font-bold ${printLabelStyle}`}>Pronóstico y Plan de Tratamiento</Label>
            <Textarea name="pronostico_plan" disabled={isGuardado} defaultValue={hc.pronostico_plan} rows={3} className={`text-sm ${printInputStyle}`} />
          </div>
        </div>
      </div>

      <div className={printSectionStyle}>
        <h2 className="text-lg font-bold text-umi-blue border-b pb-2 mb-6 print:text-xs print:mb-2 print:pb-1">Firmas y Autorizaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4">
          <div className="flex flex-col items-center space-y-2">
            <Label className="text-xs text-zinc-500 font-bold print:text-[10px]">Firma del Paciente / Tutor</Label>
            <div className={`border border-zinc-300 bg-zinc-50 rounded-md w-full max-w-[300px] print:border-t-0 print:border-x-0 print:border-b-2 print:border-zinc-400 print:bg-transparent print:rounded-none ${isGuardado ? 'pointer-events-none' : ''}`}>
              <SignatureCanvas ref={sigPadPaciente} penColor="#0f172a" canvasProps={{className: 'w-full h-24 print:h-16'}} />
            </div>
            <p className="text-xs text-zinc-400 mt-1 uppercase print:text-[9px] print:text-zinc-600 font-bold">{paciente?.nombre_completo || "NOMBRE DEL PACIENTE"}</p>
            {!isGuardado && <Button type="button" variant="ghost" size="sm" onClick={limpiarFirmaPaciente} className="text-red-500 h-6 text-xs p-0 print:hidden"><Eraser className="h-3 w-3 mr-1" /> Limpiar firma</Button>}
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <Label className="text-xs text-umi-blue font-bold print:text-[10px]">
              Fisioterapeuta Responsable
            </Label>
            {fisioFirmado ? (
              <div className="w-full max-w-[300px] bg-indigo-50/50 rounded-md flex flex-col items-center justify-center p-4 border border-indigo-100 h-24 print:bg-transparent print:border-none print:h-auto">
                <span className="font-bold text-umi-blue text-sm print:text-xs">{hc.elaborado_por || fisioActual?.nombre_completo || "Fisioterapeuta"}</span>
                <span className="text-xs text-zinc-500 print:text-[10px]">Cédula Prof: {hc.cedula_responsable || fisioActual?.cedula || "N/A"}</span>
                <div className="flex items-center gap-1 text-[10px] text-green-600 mt-2 print:hidden">
                  <CheckCircle2 className="h-3 w-3" /> Validado criptográficamente por PIN
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[300px] border border-dashed border-zinc-300 bg-zinc-50 rounded-md flex flex-col items-center justify-center p-4 h-24 print:hidden">
                <div className="flex gap-2">
                  <Input type="password" maxLength={4} placeholder="NIP Real" className={`w-24 text-center tracking-widest h-8 text-sm ${errorPin ? "border-red-500" : ""}`} value={pin} onChange={(e) => setPin(e.target.value)}/>
                  <Button type="button" size="sm" onClick={handleFirmaFisio} className="bg-umi-blue hover:bg-indigo-900 text-white h-8 text-xs">Firmar</Button>
                </div>
                {errorPin && <p className="text-[10px] text-red-500 mt-1">NIP incorrecto.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6 print:hidden">
        {isGuardado ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="h-6 w-6" />
              <div><p className="font-bold text-sm">Expediente Bloqueado y Guardado</p></div>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={() => setIsGuardado(false)} variant="outline" className="text-green-800 border-green-300 bg-white h-10">
                <Edit className="mr-2 h-4 w-4" /> Habilitar Edición
              </Button>
              <Button type="button" onClick={handlePrint} className="bg-white text-green-800 border-green-300 text-sm h-10 shadow-sm">
                <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end sticky bottom-6 z-10">
            <Button type="submit" disabled={isGuardando} className="bg-umi-blue hover:bg-indigo-900 text-white shadow-xl px-8 py-6 text-base rounded-full">
              {isGuardando ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Cerrar y Guardar Expediente
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}