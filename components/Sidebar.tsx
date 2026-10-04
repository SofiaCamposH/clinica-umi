"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FolderOpen, FileImage, ClipboardList, LogOut, FilePlus } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Expedientes Clínicos", href: "/dashboard", icon: FolderOpen, badge: "Activo" },
    { name: "Nueva Historia Clínica", href: "/dashboard/nueva-historia", icon: FilePlus },
    { name: "Solicitud de Imagenología", href: "/dashboard/imagenologia", icon: FileImage },
    { name: "Bitácora de Asistencia", href: "/dashboard/bitacora", icon: ClipboardList, badge: "Hoy" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white px-3 py-4 shadow-sm print:hidden">
      
      {/* Logotipo Oficial con Imagen */}
      <div className="mb-6 px-3 py-2">
        <div className="relative h-12 w-32">
          <Image
            src="/logo-umi.png"
            alt="Logo Clínica UMI"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      <div className="px-3 mb-2 mt-2">
        <p className="text-[11px] font-bold text-zinc-400 tracking-wider">NAVEGACIÓN CLÍNICA</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          // Detectar si estamos en la ruta exacta o dentro de una sub-ruta del módulo
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const isDashboardRoot = pathname === '/dashboard' && item.href === '/dashboard';
          const isReallyActive = isActive || isDashboardRoot;
          
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isReallyActive
                  ? "bg-umi-blue/10 text-umi-blue" 
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-umi-blue"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isReallyActive ? 'text-umi-blue' : 'text-zinc-500'}`} />
                {item.name}
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.badge === 'Activo' 
                    ? 'bg-umi-blue text-white' 
                    : 'text-umi-blue bg-umi-blue/10'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pie del Menú */}
      <div className="mt-auto border-t border-zinc-100 pt-4">
        <div className="px-3 pb-3 flex justify-between items-center text-[10px] text-zinc-400">
          <span>☁ UMI Cloud Sync v2.4</span>
          <span>BD: 33ms</span>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}