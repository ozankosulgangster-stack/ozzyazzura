CREATE TABLE `inventory` (
	`sku` text PRIMARY KEY NOT NULL,
	`on_hand` integer DEFAULT 0 NOT NULL,
	`reserved` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_adjustments` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`sku`) REFERENCES `inventory`(`sku`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer NOT NULL,
	`status` text DEFAULT 'held' NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku`) REFERENCES `inventory`(`sku`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reservations_order` ON `stock_reservations` (`order_id`);--> statement-breakpoint
CREATE TRIGGER inventory_valid_insert BEFORE INSERT ON inventory
WHEN NEW.on_hand < 0 OR NEW.reserved < 0 OR NEW.reserved > NEW.on_hand
BEGIN SELECT RAISE(ABORT, 'insufficient_stock'); END;
--> statement-breakpoint
CREATE TRIGGER inventory_valid_update BEFORE UPDATE ON inventory
WHEN NEW.on_hand < 0 OR NEW.reserved < 0 OR NEW.reserved > NEW.on_hand
BEGIN SELECT RAISE(ABORT, 'insufficient_stock'); END;
--> statement-breakpoint
CREATE TRIGGER reservation_valid BEFORE INSERT ON stock_reservations
WHEN NEW.quantity <= 0 OR NEW.status != 'held'
BEGIN SELECT RAISE(ABORT, 'invalid_reservation'); END;
--> statement-breakpoint
CREATE TRIGGER reservation_hold AFTER INSERT ON stock_reservations
BEGIN
  UPDATE inventory SET reserved = reserved + NEW.quantity, updated_at = CURRENT_TIMESTAMP WHERE sku = NEW.sku;
END;
--> statement-breakpoint
CREATE TRIGGER reservation_transition BEFORE UPDATE ON stock_reservations
WHEN NEW.sku != OLD.sku OR NEW.quantity != OLD.quantity OR NEW.order_id != OLD.order_id
  OR (NEW.status != OLD.status AND (OLD.status != 'held' OR NEW.status NOT IN ('paid', 'released')))
BEGIN SELECT RAISE(ABORT, 'invalid_reservation_transition'); END;
--> statement-breakpoint
CREATE TRIGGER reservation_pay AFTER UPDATE OF status ON stock_reservations
WHEN OLD.status = 'held' AND NEW.status = 'paid'
BEGIN
  UPDATE inventory SET on_hand = on_hand - NEW.quantity, reserved = reserved - NEW.quantity,
    updated_at = CURRENT_TIMESTAMP WHERE sku = NEW.sku;
END;
--> statement-breakpoint
CREATE TRIGGER reservation_release AFTER UPDATE OF status ON stock_reservations
WHEN OLD.status = 'held' AND NEW.status = 'released'
BEGIN
  UPDATE inventory SET reserved = reserved - NEW.quantity, updated_at = CURRENT_TIMESTAMP WHERE sku = NEW.sku;
END;
--> statement-breakpoint
CREATE TRIGGER inventory_adjust AFTER INSERT ON inventory_adjustments
BEGIN
  UPDATE inventory SET on_hand = on_hand + NEW.delta, updated_at = CURRENT_TIMESTAMP WHERE sku = NEW.sku;
END;

--> statement-breakpoint
INSERT INTO inventory (sku) VALUES ('1:default'), ('2:default'), ('3:default'), ('4:default'), ('5:default'), ('6:default'), ('7:default'), ('8:default'), ('9:default'), ('10:default'), ('11:default'), ('12:default'), ('13:default'), ('14:default'), ('15:default'), ('16:default'), ('17:nero'), ('18:limone'), ('18:nero'), ('18:papavero'), ('19:argento'), ('19:cuoio'), ('19:testa-di-moro'), ('20:cammello'), ('21:cuoio');
