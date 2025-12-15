import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Usamos Inter de Google Fonts
import "./globals.css";

// Configuración de la fuente Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriverCloudMD - Gestión de Escuelas de Manejo",
  description: "Plataforma integral para gestión de escuelas de manejo, estudiantes e instructores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
