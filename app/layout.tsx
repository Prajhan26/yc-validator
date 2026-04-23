import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://notycombinator.com"),
  title: "notycombinator - Practice YC applications",
  description: "Mock YC application reviews before you apply for real.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "notycombinator - Practice YC applications",
    description: "Mock YC application reviews before you apply for real.",
    url: "/",
    siteName: "notycombinator",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "notycombinator preview card",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "notycombinator - Practice YC applications",
    description: "Mock YC application reviews before you apply for real.",
    images: ["/preview.png"],
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
