// @/app/layout.tsx

import type { Metadata, Viewport } from "next";
// import "./globals.css";
import Header from "@/app/components/Header/Header";
import { ViewTransitions } from "next-view-transitions";

import { headers } from "next/headers";
import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { OKXUniversalProvider } from "@okxconnect/universal-provider";
import { OKXUniversalConnectUI } from "@okxconnect/ui";
import Providers from "./providers";
import Footer from "./components/Footer/Footer";
import { ContextProvider } from "./context/ContextProvider";

export const metadata: Metadata = {
  title: "Byzantine x Babylone",
  icons: {
    icon: "/logo-icon.png",
  },
  description:
    "Byzantine is a protocol to permissionlessly allow you to assemble custom providers strategies.",

  openGraph: {
    images: ["/og-image.png"],
    type: "website",
    siteName: "Byzantine x Babylone",
    title: "Byzantine x Babylone",
    description:
      "Byzantine is a protocol to permissionlessly allow you to assemble custom providers strategies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Byzantine x Babylone",
    description:
      "Byzantine is a protocol to permissionlessly allow you to assemble custom providers strategies.",
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
  const NoSSR = dynamic(() => import("@/app/components/NoSSR"), { ssr: false });
  const cookies = headers().get("cookie");

  //add gas component
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          <NoSSR>
            <Providers>
              <ContextProvider>
                <div className={"containerTotal"}>
                  <div className={"containerTop"}>
                    <Header />
                    {children}
                  </div>
                  <Footer />
                </div>
              </ContextProvider>
            </Providers>
          </NoSSR>
        </body>
      </html>
    </ViewTransitions>
  );
}
