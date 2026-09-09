"use client";

import { useMemo, useState } from "react";

type Collection = "All" | "Classico" | "Artista" | "Leather";

const products = [
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

const formatPrice = (price: number) => `CA$${price.toFixed(Number.isInteger(price) ? 0 : 2)}`;

export default function Home() {
  const [filter, setFilter] = useState<Collection>("All");
  const [cart, setCart] = useState<number[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCollection = filter === "All" || product.collection === filter;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesCollection && matchesQuery;
  }), [filter, query]);

  const cartItems = cart.map((id) => products.find((product) => product.id === id)!);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  function addToBag(id: number) {
    setCart((items) => [...items, id]);
    setBagOpen(true);
  }

  return (
    <main>
      <div className="announcement">
        <span>Handmade in Murano, Venezia</span>
        <span>Complimentary shipping over CA$180</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Azzura home">AZZURA</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#collections">Shop</a><a href="#classico">Classico</a><a href="#artista">Artista</a><a href="#leather">Leather</a><a href="#atelier">Our Atelier</a>
        </nav>
        <div className="header-tools">
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="Open search">Search</button>
          <button type="button" onClick={() => setBagOpen(true)} aria-label={`Open shopping bag with ${cart.length} items`}>Bag ({cart.length})</button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src="/azzura-hero.png" alt="Cobalt Murano glass vessel and jewel-toned earrings beside the Venetian lagoon" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Venezia · Since 1987</p>
          <h1 id="hero-title">Objects of light,<br />made by hand.</h1>
          <p className="hero-copy">Murano glass accessories shaped in fire, colour, and the quiet rhythm of the lagoon.</p>
          <a className="primary-cta" href="#collections">Discover the collection <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-note" aria-hidden="true"><span>01</span><span className="hero-note-line" /><span>La forma dell’acqua</span></div>
      </section>

      <section className="collection-intro" id="collections">
        <p className="eyebrow">Two expressions, one tradition</p>
        <div className="collection-headline">
          <h2>Classico <i>&amp;</i> Artista</h2>
          <p>Timeless forms meet expressive colour. Each piece passes through the hands of a master glassmaker on the island of Murano.</p>
        </div>
      </section>

      <section className="shop" aria-labelledby="shop-title">
        <div className="shop-header">
          <div><p className="eyebrow">The collection</p><h2 id="shop-title">Wearable light</h2></div>
          <div className="filters" aria-label="Filter products">
            {(["All", "Classico", "Artista", "Leather"] as Collection[]).map((item) => (
              <button key={item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <img src={product.image} alt={product.collection === "Leather" ? `${product.name}, handmade Italian leather` : `${product.name}, handmade Murano glass`} />
                <button type="button" className="quick-add" onClick={() => addToBag(product.id)}>Add to bag <span aria-hidden="true">+</span></button>
              </div>
              <div className="product-meta">
                <div><h3>{product.name}</h3><p>{product.collection}</p></div><span>{formatPrice(product.price)}</span>
              </div>
            </article>
          ))}
        </div>
        {visibleProducts.length === 0 && <p className="empty-results">No pieces found. Try another search.</p>}
      </section>

      <section className="duo-panels">
        <article className="collection-panel classico" id="classico">
          <div className="panel-visual"><img src="/caterina-necklace.jpg" alt="Caterina handmade Murano glass necklace" /></div>
          <div className="panel-copy"><p className="eyebrow">01 · Classico</p><h2>Essential forms,<br />enduring colour.</h2><p>Quiet, balanced pieces made for every day—each with the subtle variations that reveal the hand of its maker.</p><button type="button" onClick={() => { setFilter("Classico"); document.querySelector(".shop")?.scrollIntoView(); }}>Shop Classico <span>→</span></button></div>
        </article>
        <article className="collection-panel artista" id="artista">
          <div className="panel-copy"><p className="eyebrow">02 · Artista</p><h2>Colour without<br />compromise.</h2><p>Unexpected forms and vivid combinations, created in small editions for collectors of the singular.</p><button type="button" onClick={() => { setFilter("Artista"); document.querySelector(".shop")?.scrollIntoView(); }}>Shop Artista <span>→</span></button></div>
          <div className="panel-visual"><img src="/sommerso-necklace.jpg" alt="Sommerso handmade Murano glass necklace" /></div>
        </article>
      </section>

      <section className="leather-story" id="leather" aria-labelledby="leather-title">
        <div className="leather-copy">
          <p className="eyebrow">Italian leather · Firenze</p>
          <h2 id="leather-title">Soft structure,<br />made to travel.</h2>
          <p>Hand-finished in Florence from supple Italian leather. Structured handbags, compact crossbodies, and small accessories made for every day.</p>
          <button type="button" onClick={() => { setFilter("Leather"); document.querySelector(".shop")?.scrollIntoView(); }}>Shop leather <span>→</span></button>
          <div className="leather-prices"><span>Grazia · CA$159</span><span>Ambra · CA$169</span><span>Bobbi · CA$139</span><span>Lorena · CA$169</span><span>Rina · CA$99</span></div>
        </div>
        <div className="leather-gallery" aria-label="Ambra and Grazia leather handbags">
          <figure className="leather-main"><img src="/grazia-nero.jpg" alt="Grazia structured black leather handbag" /><figcaption>Grazia · Nero</figcaption></figure>
          <figure><img src="/ambra-limone.jpg" alt="Ambra leather handbag in Limone yellow" /><figcaption>Ambra · Limone</figcaption></figure>
          <figure><img src="/ambra-nero.jpg" alt="Ambra leather handbag in Nero black" /><figcaption>Ambra · Nero</figcaption></figure>
          <figure><img src="/ambra-papavero.jpg" alt="Ambra leather handbag in Papavero orange" /><figcaption>Ambra · Papavero</figcaption></figure>
        </div>
      </section>

      <section className="leather-newcomers" aria-labelledby="leather-new-title">
        <div className="leather-new-heading">
          <p className="eyebrow">New from Firenze</p>
          <h2 id="leather-new-title">Bags for every rhythm.</h2>
          <p>Bobbi moves lightly from day to evening. Lorena carries more without losing its line. Rina keeps the essentials beautifully close.</p>
        </div>
        <div className="leather-new-grid">
          <figure className="bobbi-feature"><img src="/bobbi-argento.jpg" alt="Bobbi compact leather bag in Argento silver" /><figcaption>Bobbi · Argento</figcaption></figure>
          <figure><img src="/bobbi-cuoio.jpg" alt="Bobbi compact leather bag in Cuoio tan" /><figcaption>Bobbi · Cuoio</figcaption></figure>
          <figure><img src="/bobbi-testa-di-moro.jpg" alt="Bobbi compact leather bag in Testa di Moro brown" /><figcaption>Bobbi · Testa di Moro</figcaption></figure>
          <figure><img src="/lorena-cammello.jpg" alt="Lorena leather handbag in Cammello tan" /><figcaption>Lorena · Cammello</figcaption></figure>
          <figure><img src="/rina-cuoio.jpg" alt="Rina leather wallet in Cuoio tan" /><figcaption>Rina · Cuoio</figcaption></figure>
        </div>
      </section>

      <section className="atelier" id="atelier">
        <div className="atelier-image"><img src="/azzura-hero.png" alt="Murano glass in the light of Venice" /></div>
        <div className="atelier-copy">
          <p className="eyebrow">The human touch</p>
          <h2>Born from fire.<br />Finished by hand.</h2>
          <p>In our Murano atelier, molten glass becomes a personal object. No moulds. No two pieces exactly alike. Just breath, heat, and more than three decades of practiced intuition.</p>
          <a href="#story">Meet our makers <span>→</span></a>
          <blockquote>“Glass remembers every movement. That is what makes it alive.”<cite>— Maestro Luca Bernardi</cite></blockquote>
        </div>
      </section>

      <section className="promises" aria-label="Our promises">
        <div><span>01</span><h3>Made in Murano</h3><p>Crafted entirely by hand on the Venetian island.</p></div>
        <div><span>02</span><h3>Certificate included</h3><p>Every piece arrives with its certificate of origin.</p></div>
        <div><span>03</span><h3>Beautifully wrapped</h3><p>Gift-ready, in recyclable Italian-made packaging.</p></div>
      </section>

      <section className="newsletter" aria-labelledby="newsletter-title">
        <p className="eyebrow">Letters from the lagoon</p><h2 id="newsletter-title">A little Venice,<br />now and then.</h2>
        <p>New pieces, atelier stories, and colour inspiration—sent with restraint.</p>
        <form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="Your email address" required /><button type="submit">Subscribe <span>→</span></button></form>
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#">AZZURA</a>
        <div><p>Murano, Venezia<br />Italia</p><p>Objects of light,<br />made by hand.</p></div>
        <nav aria-label="Footer navigation"><a href="#collections">Shop</a><a href="#atelier">Our story</a><a href="#">Care guide</a><a href="#">Contact</a></nav>
        <div className="footer-end"><p>Instagram&nbsp;&nbsp; Pinterest</p><p>© 2026 Azzura Venezia</p></div>
      </footer>

      {searchOpen && <div className="overlay" role="dialog" aria-modal="true" aria-label="Search products" onClick={() => setSearchOpen(false)}>
        <div className="search-panel" onClick={(event) => event.stopPropagation()}>
          <button className="close" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">×</button>
          <p className="eyebrow">Search Azzura</p><h2>What are you looking for?</h2>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Necklace, bracelet, handbag…" aria-label="Search query" />
          <button className="search-action" type="button" onClick={() => { setSearchOpen(false); document.querySelector(".shop")?.scrollIntoView(); }}>View {visibleProducts.length} pieces →</button>
        </div>
      </div>}

      {bagOpen && <div className="overlay" role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={() => setBagOpen(false)}>
        <aside className="bag-panel" onClick={(event) => event.stopPropagation()}>
          <div className="bag-heading"><div><p className="eyebrow">Your selection</p><h2>Bag ({cart.length})</h2></div><button className="close" type="button" onClick={() => setBagOpen(false)} aria-label="Close bag">×</button></div>
          <div className="bag-items">
            {cartItems.length === 0 ? <div className="empty-bag"><p>Your bag is waiting for something beautiful.</p><button type="button" onClick={() => setBagOpen(false)}>Explore the collection</button></div> : cartItems.map((item, index) => <div className="bag-item" key={`${item.id}-${index}`}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.collection}</p><span>{formatPrice(item.price)}</span></div><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setCart((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
          </div>
          {cartItems.length > 0 && <div className="bag-total"><p><span>Subtotal</span><strong>{formatPrice(total)}</strong></p><button type="button">Checkout <span>→</span></button><small>Shipping calculated at checkout.</small></div>}
        </aside>
      </div>}
    </main>
  );
}
