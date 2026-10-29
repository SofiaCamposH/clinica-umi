import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Importamos la nueva fuente
import "./globals.css";

// Configuramos la fuente
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "UMI Clínica | Expediente Clínico",
  description: "Sistema de gestión clínica, notas SOAP y bitácora de asistencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Aplicamos la fuente a todo el body */}
      <body className={`${montserrat.className} bg-zinc-50 text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}