const ALLOWED_ORIGINS = [
  'https://collegefastforward.com',
  'https://www.collegefastforward.com',
];

export function getCORSHeaders(req) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, authorization, x-client-info, apikey',
    'Vary': 'Origin',
  };
}