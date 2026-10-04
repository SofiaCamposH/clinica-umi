"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

export function NuevoPaciente() {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_completo: "",
    edad: "",
    genero: "",
    telefono: "",
    rfc: "",
    diagnostico_clinico: "",
    especialidad: "Fisioterapia General",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Generar un folio automático temporal (ej. PAC-2024-1234)
    const folio = `PAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from("pacientes").insert([
      {
        folio,
        nombre_completo: formData.nombre_completo,
        edad: parseInt(formData.edad),
        genero: formData.genero,
        telefono: formData.telefono,
        rfc: formData.rfc.toUpperCase(),
        diagnostico_clinico: formData.diagnostico_clinico,
        especialidad: formData.especialidad,
        estatus_clinico: "En valoración"
      }
    ]);

    setIsLoading(false);

    if (!error) {
      setIsOpen(false);
      setFormData({ nombre_completo: "", edad: "", genero: "", telefono: "", rfc: "", diagnostico_clinico: "", especialidad: "Fisioterapia General" });
      router.refresh(); // Recarga la tabla de fondo para mostrar el nuevo paciente
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-umi-blue hover:bg-indigo-900 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Expediente
        </Button>
      </SheetTrigger>
      
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-umi-blue text-xl">Apertura de Expediente</SheetTitle>
          <SheetDescription>
            Ingresa los datos demográficos iniciales del paciente. El folio se generará automáticamente.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input id="nombre" required placeholder="Ej. Ana Pérez Gómez"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input id="edad" type="number" required placeholder="Años"
                value={formData.edad}
                onChange={(e) => setFormData({...formData, edad: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Género</Label>
              <Input id="genero" required placeholder="Femenino / Masculino"
                value={formData.genero}
                onChange={(e) => setFormData({...formData, genero: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" required placeholder="10 dígitos"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC (Opcional)</Label>
              <Input id="rfc" placeholder="ABCD800101XYZ"
                value={formData.rfc}
                onChange={(e) => setFormData({...formData, rfc: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico o Motivo de Consulta</Label>
            <Input id="diagnostico" required placeholder="Ej. Esguince tobillo grado 2"
              value={formData.diagnostico_clinico}
              onChange={(e) => setFormData({...formData, diagnostico_clinico: e.target.value})}
            />
          </div>

          <div className="pt-6">
            <Button type="submit" disabled={isLoading} className="w-full bg-umi-teal hover:bg-teal-600 text-white">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Expediente"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}