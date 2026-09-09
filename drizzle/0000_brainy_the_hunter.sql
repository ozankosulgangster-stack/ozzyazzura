CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth_user_id` text NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`stripe_customer_id` text,
	`address_line1` text,
	`address_line2` text,
	`city` text,
	`province` text,
	`postal_code` text,
	`country` text DEFAULT 'CA' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customers_auth_user_id` ON `customers` (`auth_user_id`);--> statement-breakpoint
CREATE INDEX `idx_customers_email` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`product_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`quantity` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_auth_user_id` text,
	`email` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`currency` text DEFAULT 'cad' NOT NULL,
	`shipping_country` text NOT NULL,
	`shipping_province` text,
	`shipping_postal_code` text NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`tracking_carrier` text,
	`tracking_number` text,
	`tracking_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_order_number` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_stripe_session_id` ON `orders` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_auth_user_id` ON `orders` (`customer_auth_user_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_email_created_at` ON `orders` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
PRAGMA optimize;
