"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, Image as ImageIcon, Trash2, Download, Loader2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GestorArchivos({ pacienteId, fisioActual }: { pacienteId: string; fisioActual: any }) {
  const supabase = createClient();
  const [archivos, setArchivos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cargarArchivos = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("archivos_pacientes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });

    if (data) setArchivos(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (pacienteId) cargarArchivos();
  }, [pacienteId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Crear un nombre único para evitar que se sobreescriban archivos con el mismo nombre
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${pacienteId}/${fileName}`; // Se guardan en una carpeta con el ID del paciente

    // 1. Subir físicamente al bucket 'expedientes'
    const { error: storageError } = await supabase.storage
      .from("expedientes")
      .upload(filePath, file);

    if (storageError) {
      alert("Error al subir el archivo: " + storageError.message);
      setIsUploading(false);
      return;
    }

    // 2. Registrar el archivo en la base de datos
    const { error: dbError } = await supabase.from("archivos_pacientes").insert([{
      paciente_id: pacienteId,
      nombre_archivo: file.name,
      ruta_storage: filePath,
      tipo: file.type,
      tamano: file.size,
      subido_por: fisioActual?.nombre_completo || "Fisioterapeuta"
    }]);

    if (dbError) alert("Error al registrar en BD: " + dbError.message);
    else cargarArchivos();
    
    setIsUploading(false);
    e.target.value = ""; // Limpiar el input
  };

  const handleDownload = async (ruta: string, nombreOriginal: string) => {
    const { data, error } = await supabase.storage.from("expedientes").download(ruta);
    if (error) {
      alert("Error al descargar: " + error.message);
      return;
    }
    // Crear link de descarga automático
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreOriginal;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string, ruta: string) => {
    if(!confirm("¿Estás seguro de eliminar este archivo permanentemente?")) return;
    // Borrar de Storage y de Base de Datos
    await supabase.storage.from("expedientes").remove([ruta]);
    await supabase.from("archivos_pacientes").delete().eq("id", id);
    cargarArchivos();
  };

  const getIcon = (tipo: string) => {
    if (tipo.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (tipo.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-zinc-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Zona de Subida */}
      <div className="border-2 border-dashed border-umi-blue/30 bg-umi-blue/5 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-umi-blue/10 transition-colors relative cursor-pointer">
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleUpload}
          disabled={isUploading}
          accept=".pdf,.jpg,.jpeg,.png,.dcm"
        />
        {isUploading ? (
          <Loader2 className="h-10 w-10 text-umi-blue animate-spin mb-3" />
        ) : (
          <UploadCloud className="h-10 w-10 text-umi-blue mb-3" />
        )}
        <h3 className="font-bold text-umi-blue text-lg">
          {isUploading ? "Subiendo de forma segura..." : "Haz clic o arrastra un archivo aquí"}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Soporta PDF, JPG, PNG (Estudios e Imagenología)</p>
      </div>

      {/* Lista de Archivos */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
          <h3 className="font-bold text-zinc-700 text-sm">Documentos Digitalizados del Paciente</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 text-zinc-400 animate-spin" /></div>
          ) : archivos.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No hay archivos registrados en este expediente.</div>
          ) : (
            archivos.map((archivo) => (
              <div key={archivo.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                  {getIcon(archivo.tipo)}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-zinc-800 truncate">{archivo.nombre_archivo}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {formatBytes(archivo.tamano)} • Sello: {archivo.subido_por}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(archivo.ruta_storage, archivo.nombre_archivo)} className="h-8 text-umi-blue hover:text-indigo-900 bg-white">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(archivo.id, archivo.ruta_storage)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100 bg-white">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}