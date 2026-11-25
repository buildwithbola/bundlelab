const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /\.local$/i,
  /\.internal$/i,
];

export function normalizePublicShopifyOrigin(rawInput: string): URL {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Please enter a Shopify store domain (e.g. allbirds.com).");
  }

  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProto);
  } catch {
    throw new Error("That does not look like a valid store URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only HTTP/HTTPS storefront URLs are supported.");
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.includes(".") || PRIVATE_HOST_PATTERNS.some((rx) => rx.test(host))) {
    throw new Error("Private, local, or internal addresses are blocked.");
  }

  return new URL(`https://${host}`);
}
