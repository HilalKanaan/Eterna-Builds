import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import FilmGrain from "@/components/ui/FilmGrain";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eterna Builds | Spaces that Understand you",
  description:
    "Interior design & architecture firm in Lebanon and Saudi Arabia. Driving bold construction projects to timeless spaces for modern living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased">
        <Preloader />
<FilmGrain />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
