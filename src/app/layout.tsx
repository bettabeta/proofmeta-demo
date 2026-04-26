import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ProofMeta Demo — End-to-End Licensing Flow",
  description:
    "Interactive demo of the ProofMeta protocol. See how AI agents discover, request, and verify licenses in real time.",
  openGraph: {
    title: "ProofMeta Demo — End-to-End Licensing Flow",
    description:
      "Interactive demo of the ProofMeta protocol. Machine-readable licensing for the agentic web.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} font-mono bg-[#0b0b0b] text-[#e8e3d5] min-h-screen`}>
        <nav className="border-b border-white/10 px-6 py-3 text-sm sticky top-0 bg-[#0b0b0b]/90 backdrop-blur z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <a href="/" className="font-bold">
              <span className="text-[#d4873c]">proofmeta/</span>demo
            </a>
            <div className="flex gap-5 text-[#8a8678]">
              <a href="/" className="hover:text-[#e8e3d5]">Demo</a>
              <a href="https://proofmeta.com" className="hover:text-[#e8e3d5]" target="_blank" rel="noopener">Protocol</a>
              <a href="https://github.com/bettabeta/proofmeta-primitive-core" className="hover:text-[#e8e3d5]" target="_blank" rel="noopener">GitHub</a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
        <footer className="border-t border-white/10 px-6 py-6 text-xs text-[#8a8678]">
          <div className="max-w-5xl mx-auto flex justify-between">
            <span>ProofMeta Protocol — Apache 2.0</span>
            <span>© 2026 Daud Zulfacar, Pandr UG</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
