"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Activity, Stethoscope } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Expedientes", href: "/dashboard/pacientes", icon: Users },
    { name: "Bitácoras", href: "/dashboard/bitacoras", icon: Activity },
    { name: "Solicitudes", href: "/dashboard/solicitudes", icon: FileText },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-zinc-50/50 px-3 py-4">
      {/* Logotipo o Nombre de la Clínica */}
      <div className="mb-8 flex items-center gap-2 px-3">
        <Stethoscope className="h-6 w-6 text-zinc-900" />
        <span className="text-lg font-bold text-zinc-900">Clínica UMI</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          // Detectar si la ruta actual coincide con el botón para pintarlo de oscuro
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Pie del Menú */}
      <div className="mt-auto border-t border-zinc-200 p-4 text-xs text-zinc-500">
        Fisioterapia UMI v1.0
      </div>
    </div>
  );
}