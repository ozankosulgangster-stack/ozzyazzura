export type Collection = "All" | "Classico" | "Artista" | "Leather";

export const products = [
  { id: 1, name: "Carnevale Bracelet", collection: "Artista", price: 186.20, image: "/carnevale-bracelets.jpg" },
  { id: 2, name: "Cuore Grande Pendant", collection: "Artista", price: 48.99, image: "/cuore-grande-pendants.jpg" },
  { id: 3, name: "Cuore Piccolo Pendant", collection: "Classico", price: 186.20, image: "/cuore-piccolo-pendants.jpg" },
  { id: 4, name: "Allegra Bracelet", collection: "Artista", price: 215.60, image: "/allegra-bracelets.jpg" },
  { id: 5, name: "Trio Necklace", collection: "Classico", price: 284.20, image: "/co313a-necklace.jpg" },
  { id: 6, name: "Brasilia Necklace", collection: "Classico", price: 86.24, image: "/brasilia-necklace.jpg" },
  { id: 7, name: "Caterina Necklace", collection: "Classico", price: 86.24, image: "/caterina-necklace.jpg" },
  { id: 8, name: "Sommerso Necklace", collection: "Artista", price: 480.20, image: "/sommerso-necklace.jpg" },
  { id: 9, name: "Essenza Perfume Pendant", collection: "Classico", price: 35.28, image: "/essenza-perfume-pendants.jpg" },
  { id: 10, name: "Laguna Ring", collection: "Artista", price: 29.40, image: "/laguna-rings.jpg" },
  { id: 11, name: "Passione Ring", collection: "Artista", price: 33.32, image: "/passione-rings.jpg" },
  { id: 12, name: "Jessica Necklace", collection: "Classico", price: 154.84, image: "/jessica-necklace.jpg" },
  { id: 13, name: "Mosaico Necklace", collection: "Artista", price: 97.99, image: "/mosaico-necklace.jpg" },
  { id: 14, name: "Asola Bracelet", collection: "Classico", price: 76.44, image: "/asola-bracelet.jpg" },
  { id: 15, name: "Millefiori Sterling Silver Set", collection: "Artista", price: 96.04, image: "/millefiori-silver-set.jpg" },
  { id: 16, name: "Space Azure Watch", collection: "Artista", price: 194.04, image: "/space-azure-watch.jpg" },
  { id: 17, name: "Grazia Leather Handbag", collection: "Leather", price: 311.64, image: "/grazia-nero.jpg" },
  { id: 18, name: "Ambra Leather Handbag", collection: "Leather", price: 331.24, image: "/ambra-limone.jpg" },
  { id: 19, name: "Bobbi Leather Bag", collection: "Leather", price: 272.44, image: "/bobbi-argento.jpg" },
  { id: 20, name: "Lorena Leather Handbag", collection: "Leather", price: 331.24, image: "/lorena-cammello.jpg" },
  { id: 21, name: "Rina Leather Wallet", collection: "Leather", price: 194.04, image: "/rina-cuoio.jpg" },
] as const;

export type Product = (typeof products)[number];

export function productById(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}

export function formatPrice(price: number) {
  return `CA$${price.toFixed(Number.isInteger(price) ? 0 : 2)}`;
}

export function cents(price: number) {
  return Math.round(price * 100);
}

export type ColourVariant = { id: string; label: string; image: string };

// Only colours documented in the existing product gallery are offered.
const colourVariants: Record<number, ColourVariant[]> = {
  17: [{ id: "nero", label: "Nero (black)", image: "/grazia-nero.jpg" }],
  18: [
    { id: "limone", label: "Limone (yellow)", image: "/ambra-limone.jpg" },
    { id: "nero", label: "Nero (black)", image: "/ambra-nero.jpg" },
    { id: "papavero", label: "Papavero (orange)", image: "/ambra-papavero.jpg" },
  ],
  19: [
    { id: "argento", label: "Argento (silver)", image: "/bobbi-argento.jpg" },
    { id: "cuoio", label: "Cuoio (tan)", image: "/bobbi-cuoio.jpg" },
    { id: "testa-di-moro", label: "Testa di Moro (brown)", image: "/bobbi-testa-di-moro.jpg" },
  ],
  20: [{ id: "cammello", label: "Cammello (tan)", image: "/lorena-cammello.jpg" }],
  21: [{ id: "cuoio", label: "Cuoio (tan)", image: "/rina-cuoio.jpg" }],
};

export function variantsForProduct(id: number): ColourVariant[] {
  return colourVariants[id] ?? [];
}

export type BagSelection = { id: number; variantId?: string };

export function checkoutLines(cart: BagSelection[]) {
  const lines: Array<BagSelection & { quantity: number }> = [];
  for (const selection of cart) {
    const existing = lines.find((line) => line.id === selection.id && line.variantId === selection.variantId);
    if (existing) existing.quantity += 1;
    else lines.push({ ...selection, quantity: 1 });
  }
  return lines;
}

export function resolveSelection(id: number, variantId?: unknown) {
  const product = productById(id);
  if (!product) return null;
  const variants = variantsForProduct(id);
  const variant = variants.find((candidate) => candidate.id === variantId);
  if (variants.length ? !variant : variantId !== undefined) return null;
  return { product, variant, name: variant ? `${product.name} — ${variant.label}` : product.name };
}

export function stockSku(id: number, variantId?: string) {
  return `${id}:${variantId ?? "default"}`;
}
export const stockCatalog = products.flatMap((product) => {
  const variants = variantsForProduct(product.id);
  return variants.length
    ? variants.map((variant) => ({ sku: stockSku(product.id, variant.id), name: `${product.name} — ${variant.label}` }))
    : [{ sku: stockSku(product.id), name: product.name }];
});
