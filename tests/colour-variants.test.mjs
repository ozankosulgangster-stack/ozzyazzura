import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../lib/catalog.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { checkoutLines, resolveSelection } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('keeps different colours separate and combines repeated selections', () => {
  assert.deepEqual(checkoutLines([{ id: 18, variantId: 'nero' }, { id: 18, variantId: 'limone' }, { id: 18, variantId: 'nero' }]), [
    { id: 18, variantId: 'nero', quantity: 2 }, { id: 18, variantId: 'limone', quantity: 1 },
  ]);
});
test('validates product colour combinations and retains colour in order names', () => {
  assert.equal(resolveSelection(18, 'nero').name, 'Ambra Leather Handbag — Nero (black)');
  assert.equal(resolveSelection(19, 'cuoio').variant.image, '/bobbi-cuoio.jpg');
  assert.equal(resolveSelection(18, 'argento'), null);
  assert.equal(resolveSelection(18), null);
  assert.equal(resolveSelection(1, 'nero'), null);
  assert.equal(resolveSelection(999), null);
  assert.equal(resolveSelection(1).name, 'Carnevale Bracelet');
});
