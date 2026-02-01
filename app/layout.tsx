import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Kanbanned - Free Visual Kanban Board",
  description:
    "Kanbanned is a free, visual project management tool using Kanban boards. Organize tasks into columns, track progress, and boost productivity with drag-and-drop simplicity.",
  keywords: [
    "kanban",
    "kanban board",
    "project management",
    "task management",
    "productivity",
    "agile",
    "free kanban",
  ],
  authors: [{ name: "Kanbanned" }],
  openGraph: {
    title: "Kanbanned - Free Visual Kanban Board",
    description:
      "Organize your work visually with Kanbanned. A free Kanban board to manage tasks, track progress, and improve team productivity.",
    url: "https://kanbanned.com",
    siteName: "Kanbanned",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Kanbanned - Free Visual Kanban Board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanbanned - Free Visual Kanban Board",
    description:
      "Organize your work visually with Kanbanned. A free Kanban board to manage tasks and track progress.",
    images: ["/opengraph-image.png"],
  },
  metadataBase: new URL("https://kanbanned.com"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kanbanned",
  description:
    "A free, visual project management tool using Kanban boards. Organize tasks into columns, track progress, and boost productivity.",
  url: "https://kanbanned.com",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorker />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
