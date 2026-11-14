# Toca Aí

Adivinhe a música do dia.

Jogo diário de adivinhar músicas. Todo dia abre um desafio novo para cada categoria, modo e nível. Os dias anteriores ficam no arquivo e os próximos aparecem trancados.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
```

## Publicar (Vercel)

1. Suba o código para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório e clique em **Deploy**. Não precisa de configuração: a Vercel detecta o Next.js.
3. Opcional: crie a variável `NEXT_PUBLIC_CONTATO` (um `mailto:` ou link) para aparecer no rodapé o contato de quem quiser pedir a remoção de uma música.
4. Se usar um domínio próprio, crie `NEXT_PUBLIC_SITE_URL` (ex.: `https://tocaai.com.br`). Sem ela, o sitemap e os links de compartilhamento usam o domínio de produção da Vercel.

As imagens vêm direto do CDN do Deezer (`images.unoptimized`), o áudio vem direto do Deezer e o link da prévia fica em cache na CDN até perto de expirar: o site gasta pouco do plano gratuito e chama pouco a API do Deezer.

## SEO

Cada categoria e cada modo têm título e descrição próprios. O site gera `sitemap.xml`, `robots.txt` e a imagem de compartilhamento (`opengraph-image`), e a home traz dados estruturados (`VideoGame`). Depois de publicar, cadastre o domínio no [Google Search Console](https://search.google.com/search-console) e envie o sitemap.

## Modos

| Modo | Como funciona | Inspirado em |
| --- | --- | --- |
| Clássico | Trecho de 1s, 2s, 4s, 7s, 11s e 16s | Heardle |
| Ao contrário | Trecho tocado de trás pra frente, cada vez maior | Reverse Heardle |
| Debaixo d'água | Filtro passa-baixa que vai abrindo | Muffled Heardle |
| Capa pixelada | Capa do álbum ganhando resolução | Albumle |
| Relâmpago | 10 músicas, 4 opções, pontos por velocidade | SongPop |
| Qual o ano? | Chute o ano em que a música estava nas paradas | Musiqal |

## Como funciona

- **Catálogo**: `npm run catalog` lê as playlists editoriais do Deezer listadas em `src/data/categories.json` e gera `src/data/catalog.json` (título, artista, capa, popularidade e ano). As playlists "Top Hits AAAA" dão o ano usado nas décadas e no modo "Qual o ano?". Para criar ou mudar uma categoria, edite o JSON e rode o comando de novo.
- **Dificuldade**: cada categoria é ordenada pelo `rank` do Deezer (popularidade). Fácil = 30% mais ouvidas, Médio = de 30% a 65%, Difícil = o resto.
- **Desafio do dia**: o sorteio é determinístico (`src/lib/daily.ts`), então todo mundo recebe a mesma música no mesmo dia, sem banco de dados. Cada modo percorre o pool embaralhado sem repetir até acabar. O dia #1 é `LAUNCH_DATE`. Se você regenerar o catálogo, os sorteios dos dias passados mudam.
- **Áudio**: `/api/preview/[id]` devolve um link novo da prévia de 30s (os links do Deezer expiram). O navegador baixa o MP3 direto do CDN do Deezer, que libera CORS, e a Web Audio API inverte e filtra o som. Se o download direto falhar, `?stream=1` repassa o áudio pelo servidor como plano B.
- **Progresso**: fica no `localStorage` do navegador e é salvo a cada chute.

## Direitos autorais

O projeto não guarda músicas: o catálogo tem só metadados, e o áudio é a prévia de 30 s baixada direto do CDN do Deezer, na hora. Mesmo assim, os [termos da API do Deezer](https://developers.deezer.com/termsofuse) limitam o uso a fins não comerciais e uso privado, e pedem aprovação prévia para usos fora do previsto. Pontos de atenção antes de publicar:

- Inverter e filtrar o áudio (modos Ao contrário e Debaixo d'água) altera o conteúdo, e os termos não preveem isso.
- O plano B `/api/preview/[id]?stream=1` repassa o áudio pelo nosso domínio (só é usado se o download direto falhar).
- Qualquer monetização (anúncios, assinatura) exige acordo com o Deezer ou licença das gravadoras e editoras.
