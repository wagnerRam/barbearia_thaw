
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THAWBLACK | Barbearia & Escola",
  description:
    "Agende seu horário na THAWBLACK Barbearia & Escola.",
};

const themeScript = `
  (function () {
    try {
      const theme = localStorage.getItem("thawblack-theme");
      document.documentElement.dataset.theme =
        theme === "dark" ? "dark" : "light";
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
