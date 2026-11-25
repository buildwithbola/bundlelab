import { NextRequest, NextResponse } from "next/server";
import { normalizePublicShopifyOrigin } from "@/lib/urlGuard";
import { ShopifyProduct, ShopifyVariant } from "@/types/bundle";

interface RawShopifyJsonProduct {
  id: number;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  body_html?: string;
  images?: { src: string }[];
  variants?: {
    id: number;
    title: string;
    price: string;
    compare_at_price: string | null;
    available?: boolean;
    sku?: string;
  }[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toCents(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  const num = Number.parseFloat(priceStr);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const origin = normalizePublicShopifyOrigin(body?.url ?? "");
    const endpoint = `${origin.origin}/products.json?limit=12`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BundleLabCatalogLoader/1.0; +https://bundlelab.vercel.app)",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Storefront responded with HTTP ${res.status}. Some stores disable public /products.json feeds.`,
        },
        { status: 422 }
      );
    }

    const data = (await res.json()) as { products?: RawShopifyJsonProduct[] };
    const rawList = Array.isArray(data?.products) ? data.products : [];

    const normalized: ShopifyProduct[] = [];
    for (const p of rawList) {
      const image = p.images?.[0]?.src;
      if (!image) continue;

      const variants: ShopifyVariant[] = (p.variants ?? [])
        .filter((v) => toCents(v.price) > 0)
        .slice(0, 4)
        .map((v) => {
          const priceCents = toCents(v.price);
          const compareCents = toCents(v.compare_at_price);
          return {
            id: v.id,
            title: v.title === "Default Title" ? "Standard" : v.title,
            priceCents,
            compareAtPriceCents: compareCents > priceCents ? compareCents : null,
            available: v.available !== false,
            sku: v.sku || `IMP-${v.id}`,
          };
        });

      if (variants.length === 0) continue;

      const cleanDesc = stripHtml(p.body_html || "");
      normalized.push({
        id: p.id,
        handle: p.handle,
        title: p.title,
        vendor: p.vendor || origin.hostname.replace(/^www\./, ""),
        category: p.product_type?.trim() || "Catalog",
        tagline: cleanDesc
          ? cleanDesc.slice(0, 68) + (cleanDesc.length > 68 ? "..." : "")
          : `Live Shopify product from ${origin.hostname}`,
        description:
          cleanDesc.slice(0, 260) ||
          `Imported directly from ${origin.origin}/products.json.`,
        highlights: [
          variants.length > 1 ? `${variants.length} Variants` : "Single SKU",
          p.vendor || "Shopify Store",
          "Live Catalog Import",
        ],
        image,
        variants,
      });

      if (normalized.length >= 9) break;
    }

    if (normalized.length === 0) {
      return NextResponse.json(
        {
          error:
            "No purchasable products with images were returned at /products.json. Try another public Shopify storefront.",
        },
        { status: 422 }
      );
    }

    const hostLabel = origin.hostname.replace(/^www\./, "").split(".")[0];
    const storeName = hostLabel.charAt(0).toUpperCase() + hostLabel.slice(1);

    return NextResponse.json({
      storeName,
      origin: origin.origin,
      products: normalized,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timed out after 8 seconds while reaching that Shopify store."
          : err.message
        : "Could not load catalog from that URL.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
