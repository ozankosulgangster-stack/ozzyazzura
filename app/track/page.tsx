import TrackOrder from "./TrackOrder";

export default function TrackPage() {
  return <main className="commerce-page track-page"><header className="commerce-header"><a className="wordmark" href="/">AZZURA</a><nav><a href="/">Shop</a><a href="/account">My account</a></nav></header><section className="track-layout"><div><p className="eyebrow">From our hands to yours</p><h1>Track your order.</h1><p>Enter the order number from your confirmation and the email used at checkout.</p></div><div><TrackOrder /></div></section></main>;
}
