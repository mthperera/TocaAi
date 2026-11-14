export const SITE_NAME = "Toca Aí";

export const SITE_DESCRIPTION =
  "Jogo de adivinhar música: ouça um trecho e descubra qual é a música. Desafio novo todo dia com funk, sertanejo, pop, rock, pagode, anos 80, 90, 2000 e os virais do TikTok. Grátis e sem cadastro.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
