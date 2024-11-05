// @/app/layout.tsx

import type { Metadata, Viewport } from "next";
// import "./globals.css";
import ReownProvider from "@/context/reown";
import Header from "@/components/Header/Header";
import { ViewTransitions } from "next-view-transitions";

import { headers } from "next/headers";
import "@/styles/globals.css";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Your project name",
  icons: {
    icon: "/logo-icon.png",
  },
  description: "Your project description",

  openGraph: {
    images: ["/og-image.png"],
    type: "website",
    siteName: "Your project name",
    title: "Your project name",
    description: "Your project description",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your project name",
    description: "Your project description",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const NoSSR = dynamic(() => import("@/components/NoSSR"), { ssr: false });
  const cookies = headers().get("cookie");

  //add gas component
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          <NoSSR>
            <ReownProvider cookies={cookies}>
              <div className="containerTotal">
                <Header />
                {children}
              </div>
            </ReownProvider>
          </NoSSR>
        </body>
      </html>
    </ViewTransitions>
  );
}
