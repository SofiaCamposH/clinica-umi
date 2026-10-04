import { FilePlus } from "lucide-react";
import { HistoriaClinicaForm } from "@/components/clinica/HistoriaClinicaForm";

export default function NuevaHistoriaPage() {
  // Creamos un objeto con valores vacíos para que el formulario se muestre limpio
  const pacienteVacio = {
    folio: "Se generará automáticamente al guardar",
    nombre_completo: "",
    edad: "",
    genero: "",
    telefono: "",
    rfc: "",
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      
      {/* Encabezado de la página */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm print:hidden">
        <div className="h-14 w-14 bg-umi-teal/10 rounded-full flex items-center justify-center text-umi-teal">
          <FilePlus className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-umi-blue">Nueva Historia Clínica</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Llene los campos a continuación para registrar un nuevo paciente y su expediente médico completo.
          </p>
        </div>
      </div>

      {/* Renderizamos el formulario pasándole los datos en blanco */}
      <HistoriaClinicaForm paciente={pacienteVacio} />
      
    </div>
  );
}