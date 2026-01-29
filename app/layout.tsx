import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "KWI Bagel Thursdays",
  description: "Carbs. Colleagues. Chaos. Submit your weekly bagel order before Wednesday noon or forever hold your hunger.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥯</text></svg>",
  },
  openGraph: {
    title: "KWI Bagel Thursdays",
    description: "Carbs. Colleagues. Chaos. Submit your weekly bagel order before Wednesday noon or forever hold your hunger.",
    images: ["/images/kwi-logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KWI Bagel Thursdays",
    description: "Carbs. Colleagues. Chaos. Submit your weekly bagel order before Wednesday noon or forever hold your hunger.",
    images: ["/images/kwi-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
