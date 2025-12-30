import "./globals.css";
import Header from "@/components/Header";
import ServiceWorker from "@/components/ServiceWorker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Didban",
  description: "Didban - Personal Custom Newspaper",
  icons: {
    icon: "/img/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F9FAFC" />
        <link rel="apple-touch-icon" href="/img/logo.png" />
      </head>
      <body>
        <Header />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
