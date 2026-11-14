import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Anton, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Jogo de adivinhar música`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "jogo de adivinhar música",
    "adivinhe a música",
    "quiz de música",
    "quiz musical",
    "qual é a música",
    "heardle em português",
    "jogo de música online",
    "adivinhar música pelo trecho",
  ],
  category: "games",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Jogo de adivinhar música`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Jogo de adivinhar música`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ede2" },
    { media: "(prefers-color-scheme: dark)", color: "#15130f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} ${anton.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-[15px]">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 pt-6 pb-8">
          <Link href="/" className="group flex items-center gap-3" title="Ir para o início">
            <span
              aria-hidden
              className="vinyl spin-slow paused relative size-12 transition group-hover:scale-105 group-hover:[animation-play-state:running]"
            >
              <span className="vinyl-label bg-accent" />
            </span>
            <span className="leading-none">
              <span className="display block text-[34px] transition group-hover:text-accent sm:text-[40px]">Toca Aí</span>
              <span className="block font-mono text-[11px] text-muted">Jogo de adivinhar música</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/#categorias"
              className="text-sm font-semibold underline-offset-4 transition hover:text-accent hover:underline"
            >
              Categorias
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-20">{children}</main>
        <footer className="mx-auto flex w-full max-w-5xl flex-wrap gap-x-4 gap-y-1 px-5 py-8 text-xs text-muted">
          <span>Toca Aí: jogo de adivinhar música grátis, sem cadastro e sem fins lucrativos.</span>
          <span>
            Prévias de áudio, capas e fotos:{" "}
            <a href="https://www.deezer.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
              Deezer
            </a>
            .
          </span>
          {process.env.NEXT_PUBLIC_CONTATO && (
            <a href={process.env.NEXT_PUBLIC_CONTATO} className="underline underline-offset-2 hover:text-fg">
              É dono de uma música e quer tirá-la do jogo? Fale com a gente.
            </a>
          )}
        </footer>
      </body>
    </html>
  );
}
