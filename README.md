# Store

Next.js 16 storefront for sealed Japanese Pokémon TCG booster boxes (singles coming): landing page, about, shop/categories/product pages, markdown blog, cart, Stripe Checkout, and an email interest list with a first-visit popup.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Stripe test keys + ADMIN_TOKEN
npm run dev
```

Stripe webhooks locally (needs the [Stripe CLI](https://docs.stripe.com/stripe-cli)):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Where things live

| What                      | Where                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Store name, tagline, nav  | `src/lib/site.ts`                                                                    |
| Products & categories     | `src/lib/products.ts` (`kind: "sealed"` or `"single"`; images in `public/products/`) |
| Signup notification email | `src/lib/mailer.ts` (SMTP settings in `.env.local`)                                  |
| Blog posts                | `content/blog/*.md` (front matter: `title`, `date`, `excerpt`)                       |
| Email popup               | `src/components/EmailPopup.tsx`                                                      |
| Database (SQLite)         | `src/lib/db.ts` → `data/store.db` (tables: `subscribers`, `orders`, `order_items`)   |
| Subscribers / orders      | `src/lib/subscribers.ts`, `src/lib/orders.ts`                                        |
| Export email list         | `curl -H "Authorization: Bearer $ADMIN_TOKEN" localhost:3000/api/subscribers`        |
| Checkout / webhook        | `src/app/api/checkout`, `src/app/api/webhooks/stripe`                                |

## Before launch

- Set `ALWAYS_SHOW = false` in `src/components/EmailPopup.tsx` (currently on for testing).
- Back up `data/store.db` regularly (e.g. `sqlite3 data/store.db ".backup backup.db"`). For multiple servers or serverless hosts, move to Postgres.
- Sync subscribers to an email provider (Resend, Mailchimp, Klaviyo…) to actually send campaigns.
- Extend fulfillment in the Stripe webhook (confirmation email, decrement stock). Paid orders are already saved.
- Enable Stripe Tax and configure shipping rates if needed.
- Replace placeholder copy, product photos, privacy policy, and terms.
- Add rate limiting to `/api/subscribe` and `/api/checkout`.
- Set `NEXT_PUBLIC_SITE_URL` to your production domain.
