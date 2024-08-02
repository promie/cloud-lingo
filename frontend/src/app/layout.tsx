import { ReactNode } from 'react'
import type { Metadata } from "next";
import "./globals.css";
import QueryClientProvider from "@/providers/QueryClientProvider";

export const metadata: Metadata = {
  title: "Cloud Lingo",
  description: "Translation App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
     <QueryClientProvider>
       <body>{children}</body>
     </QueryClientProvider>
    </html>
  );
}
