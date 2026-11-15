import { HomeClient } from "@/components/HomeClient";
import { categorySize, hasExplicitContent, trackCount } from "@/lib/catalog.server";
import { categories } from "@/lib/categories";
import { MODES } from "@/lib/modes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "pt-BR", description: SITE_DESCRIPTION },
    {
      "@type": "VideoGame",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "pt-BR",
      genre: ["Música", "Quiz"],
      gamePlatform: "Navegador",
      applicationCategory: "Game",
      operatingSystem: "Qualquer",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
  ],
};

export default function Home() {
  const info = Object.fromEntries(
    categories.map((c) => [c.id, { size: categorySize(c.id), explicit: hasExplicitContent(c.id) }]),
  );
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient info={info} />

      <section className="mt-20 grid gap-10 border-t-2 border-fg pt-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="display text-4xl">Como jogar</h2>
          <p className="mt-4 text-muted">
            O {SITE_NAME} é um jogo de adivinhar música pelo trecho. Todo dia sai um disco novo: em cada categoria
            tem um desafio diferente por modo e por nível, e os dias anteriores ficam no arquivo para jogar depois.
          </p>
          <p className="mt-3 text-muted">
            São {trackCount().toLocaleString("pt-BR")} músicas em {categories.length} categorias, do funk e do
            sertanejo ao rock, ao pop, aos anos 80, 90 e 2000 e aos virais do TikTok. É grátis, não precisa de
            cadastro e funciona no celular.
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {MODES.map((m) => (
            <div key={m.id}>
              <dt className="font-semibold">{m.name}</dt>
              <dd className="mt-1 text-sm text-muted">{m.howTo}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
