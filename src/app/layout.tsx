import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Usamos Inter de Google Fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Configuración de la fuente Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriverCloud CRM",
  description: "Sistema de gestión integral para autoescuelas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
