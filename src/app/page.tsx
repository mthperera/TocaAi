import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExplicitBadge } from "@/components/ExplicitBadge";
import { TodayDots, TodayLabel } from "@/components/HomeIslands";
import { JsonLd } from "@/components/JsonLd";
import { Sleeve } from "@/components/Sleeve";
import { Countdown } from "@/components/ui";
import { Vinyl } from "@/components/Vinyl";
import { categorySize, hasExplicitContent, trackCount } from "@/lib/catalog.server";
import { artistPictureUrl, categories, categoryArtists, getCategory, textOn, type Category } from "@/lib/categories";
import { MODES } from "@/lib/modes";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURED = getCategory("tiktok-2026")!;

const shelf = (() => {
  const seen = new Set<string>();
  return categories
    .flatMap((c) => categoryArtists(c.id, 2).map((a) => ({ ...a, color: c.color })))
    .filter((a) => !seen.has(a.name) && seen.add(a.name))
    .slice(0, 24);
})();

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: ["Toca Aí jogo de adivinhar música", "Toca Ai"],
      url: SITE_URL,
      inLanguage: "pt-BR",
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "VideoGame",
      name: SITE_NAME,
      url: SITE_URL,
      image: absoluteUrl("/opengraph-image"),
      description: SITE_DESCRIPTION,
      inLanguage: "pt-BR",
      genre: ["Música", "Quiz", "Jogo de adivinhar música"],
      gamePlatform: ["Navegador", "Celular"],
      playMode: "SinglePlayer",
      applicationCategory: "Game",
      operatingSystem: "Qualquer",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
    {
      "@type": "ItemList",
      name: "Categorias do jogo de adivinhar música",
      itemListElement: categories.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Jogo de adivinhar música: ${c.name}`,
        url: absoluteUrl(`/categoria/${c.id}`),
      })),
    },
  ],
};

export default function Home() {
  const others = categories.filter((c) => c.id !== FEATURED.id);
  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-fg pb-6">
        <div>
          <h1 className="display text-7xl sm:text-8xl">
            <span className="sr-only">Jogo de adivinhar música: </span>Disco do dia
          </h1>
          <TodayLabel />
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-fg py-4 pr-6 pl-4 text-bg shadow-[0_14px_30px_-16px_rgb(0_0_0/0.6)]">
          <Vinyl color="var(--accent)" spinning slow className="size-14 shrink-0" />
          <div>
            <p className="font-mono text-xs opacity-70">Próximo disco em</p>
            <Countdown className="text-4xl leading-tight font-medium sm:text-5xl" />
          </div>
        </div>
      </section>

      <div
        aria-hidden
        className="relative -mx-5 mt-8 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]"
      >
        <div className="marquee flex w-max gap-6 px-5">
          {[...shelf, ...shelf].map((a, i) => (
            <div key={`${a.name}-${i}`} className="flex w-24 flex-col items-center gap-2">
              <Vinyl color={a.color} bigLabel still className="w-24">
                <Image src={artistPictureUrl(a.picture, 120)} alt="" fill sizes="56px" className="object-cover" />
              </Vinyl>
              <span className="w-full truncate text-center text-xs text-muted">{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="categorias" className="mt-10 grid scroll-mt-6 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        <Link href={`/categoria/${FEATURED.id}`} className="group relative col-span-2 row-span-2 hover:z-20">
          <Sleeve
            category={FEATURED}
            artists={categoryArtists(FEATURED.id)}
            priority
            sizes="(min-width: 1024px) 240px, 45vw"
            sourceSize={500}
          >
            <Band category={FEATURED} featured />
          </Sleeve>
        </Link>
        {others.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.id}`}
            className="group relative [contain-intrinsic-size:auto_320px] [content-visibility:auto] hover:z-20"
          >
            <Sleeve category={c} artists={categoryArtists(c.id)}>
              <Band category={c} />
            </Sleeve>
            <p className="mt-2.5 line-clamp-1 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-20 grid gap-10 border-t-2 border-fg pt-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="display text-4xl">Como jogar</h2>
          <p className="mt-4 text-muted">
            O {SITE_NAME} é um jogo de adivinhar música pelo trecho, parecido com o Heardle, só que em português e com
            música brasileira. Todo dia sai um disco novo: em cada categoria tem um desafio diferente por modo e por
            nível, e os dias anteriores ficam no arquivo para jogar depois.
          </p>
          <p className="mt-3 text-muted">
            São {trackCount().toLocaleString("pt-BR")} músicas em {categories.length} categorias: quiz de{" "}
            <CategoryLink id="funk">funk</CategoryLink>, <CategoryLink id="sertanejo">sertanejo</CategoryLink>,{" "}
            <CategoryLink id="pagode">pagode</CategoryLink>, <CategoryLink id="rock">rock</CategoryLink>,{" "}
            <CategoryLink id="pop">pop</CategoryLink> e <CategoryLink id="mpb">MPB</CategoryLink>, músicas dos{" "}
            <CategoryLink id="anos-80">anos 80</CategoryLink>, <CategoryLink id="anos-90">anos 90</CategoryLink> e{" "}
            <CategoryLink id="anos-2000">anos 2000</CategoryLink> e os{" "}
            <CategoryLink id="tiktok-2026">virais do TikTok</CategoryLink>. É grátis, não precisa de cadastro e
            funciona no celular.
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {MODES.map((m) => (
            <div key={m.id}>
              <dt>
                <Link
                  href={`/jogar/mix/${m.id}`}
                  prefetch={false}
                  className="inline-block py-1 font-semibold underline-offset-4 hover:text-accent hover:underline"
                >
                  {m.name}
                </Link>
              </dt>
              <dd className="text-sm text-muted">{m.howTo}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function CategoryLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link
      href={`/categoria/${id}`}
      prefetch={false}
      className="font-semibold text-fg underline-offset-4 hover:text-accent hover:underline"
    >
      {children}
    </Link>
  );
}

function Band({ category, featured = false }: { category: Category; featured?: boolean }) {
  return (
    <>
      {hasExplicitContent(category.id) && <ExplicitBadge className="absolute top-2 left-2 z-10 ring-2 ring-white/70" />}
      <div
        className={`absolute inset-x-0 bottom-0 ${featured ? "px-5 pt-4 pb-5" : "px-3 pt-2.5 pb-3"}`}
        style={{ background: category.color, color: textOn(category.color) }}
      >
        {featured && <p className="font-mono text-xs">em alta</p>}
        <p className={`display ${featured ? "mt-1 text-5xl sm:text-6xl" : "text-2xl sm:text-[28px]"}`}>{category.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px]">{categorySize(category.id)} músicas</span>
          <TodayDots categoryId={category.id} />
        </div>
      </div>
    </>
  );
}
