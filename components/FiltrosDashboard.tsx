"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function FiltrosDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Tomamos los valores actuales de la URL si existen
  const defaultQ = searchParams.get("q") || "";
  const defaultEstatus = searchParams.get("estatus") || "";

  const [q, setQ] = useState(defaultQ);
  const [estatus, setEstatus] = useState(defaultEstatus);

  // El efecto "Debounce": Espera 300ms después de que dejas de teclear para buscar
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (q) params.set("q", q);
      else params.delete("q");

      if (estatus) params.set("estatus", estatus);
      else params.delete("estatus");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [q, estatus, pathname, router, searchParams]);

  const limpiar = () => {
    setQ("");
    setEstatus("");
  };

  return (
    <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row items-center gap-4 bg-zinc-50/50">
      
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Buscar por nombre, folio o teléfono..." 
          className="pl-9 bg-white border-zinc-200 h-10 rounded-lg shadow-sm" 
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex items-center bg-white border border-zinc-200 rounded-lg shadow-sm h-10 px-3">
          <Filter className="h-4 w-4 text-zinc-400 mr-2" />
          <select 
            className="bg-transparent text-sm text-zinc-700 outline-none cursor-pointer"
            value={estatus}
            onChange={(e) => setEstatus(e.target.value)}
          >
            <option value="">Todos los estatus</option>
            <option value="En valoración">En valoración</option>
            <option value="Activo">Activo</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        {(q || estatus) && (
          <Button variant="outline" onClick={limpiar} className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
            <X className="mr-1 h-4 w-4" /> Limpiar
          </Button>
        )}
      </div>
      
    </div>
  );
}