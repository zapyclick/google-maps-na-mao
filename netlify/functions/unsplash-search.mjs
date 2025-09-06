// netlify/functions/unsplash-search.mjs

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim();
    const page = url.searchParams.get('page') || '1';
    const per_page = Math.min(Number(url.searchParams.get('per_page') || '12'), 30);

    if (!q) {
      return new Response(JSON.stringify({ error: 'Parâmetro de busca (q) ausente' }), {
        status: 400,
        headers: jsonHeaders(),
      });
    }

    // Ler a chave do ambiente (definida no Netlify)
    const UNSPLASH_KEY =
      (typeof Netlify !== 'undefined' && Netlify.env && Netlify.env.get)
        ? Netlify.env.get('UNSPLASH_ACCESS_KEY')
        : process.env.UNSPLASH_ACCESS_KEY;

    if (!UNSPLASH_KEY) {
      return new Response(JSON.stringify({ error: 'Chave do Unsplash não configurada no ambiente' }), {
        status: 500,
        headers: jsonHeaders(),
      });
    }

    // Fazer chamada à API do Unsplash
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      q
    )}&page=${page}&per_page=${per_page}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Client-ID ${KBW9bmH_7GwSA7phZx06SDUcQ4ZCatAmFFjCL5PLgLI}`,
        'Accept-Version': 'v1',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: `Erro Unsplash ${res.status}`, details: text }),
        { status: 502, headers: jsonHeader
