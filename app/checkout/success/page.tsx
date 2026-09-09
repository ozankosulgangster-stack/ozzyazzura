export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="checkout-result"><a className="wordmark" href="/">AZZURA</a><div><p className="eyebrow">Order received</p><h1>Grazie.</h1><p>Your payment was received. We’ll email your confirmation and tracking details when your order leaves the atelier.</p>{order && <strong>Order {order}</strong>}<div><a href="/account">View my account →</a><a href="/">Continue shopping</a></div></div></main>;
}
