import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy — Ozzy Azzura",
  description: "Return eligibility, timing, shipping costs, and refund information for Ozzy Azzura orders.",
  alternates: { canonical: "/return-policy" },
};

export default function ReturnPolicyPage() {
  return <main className="commerce-page policy-page">
    <header className="commerce-header"><a className="wordmark" href="/">AZZURA</a><nav><a href="/">Shop</a><a href="/#contact">Contact</a><a href="/track">Track order</a></nav></header>
    <article className="policy-layout">
      <header className="policy-heading">
        <p className="eyebrow">Customer care · Canada</p>
        <h1>Return &amp;<br />refund policy</h1>
        <p>We want you to feel confident choosing Ozzy Azzura. The following policy applies to purchases made directly through our online store.</p>
        <small>Last updated September 10, 2026</small>
      </header>

      <div className="policy-content">
        <section>
          <h2>30-day return window</h2>
          <p>You may request a return within 30 calendar days after your order is delivered. The item must be unused, unworn, unaltered, and returned with its original packaging, tags, accessories, and proof of purchase.</p>
        </section>

        <section>
          <h2>How to start a return</h2>
          <ol>
            <li>Use our <a href="/#contact">contact form</a> and include your name, order number, email address, item, and reason for return.</li>
            <li>Wait for return authorization and the return address before mailing anything.</li>
            <li>Pack the item securely and use a tracked shipping service. Items sent without authorization may not be accepted.</li>
          </ol>
        </section>

        <section>
          <h2>Return shipping and fees</h2>
          <p>Customers are responsible for return shipping costs unless an item arrived damaged, defective, or incorrect. Original delivery charges are not refundable. We do not charge a restocking fee.</p>
        </section>

        <section>
          <h2>Damaged, defective, or incorrect items</h2>
          <p>Contact us as soon as possible, preferably within 7 days of delivery, and include clear photographs of the item and packaging. If we confirm a problem, Ozzy Azzura will arrange a replacement, refund, or return at no additional shipping cost to you.</p>
        </section>

        <section>
          <h2>Items that cannot be returned</h2>
          <p>Personalized or custom-made pieces, gift cards, final-sale items, and pierced earrings for hygiene reasons cannot be returned unless they arrive damaged, defective, or incorrect. If you are unsure whether your item is eligible, contact us before sending it.</p>
        </section>

        <section>
          <h2>Refunds</h2>
          <p>We will inspect your return and email you with the decision, normally within 5 business days of receipt. Approved refunds are issued to the original payment method. Your bank or card provider may require an additional 5–10 business days to post the credit.</p>
        </section>

        <section>
          <h2>Exchanges and cancellations</h2>
          <p>For a different colour or item, return the original purchase and place a new order, subject to availability. To request a cancellation, contact us promptly. We cannot guarantee cancellation after an order has entered processing or shipped.</p>
        </section>

        <section>
          <h2>Your consumer rights</h2>
          <p>This policy does not limit any mandatory rights or remedies available under applicable consumer-protection law.</p>
        </section>

        <div className="policy-contact">
          <p className="eyebrow">Need help?</p>
          <h2>Start with a note.</h2>
          <p>Tell us about your order and we’ll provide the next steps and return address.</p>
          <a href="/#contact">Contact Azzura <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>
    <footer className="policy-footer"><a className="wordmark footer-mark" href="/">AZZURA</a><p>Murano glass from Venice<br />Leather from Florence</p><nav><a href="/">Shop</a><a href="/#contact">Contact</a><a href="/return-policy" aria-current="page">Returns &amp; refunds</a></nav><p>© 2026 Ozzy Azzura</p></footer>
  </main>;
}
