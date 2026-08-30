"use client";

import { useMemo, useState } from "react";

type Collection = "All" | "Classico" | "Artista";

const products = [
  { id: 1, name: "Acqua Pendant", collection: "Classico", price: 145, image: "/acqua-pendant.png", position: "center" },
  { id: 2, name: "Laguna Earrings", collection: "Artista", price: 175, image: "/laguna-earrings.png", position: "center" },
  { id: 3, name: "Riva Pendant", collection: "Classico", price: 155, image: "/acqua-pendant.png", position: "54% 66%" },
  { id: 4, name: "Fuoco Earrings", collection: "Artista", price: 185, image: "/laguna-earrings.png", position: "58% 42%" },
] as const;

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
        <span>Complimentary shipping over €180</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Azzura home">AZZURA</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#collections">Shop</a><a href="#classico">Classico</a><a href="#artista">Artista</a><a href="#atelier">Our Atelier</a>
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
            {(["All", "Classico", "Artista"] as Collection[]).map((item) => (
              <button key={item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className={`product-card ${product.id > 2 ? "alternate-crop" : ""}`} key={product.id}>
              <div className="product-image-wrap">
                <img src={product.image} style={{ objectPosition: product.position }} alt={`${product.name}, handmade Murano glass`} />
                <button type="button" className="quick-add" onClick={() => addToBag(product.id)}>Add to bag <span aria-hidden="true">+</span></button>
              </div>
              <div className="product-meta">
                <div><h3>{product.name}</h3><p>{product.collection}</p></div><span>€{product.price}</span>
              </div>
            </article>
          ))}
        </div>
        {visibleProducts.length === 0 && <p className="empty-results">No pieces found. Try another search.</p>}
      </section>

      <section className="duo-panels">
        <article className="collection-panel classico" id="classico">
          <div className="panel-visual"><img src="/acqua-pendant.png" alt="Blue glass Acqua pendant" /></div>
          <div className="panel-copy"><p className="eyebrow">01 · Classico</p><h2>Essential forms,<br />enduring colour.</h2><p>Quiet, balanced pieces made for every day—each with the subtle variations that reveal the hand of its maker.</p><button type="button" onClick={() => { setFilter("Classico"); document.querySelector(".shop")?.scrollIntoView(); }}>Shop Classico <span>→</span></button></div>
        </article>
        <article className="collection-panel artista" id="artista">
          <div className="panel-copy"><p className="eyebrow">02 · Artista</p><h2>Colour without<br />compromise.</h2><p>Unexpected forms and vivid combinations, created in small editions for collectors of the singular.</p><button type="button" onClick={() => { setFilter("Artista"); document.querySelector(".shop")?.scrollIntoView(); }}>Shop Artista <span>→</span></button></div>
          <div className="panel-visual"><img src="/laguna-earrings.png" alt="Cobalt and amber glass earrings" /></div>
        </article>
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
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pendant, earrings…" aria-label="Search query" />
          <button className="search-action" type="button" onClick={() => { setSearchOpen(false); document.querySelector(".shop")?.scrollIntoView(); }}>View {visibleProducts.length} pieces →</button>
        </div>
      </div>}

      {bagOpen && <div className="overlay" role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={() => setBagOpen(false)}>
        <aside className="bag-panel" onClick={(event) => event.stopPropagation()}>
          <div className="bag-heading"><div><p className="eyebrow">Your selection</p><h2>Bag ({cart.length})</h2></div><button className="close" type="button" onClick={() => setBagOpen(false)} aria-label="Close bag">×</button></div>
          <div className="bag-items">
            {cartItems.length === 0 ? <div className="empty-bag"><p>Your bag is waiting for something beautiful.</p><button type="button" onClick={() => setBagOpen(false)}>Explore the collection</button></div> : cartItems.map((item, index) => <div className="bag-item" key={`${item.id}-${index}`}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.collection}</p><span>€{item.price}</span></div><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setCart((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
          </div>
          {cartItems.length > 0 && <div className="bag-total"><p><span>Subtotal</span><strong>€{total}</strong></p><button type="button">Checkout <span>→</span></button><small>Shipping calculated at checkout.</small></div>}
        </aside>
      </div>}
    </main>
  );
}
