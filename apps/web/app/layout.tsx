import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Review | Dashboard",
  description: "Submit, track, and review student projects.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
