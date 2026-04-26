import type { Metadata } from "next";
import { Exo_2, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HEALY — Health Observer Robot",
  description:
    "Real-time health monitoring system powered by IoT sensors. Track body temperature, heart rate, and blood oxygen levels with clinical precision.",
  keywords: [
    "health monitoring",
    "IoT",
    "ESP32",
    "telemetry",
    "real-time",
    "temperature",
    "heart rate",
    "SpO2",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${exo2.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-healy-bg text-healy-graphite font-body">
        {children}
      </body>
    </html>
  );
}
