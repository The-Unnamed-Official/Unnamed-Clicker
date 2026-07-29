import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "BUTTON // REACTOR v2.0";
  const description = "A tactile incremental game about pressure, probability, towers, secrets, and the perfect press.";
  return {
    metadataBase,
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: "/assets/og-button-reactor-v2.png", width: 1734, height: 907, alt: "BUTTON // REACTOR pressure system" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/og-button-reactor-v2.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
