"use client";

import { useMemo, useState } from "react";
import { type Collection, formatPrice, products } from "@/lib/catalog";
import { calculateShipping } from "@/lib/shipping";
import ContactForm from "./ContactForm";
import SubscribeForm from "./SubscribeForm";

export default function Home() {
  const [filter, setFilter] = useState<Collection>("All");
  const [cart, setCart] = useState<number[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [shippingCountry, setShippingCountry] = useState("CA");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCollection = filter === "All" || product.collection === filter;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesCollection && matchesQuery;
  }), [filter, query]);

  const cartItems = cart.map((id) => products.find((product) => product.id === id)!);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shippingQuote = calculateShipping(shippingCountry, Math.round(total * 100));

  function addToBag(id: number) {
    setCart((items) => [...items, id]);
    setBagOpen(true);
  }

  async function beginCheckout() {
    if (!checkoutEmail.trim() || !shippingPostalCode.trim()) {
      setCheckoutError("Add your email and postal code to continue.");
      return;
    }

    const quantities = cart.reduce<Record<number, number>>((result, id) => {
      result[id] = (result[id] ?? 0) + 1;
      return result;
    }, {});

    setCheckoutPending(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: checkoutEmail.trim(),
          items: Object.entries(quantities).map(([id, quantity]) => ({ id: Number(id), quantity })),
          shipping: { country: shippingCountry, postalCode: shippingPostalCode.trim() },
        }),
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Checkout could not be started.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout could not be started.");
      setCheckoutPending(false);
    }
  }

  return (
    <main>
      <div className="announcement">
        <span>Murano glass from Venice · Leather from Florence</span>
        <span>Complimentary shipping over CA$180</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Azzura home">AZZURA</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#collections">Shop</a><a href="#classico">Classico</a><a href="#artista">Artista</a><a href="#leather">Leather</a><a href="#story">Our story</a><a href="#contact">Contact</a>
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
          <p className="hero-copy">Murano glass shaped in Venice and Italian leather finished in Florence—two traditions, made by hand.</p>
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

      <section className="our-story" id="story" aria-labelledby="story-title">
        <div className="story-heading">
          <p className="eyebrow">Our story · Italy to North America</p>
          <h2 id="story-title">Design, chosen<br />with care.</h2>
        </div>
        <div className="story-copy">
          <p>We believe thoughtful design should make everyday life feel more considered. Azzura works with designers and specialist suppliers across Italy, selecting pieces for their beauty, craft, and lasting quality.</p>
          <p>Every collection is carefully curated—from Murano glass shaped in Venice to leather goods finished in Florence—so exceptional Italian design can be enjoyed at a reasonable price.</p>
          <p className="story-mission">Our mission is simple: bring the best of Italian design and quality to North America, with personal service that makes every purchase feel special.</p>
        </div>
        <div className="story-values">
          <div><span>01</span><h3>Design first</h3><p>Distinctive forms selected for beauty, function, and longevity.</p></div>
          <div><span>02</span><h3>Italian partnerships</h3><p>Trusted relationships with designers and specialist makers throughout Italy.</p></div>
          <div><span>03</span><h3>Considered value</h3><p>Excellent materials and workmanship at prices made for real life.</p></div>
        </div>
      </section>

      <section className="promises" aria-label="Our promises">
        <div><span>01</span><h3>Glass from Venice</h3><p>Murano glass crafted by hand on the Venetian island.</p></div>
        <div><span>02</span><h3>Leather from Florence</h3><p>Italian leather bags and accessories finished by Florentine artisans.</p></div>
        <div><span>03</span><h3>Beautifully wrapped</h3><p>Gift-ready, with origin details in recyclable Italian-made packaging.</p></div>
      </section>

      <section className="newsletter" aria-labelledby="newsletter-title">
        <p className="eyebrow">Letters from the lagoon</p><h2 id="newsletter-title">A little Venice,<br />now and then.</h2>
        <p>New pieces, atelier stories, and colour inspiration—sent with restraint.</p>
        <SubscribeForm />
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div><p className="eyebrow">Connect with Azzura</p><h2 id="contact-title">Let’s talk<br />Italian design.</h2><p>Questions about a piece, an order, or our collections? Send us a note and we’ll respond personally.</p></div>
        <ContactForm />
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#">AZZURA</a>
        <div><p>Murano, Venezia<br />Firenze, Toscana</p><p>Italian craft,<br />made by hand.</p></div>
        <nav aria-label="Footer navigation"><a href="#collections">Shop</a><a href="#story">Our story</a><a href="#contact">Contact</a><a href="/return-policy">Returns &amp; refunds</a><a href="/track">Track order</a><a href="/account">My account</a></nav>
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
          {cartItems.length > 0 && <div className="bag-total">
            <div className="checkout-fields">
              <label>Email<input type="email" value={checkoutEmail} onChange={(event) => setCheckoutEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
              <div><label>Destination<select value={shippingCountry} onChange={(event) => setShippingCountry(event.target.value)}><option value="CA">Canada</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="IT">Italy</option><option value="FR">France</option><option value="DE">Germany</option><option value="ES">Spain</option><option value="AU">Australia</option><option value="JP">Japan</option></select></label><label>Postal code<input value={shippingPostalCode} onChange={(event) => setShippingPostalCode(event.target.value)} autoComplete="postal-code" placeholder="Postal code" required /></label></div>
            </div>
            <p><span>Subtotal</span><strong>{formatPrice(total)}</strong></p>
            <p className="shipping-line"><span>{shippingQuote.label}<small>{shippingQuote.eta}</small></span><strong>{shippingQuote.amountCents === 0 ? "Free" : formatPrice(shippingQuote.amountCents / 100)}</strong></p>
            <p className="checkout-total"><span>Total</span><strong>{formatPrice(total + shippingQuote.amountCents / 100)}</strong></p>
            {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
            <button type="button" onClick={beginCheckout} disabled={checkoutPending}>{checkoutPending ? "Opening secure checkout…" : "Secure checkout"}<span>→</span></button>
            <small>Payments are securely processed by Stripe.</small>
          </div>}
        </aside>
      </div>}
    </main>
  );
}
