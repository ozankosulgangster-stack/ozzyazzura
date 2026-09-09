export default async function CheckoutCancel({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="checkout-result"><a className="wordmark" href="/">AZZURA</a><div><p className="eyebrow">Checkout paused</p><h1>Your bag is still yours.</h1><p>No payment was taken. Return to the collection whenever you’re ready.</p>{order && <small>Reference {order}</small>}<div><a href="/">Return to the collection →</a></div></div></main>;
}
