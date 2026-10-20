"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, User, Mail, KeyRound, Eraser, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const sigPadFisio = useRef<any>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("Servicio Social");
  const [cedula, setCedula] = useState("");
  const [pin, setPin] = useState("");

  const handleLimpiarFirma = () => sigPadFisio.current?.clear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        // --- PROCESO DE INICIO DE SESIÓN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw new Error("Correo o contraseña incorrectos.");
        
        // Si todo sale bien, lo mandamos al dashboard
        router.push("/dashboard");

      } else {
        // --- PROCESO DE REGISTRO / ONBOARDING ---
        if (pin.length !== 4) throw new Error("El PIN debe ser de 4 dígitos exactos.");
        if (sigPadFisio.current?.isEmpty()) throw new Error("Debes registrar tu firma digital.");

        // 1. Crear el usuario en la autenticación de Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw new Error(authError.message);

        // 2. Extraer la firma como texto (Base64)
        const firmaBase64 = sigPadFisio.current.getTrimmedCanvas().toDataURL('image/png');

        // 3. Guardar sus datos, rol, PIN y firma en tu nueva tabla perfiles_staff
        const { error: dbError } = await supabase.from('perfiles_staff').insert([{
          email: email,
          nombre_completo: nombre,
          rol: rol,
          cedula: rol === "Titular" ? cedula : null,
          pin_firma: pin,
          firma_digital: firmaBase64
        }]);

        if (dbError) throw new Error("Error al guardar el perfil: " + dbError.message);

        // Si se registró exitosamente, entra automático al dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-umi-blue p-8 text-center text-white flex flex-col items-center">
          <div className="relative h-16 w-32 bg-white rounded-xl p-2 mb-4">
            <Image src="/logo-umi.png" alt="Logo UMI" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold">{isLogin ? "Acceso de Personal" : "Registro de Equipo"}</h1>
          <p className="text-blue-100 text-sm mt-1">
            {isLogin ? "Ingresa tus credenciales para continuar" : "Configura tu perfil, rol y firma digital"}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Valeria Mendoza" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel / Rol</Label>
                  <select value={rol} onChange={e => setRol(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
                    <option value="Servicio Social">Servicio Social</option>
                    <option value="Titular">Fisioterapeuta Titular</option>
                  </select>
                </div>
                {rol === "Titular" && (
                  <div className="space-y-2">
                    <Label>Cédula Prof.</Label>
                    <Input required value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Ej. 8492041-A" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@clinica.com" className="pl-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
              </div>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-6 pt-4 border-t border-zinc-100 animate-in fade-in duration-500">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-umi-blue"><KeyRound className="h-4 w-4"/> Configura tu PIN de Autorización</Label>
                <p className="text-xs text-zinc-500">Este NIP de 4 dígitos te servirá para sellar rápidamente tus notas SOAP sin tener que escribir tu contraseña completa.</p>
                <Input required type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} placeholder="1234" className="w-32 text-center text-xl tracking-widest h-12 border-umi-blue/30 bg-blue-50/50" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-umi-blue">Trazo de Firma Digital</Label>
                <p className="text-xs text-zinc-500">Dibuja tu firma. Esta aparecerá impresa en los expedientes de la NOM-004 que tú valides.</p>
                <div className="border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-xl w-full">
                  <SignatureCanvas ref={sigPadFisio} penColor="#0f172a" canvasProps={{className: 'w-full h-32'}} />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleLimpiarFirma} className="text-red-500 mt-1"><Eraser className="h-4 w-4 mr-2" /> Volver a trazar</Button>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-12 bg-umi-blue hover:bg-indigo-900 text-white text-base rounded-xl shadow-md">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isLogin ? "Iniciar Sesión" : "Completar Registro y Entrar"}
          </Button>

        </form>
        
        {/* Toggle para cambiar entre Login y Registro */}
        <div className="bg-zinc-50 p-6 text-center border-t border-zinc-200">
          <p className="text-sm text-zinc-600">
            {isLogin ? "¿Eres nuevo en el equipo?" : "¿Ya tienes tu cuenta configurada?"}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className="ml-2 font-bold text-umi-blue hover:underline">
              {isLogin ? "Regístrate aquí" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}