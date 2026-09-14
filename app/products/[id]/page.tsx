import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, productById, stockSku, variantsForProduct } from "@/lib/catalog";
import { readInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";
export default async function ProductPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ colour?: string }>;
}) {
  const product = productById(Number((await params).id));
  if (!product) notFound();
  const variants = variantsForProduct(product.id);
  const requested = (await searchParams).colour;
  const variant = variants.find((item) => item.id === requested) ?? variants[0];
  if (requested && !variants.some((item) => item.id === requested)) notFound();
  const inventory = await readInventory().catch(() => null);
  const available = inventory?.find((row) => row.sku === stockSku(product.id, variant?.id))?.available;
  return <main className="commerce-page">
    <header className="commerce-header"><Link className="wordmark" href="/">AZZURA</Link><Link href="/#collections">Shop the collection</Link></header>
    <section className="product-detail">
      <img src={variant?.image ?? product.image} alt={`${product.name}${variant ? ` — ${variant.label}` : ""}`} />
      <div><p className="eyebrow">{product.collection}</p><h1>{product.name}</h1><p>{formatPrice(product.price)}</p>
        {variant && <p>Colour: {variant.label}</p>}
        {variants.length > 1 && <nav aria-label="Product colours">{variants.map((item) => <Link key={item.id} href={`/products/${product.id}?colour=${item.id}`} aria-current={item.id === variant?.id ? "page" : undefined}>{item.label}</Link>)}</nav>}
        <p>{available === undefined ? "Stock availability is temporarily unavailable." : available > 0 ? "In stock" : "Sold out"}</p>
        {available !== undefined && available > 0 && <Link className="primary-cta" href={`/?product=${product.id}${variant ? `&colour=${variant.id}` : ""}#product-${product.id}`}>Choose quantity in the shop</Link>}
        <p><Link href="/return-policy">Shipping and returns</Link></p>
      </div>
    </section>
  </main>;
}
