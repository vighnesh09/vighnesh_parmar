import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModelPreloader } from "../components/canvas/ModelPreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vighnesh - Creative Developer",
  description: "3D Portfolio of Vighnesh | Creative Developer & Designer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ModelPreloader />
        {children}
      </body>
    </html>
  );
}
