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
