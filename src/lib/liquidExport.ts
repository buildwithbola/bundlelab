import { MerchantConfig } from "@/types/bundle";

export function generateDiscountFunctionSnippet(config: MerchantConfig): string {
  const tierLines = config.tiers
    .map((t) => `  { minQty: ${t.minItems}, percentOff: ${t.discountPercent} }`)
    .join(",\n");

  return `// Shopify Function: cart_lines_discounts_generate_run.ts
// Validates _bundle_id line properties on Shopify servers so shoppers
// cannot tamper with bundle prices via DevTools.

import { DiscountApplicationStrategy, RunInput } from "../generated/api";

const BUNDLE_TIERS = [
${tierLines}
];

export function cartLinesDiscountsGenerateRun(input: RunInput) {
  const groups = new Map<string, { lineId: string; qty: number }[]>();

  for (const line of input.cart.lines) {
    const bundleId = line.bundleId?.value;
    if (!bundleId) continue;
    const list = groups.get(bundleId) ?? [];
    list.push({ lineId: line.id, qty: line.quantity });
    groups.set(bundleId, list);
  }

  const discounts = [];

  for (const [bundleId, lines] of groups.entries()) {
    const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);
    const matched = [...BUNDLE_TIERS]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => totalQty >= t.minQty);

    if (!matched) continue;

    discounts.push({
      message: \`BundleLab \${matched.percentOff}% OFF (\${bundleId.slice(0, 6)})\`,
      targets: lines.map((l) => ({ cartLine: { id: l.lineId } })),
      value: { percentage: { value: matched.percentOff } },
    });
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts,
  };
}`;
}

export function generateShopifyLiquidSection(config: MerchantConfig): string {
  return `{% comment %}
  BundleLab OS 2.0 Section — Generated for ${config.storeName}
  Drop directly into /sections/bundle-lab.liquid
{% endcomment %}

<section id="bundle-lab-{{ section.id }}" class="bl-section" data-bundle-mode="${config.pricingMode}">
  <style>
    #bundle-lab-{{ section.id }} {
      --bl-emerald: {{ section.settings.primary_color }};
      --bl-mint: {{ section.settings.accent_color }};
      --bl-lime: {{ section.settings.savings_color }};
      font-variant-numeric: tabular-nums;
      padding: 48px 20px;
      background: #F8FAFC;
      color: #0F172A;
    }
    .bl-grid { max-width: 1200px; margin: 0 auto; display: grid; gap: 24px; grid-template-columns: 1fr 380px; }
    .bl-products { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .bl-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; transition: border-color .2s; }
    .bl-card.is-selected { border: 2px solid var(--bl-emerald); }
    .bl-dock { position: sticky; top: 24px; background: #FFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 20px; height: fit-content; }
    .bl-progress { height: 8px; background: #E2E8F0; border-radius: 999px; overflow: hidden; margin: 12px 0; }
    .bl-progress-fill { height: 100%; background: var(--bl-mint); transition: width .35s cubic-bezier(0.22,1,0.36,1); }
    .bl-cta { width: 100%; padding: 14px 18px; border-radius: 12px; border: 0; background: var(--bl-emerald); color: #FFF; font-weight: 700; cursor: pointer; }
    @media (max-width: 960px) { .bl-grid { grid-template-columns: 1fr; } }
  </style>

  <div class="bl-grid">
    <div class="bl-products">
      {% for product in section.settings.collection.products limit: 12 %}
        {% assign v = product.selected_or_first_available_variant %}
        <article class="bl-card" data-variant-id="{{ v.id }}" data-price-cents="{{ v.price }}">
          {% if product.featured_image %}
            <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy" style="width:100%;border-radius:12px;">
          {% endif %}
          <h3>{{ product.title }}</h3>
          <p>{{ v.price | money }}</p>
          <button type="button" data-bl-add="{{ v.id }}">Add to Bundle</button>
        </article>
      {% endfor %}
    </div>

    <aside class="bl-dock">
      <h2>{{ section.settings.heading }}</h2>
      <div class="bl-progress"><div class="bl-progress-fill" data-bl-bar style="width:0%"></div></div>
      <p data-bl-status>Select items to unlock bundle savings</p>
      <button type="button" class="bl-cta" data-bl-submit>Add Bundle to Cart</button>
    </aside>
  </div>

  <script>
    (() => {
      const root = document.getElementById('bundle-lab-{{ section.id }}');
      const items = new Map();
      const bundleId = 'bl_' + Date.now();

      root.querySelectorAll('[data-bl-add]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.blAdd);
          items.set(id, (items.get(id) || 0) + 1);
          const count = [...items.values()].reduce((a, b) => a + b, 0);
          root.querySelector('[data-bl-bar]').style.width = Math.min(100, count * 25) + '%';
          root.querySelector('[data-bl-status]').textContent = count + ' items selected in bundle';
        });
      });

      root.querySelector('[data-bl-submit]').addEventListener('click', async () => {
        if (!items.size) return;
        const payload = {
          items: [...items.entries()].map(([id, quantity]) => ({
            id,
            quantity,
            properties: { _bundle_id: bundleId, _bundle_name: '{{ section.settings.heading | escape }}' }
          }))
        };
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        window.location.href = '/cart';
      });
    })();
  </script>
</section>

{% schema %}
{
  "name": "BundleLab Builder",
  "settings": [
    { "type": "text", "id": "heading", "label": "Dock Heading", "default": "Build Your Bundle" },
    { "type": "collection", "id": "collection", "label": "Bundle Collection" },
    { "type": "color", "id": "primary_color", "label": "Primary Brand", "default": "#004C3F" },
    { "type": "color", "id": "accent_color", "label": "Interactive Accent", "default": "#34D399" },
    { "type": "color", "id": "savings_color", "label": "Savings Highlight", "default": "#A3E635" }
  ],
  "presets": [{ "name": "BundleLab Builder" }]
}
{% endschema %}
`;
}
