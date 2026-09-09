export type ShippingZone = "CA" | "US" | "INTL";

export type ShippingQuote = {
  zone: ShippingZone;
  label: string;
  amountCents: number;
  eta: string;
};

export function calculateShipping(country: string, subtotalCents: number): ShippingQuote {
  const code = country.trim().toUpperCase();
  if (code === "CA") {
    return subtotalCents >= 18000
      ? { zone: "CA", label: "Complimentary Canadian shipping", amountCents: 0, eta: "3–7 business days" }
      : { zone: "CA", label: "Tracked Canadian shipping", amountCents: 1200, eta: "3–7 business days" };
  }
  if (code === "US") {
    return { zone: "US", label: "Tracked shipping to the United States", amountCents: 1800, eta: "5–10 business days" };
  }
  return { zone: "INTL", label: "Tracked international shipping", amountCents: 3200, eta: "7–15 business days" };
}

export function trackingUrl(carrier: string | null, trackingNumber: string | null) {
  if (!carrier || !trackingNumber) return null;
  const number = encodeURIComponent(trackingNumber);
  const key = carrier.trim().toLowerCase();
  if (key.includes("canada")) return `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${number}`;
  if (key.includes("ups")) return `https://www.ups.com/track?loc=en_CA&tracknum=${number}`;
  if (key.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
  if (key.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${number}`;
  return null;
}
