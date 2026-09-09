import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authUserId: text("auth_user_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  stripeCustomerId: text("stripe_customer_id"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("CA"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_customers_auth_user_id").on(table.authUserId),
  index("idx_customers_email").on(table.email),
]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  customerAuthUserId: text("customer_auth_user_id"),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("cad"),
  shippingCountry: text("shipping_country").notNull(),
  shippingProvince: text("shipping_province"),
  shippingPostalCode: text("shipping_postal_code").notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingCarrier: text("tracking_carrier"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_orders_order_number").on(table.orderNumber),
  uniqueIndex("idx_orders_stripe_session_id").on(table.stripeSessionId),
  index("idx_orders_customer_auth_user_id").on(table.customerAuthUserId),
  index("idx_orders_email_created_at").on(table.email, table.createdAt),
  index("idx_orders_status").on(table.status),
]);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
}, (table) => [index("idx_order_items_order_id").on(table.orderId)]);
