import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientErrorHandler from "@/components/ClientErrorHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELECTRO INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES - Admin Dashboard",
  description: "EINOPAS ERP College & Admin Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#80229a] text-slate-800 font-sans selection:bg-[#9c27b0] selection:text-white">
        <ClientErrorHandler />
        {children}
      </body>
    </html>
  );
}
