export type Collection = "All" | "Classico" | "Artista" | "Leather";

export const products = [
  { id: 1, name: "Carnevale Bracelet", collection: "Artista", price: 95, image: "/carnevale-bracelets.jpg" },
  { id: 2, name: "Cuore Grande Pendant", collection: "Artista", price: 24.99, image: "/cuore-grande-pendants.jpg" },
  { id: 3, name: "Cuore Piccolo Pendant", collection: "Classico", price: 95, image: "/cuore-piccolo-pendants.jpg" },
  { id: 4, name: "Allegra Bracelet", collection: "Artista", price: 110, image: "/allegra-bracelets.jpg" },
  { id: 5, name: "Trio Necklace", collection: "Classico", price: 145, image: "/co313a-necklace.jpg" },
  { id: 6, name: "Brasilia Necklace", collection: "Classico", price: 44, image: "/brasilia-necklace.jpg" },
  { id: 7, name: "Caterina Necklace", collection: "Classico", price: 44, image: "/caterina-necklace.jpg" },
  { id: 8, name: "Sommerso Necklace", collection: "Artista", price: 245, image: "/sommerso-necklace.jpg" },
  { id: 9, name: "Essenza Perfume Pendant", collection: "Classico", price: 18, image: "/essenza-perfume-pendants.jpg" },
  { id: 10, name: "Laguna Ring", collection: "Artista", price: 15, image: "/laguna-rings.jpg" },
  { id: 11, name: "Passione Ring", collection: "Artista", price: 17, image: "/passione-rings.jpg" },
  { id: 12, name: "Jessica Necklace", collection: "Classico", price: 79, image: "/jessica-necklace.jpg" },
  { id: 13, name: "Mosaico Necklace", collection: "Artista", price: 49.99, image: "/mosaico-necklace.jpg" },
  { id: 14, name: "Asola Bracelet", collection: "Classico", price: 39, image: "/asola-bracelet.jpg" },
  { id: 15, name: "Millefiori Sterling Silver Set", collection: "Artista", price: 49, image: "/millefiori-silver-set.jpg" },
  { id: 16, name: "Space Azure Watch", collection: "Artista", price: 99, image: "/space-azure-watch.jpg" },
  { id: 17, name: "Grazia Leather Handbag", collection: "Leather", price: 159, image: "/grazia-nero.jpg" },
  { id: 18, name: "Ambra Leather Handbag", collection: "Leather", price: 169, image: "/ambra-limone.jpg" },
  { id: 19, name: "Bobbi Leather Bag", collection: "Leather", price: 139, image: "/bobbi-argento.jpg" },
  { id: 20, name: "Lorena Leather Handbag", collection: "Leather", price: 169, image: "/lorena-cammello.jpg" },
  { id: 21, name: "Rina Leather Wallet", collection: "Leather", price: 99, image: "/rina-cuoio.jpg" },
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
