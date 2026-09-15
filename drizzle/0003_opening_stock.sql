-- Owner confirmed five units of every existing product/colour on 2026-09-15.
-- Record an idempotent adjustment instead of resetting future stock levels.
INSERT INTO inventory_adjustments (id, sku, delta, reason, actor)
SELECT 'opening-2026-09-15:' || sku, sku, 5, 'Opening count: 5 units per product/colour', 'store-owner'
FROM inventory WHERE true
ON CONFLICT(id) DO NOTHING;
