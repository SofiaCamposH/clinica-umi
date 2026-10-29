"use client";

import { useState, useRef } from "react";
import { Save, Loader2, Eraser, UploadCloud, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/lib/supabase/client";

export function PerfilForm({ perfilActual, emailAuth }: { perfilActual: any, emailAuth: string }) {
  const supabase = createClient();
  const sigPad = useRef<any>(null);
  
  const [isGuardando, setIsGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_completo: perfilActual?.nombre_completo || "",
    cedula: perfilActual?.cedula || "",
    pin_firma: perfilActual?.pin_firma || "",
    rol: perfilActual?.rol || "Fisioterapeuta"
  });

  const [firmaVisual, setFirmaVisual] = useState<string | null>(perfilActual?.firma_digital || null);
  const [modoFirma, setModoFirma] = useState<'dibujar' | 'subir'>('dibujar');

  const handleUploadPNG = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evento) => {
      if (evento.target?.result) {
        setFirmaVisual(evento.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const limpiarFirma = () => {
    sigPad.current?.clear();
    setFirmaVisual(null);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGuardando(true);
    setMensajeExito(false);

    let firmaFinal = firmaVisual;

    // Si está en modo dibujar y hay algo en el lienzo, lo extraemos
    if (modoFirma === 'dibujar' && sigPad.current && !sigPad.current.isEmpty()) {
      firmaFinal = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
      setFirmaVisual(firmaFinal);
    }

    const datosActualizados = {
      email: emailAuth,
      ...formData,
      firma_digital: firmaFinal
    };

    if (perfilActual?.id) {
      // Actualizar si ya existe
      await supabase.from("perfiles_staff").update(datosActualizados).eq("id", perfilActual.id);
    } else {
      // Insertar si es primera vez que guarda
      await supabase.from("perfiles_staff").insert([datosActualizados]);
    }

    setIsGuardando(false);
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 4000);
  };

  return (
    <form onSubmit={handleGuardar} className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      
      <div className="p-6 md:p-8 space-y-6">
        
        {/* DATOS PERSONALES Y PROFESIONALES */}
        <div>
          <h2 className="text-lg font-bold text-umi-blue border-b border-zinc-100 pb-2 mb-4">Datos Profesionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-500">Nombre Completo (Con Título)</Label>
              <Input required placeholder="Ej. Lic. Ft. Valeria Mendoza" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} className="bg-zinc-50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-500">Correo (Solo lectura)</Label>
              <Input disabled value={emailAuth} className="bg-zinc-100 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-500">Cédula Profesional</Label>
              <Input required placeholder="Número de cédula" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} className="bg-zinc-50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-500">Especialidad / Rol</Label>
              <Input required value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="bg-zinc-50" />
            </div>
          </div>
        </div>

        {/* NIP DE SEGURIDAD */}
        <div>
          <h2 className="text-lg font-bold text-umi-blue border-b border-zinc-100 pb-2 mb-4">Seguridad</h2>
          <div className="max-w-xs space-y-1">
            <Label className="text-xs font-bold text-zinc-500">NIP de Firma Digital (4 dígitos)</Label>
            <Input required type="password" maxLength={4} placeholder="Ej. 1234" value={formData.pin_firma} onChange={e => setFormData({...formData, pin_firma: e.target.value})} className="bg-zinc-50 tracking-widest text-center text-lg h-12 w-32" />
            <p className="text-[10px] text-zinc-400">Este NIP es requerido para validar documentos oficiales.</p>
          </div>
        </div>

        {/* FIRMA DIGITAL */}
        <div>
          <h2 className="text-lg font-bold text-umi-blue border-b border-zinc-100 pb-2 mb-4">Firma Autógrafa</h2>
          
          <div className="flex gap-2 mb-4">
            <Button type="button" variant={modoFirma === 'dibujar' ? 'default' : 'outline'} onClick={() => setModoFirma('dibujar')} className={modoFirma === 'dibujar' ? 'bg-umi-blue' : ''} size="sm">
              Dibujar Firma
            </Button>
            <Button type="button" variant={modoFirma === 'subir' ? 'default' : 'outline'} onClick={() => setModoFirma('subir')} className={modoFirma === 'subir' ? 'bg-umi-blue' : ''} size="sm">
              Subir PNG
            </Button>
          </div>

          <div className="border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] max-w-md">
            
            {firmaVisual && modoFirma === 'subir' ? (
              <div className="relative w-full flex flex-col items-center">
                <img src={firmaVisual} alt="Firma Guardada" className="max-h-32 object-contain mix-blend-multiply" />
                <Button type="button" variant="ghost" size="sm" onClick={limpiarFirma} className="text-red-500 mt-4"><Eraser className="h-4 w-4 mr-1"/> Quitar Imagen</Button>
              </div>
            ) : modoFirma === 'dibujar' ? (
              <div className="w-full">
                <SignatureCanvas ref={sigPad} penColor="#0f172a" canvasProps={{className: 'w-full h-32 border border-zinc-200 bg-white rounded-lg'}} />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-zinc-400">Dibuja dentro del recuadro</span>
                  <Button type="button" variant="ghost" size="sm" onClick={limpiarFirma} className="text-red-500 h-6 px-2 text-xs"><Eraser className="h-3 w-3 mr-1"/> Limpiar</Button>
                </div>
              </div>
            ) : (
              <div className="text-center w-full relative cursor-pointer">
                <Input type="file" accept="image/png, image/jpeg" onChange={handleUploadPNG} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <UploadCloud className="h-10 w-10 text-umi-blue mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-umi-blue">Sube una imagen</p>
                <p className="text-xs text-zinc-500">De preferencia PNG con fondo transparente</p>
              </div>
            )}
            
          </div>
        </div>

      </div>

      <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex items-center justify-between">
        <div>
          {mensajeExito && (
            <span className="flex items-center text-green-600 text-sm font-bold animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 mr-2" /> Perfil guardado con éxito
            </span>
          )}
        </div>
        <Button type="submit" disabled={isGuardando} className="bg-umi-blue hover:bg-indigo-900 text-white px-8 h-12">
          {isGuardando ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

    </form>
  );
}