import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addVat, removeVat, estimateCorporateTax, roundAed, formatAed,
  UAE_VAT_STANDARD_RATE, UAE_CT_ZERO_RATE_THRESHOLD, UAE_CT_STANDARD_RATE,
} from "../dist/index.js";

test("statutory constants", () => {
  assert.equal(UAE_VAT_STANDARD_RATE, 0.05);
  assert.equal(UAE_CT_ZERO_RATE_THRESHOLD, 375000);
  assert.equal(UAE_CT_STANDARD_RATE, 0.09);
});

test("addVat adds 5% by default", () => {
  assert.deepEqual(addVat(100), { net: 100, vat: 5, gross: 105, rate: 0.05 });
  assert.deepEqual(addVat(0), { net: 0, vat: 0, gross: 0, rate: 0.05 });
});

test("addVat rounds to the fils", () => {
  const r = addVat(19.99); // 0.9995 -> 1.00
  assert.equal(r.vat, 1);
  assert.equal(r.gross, 20.99);
});

test("addVat accepts a custom rate (e.g. zero-rated)", () => {
  assert.deepEqual(addVat(250, { rate: 0 }), { net: 250, vat: 0, gross: 250, rate: 0 });
});

test("removeVat extracts VAT from a gross amount", () => {
  assert.deepEqual(removeVat(105), { net: 100, vat: 5, gross: 105, rate: 0.05 });
  assert.deepEqual(removeVat(1050), { net: 1000, vat: 50, gross: 1050, rate: 0.05 });
});

test("removeVat: net + vat always equals gross", () => {
  for (const gross of [0.01, 1, 9.99, 10, 33.33, 99.99, 123.45, 1000.01, 98765.43]) {
    const r = removeVat(gross);
    assert.equal(Math.round(r.net * 100) + Math.round(r.vat * 100), Math.round(gross * 100), `gross ${gross}`);
  }
});

test("removeVat round-trips addVat", () => {
  for (const net of [1, 10, 99.99, 1234.56, 50000]) {
    assert.equal(removeVat(addVat(net).gross).net, net);
  }
});

test("corporate tax: 0% up to and including AED 375,000", () => {
  assert.equal(estimateCorporateTax(0).tax, 0);
  assert.equal(estimateCorporateTax(200000).tax, 0);
  assert.equal(estimateCorporateTax(375000).tax, 0);
  assert.equal(estimateCorporateTax(0).effectiveRate, 0);
});

test("corporate tax: 9% only on the portion above AED 375,000", () => {
  const r = estimateCorporateTax(375001);
  assert.equal(r.standardRatedPortion, 1);
  assert.equal(r.tax, 0.09);
  assert.equal(estimateCorporateTax(1000000).tax, 56250);
});

test("corporate tax: FTA General Guide Example 1 (AED 6m -> AED 506,250)", () => {
  const r = estimateCorporateTax(6000000);
  assert.equal(r.zeroRatedPortion, 375000);
  assert.equal(r.standardRatedPortion, 5625000);
  assert.equal(r.tax, 506250);
  assert.equal(roundAed(r.effectiveRate * 100), 8.44);
});

test("corporate tax: custom threshold and rate", () => {
  assert.equal(estimateCorporateTax(100, { threshold: 0, rate: 0.09 }).tax, 9);
});

test("input validation", () => {
  assert.throws(() => addVat(-1), RangeError);
  assert.throws(() => addVat(Number.NaN), TypeError);
  assert.throws(() => addVat(10, { rate: 5 }), RangeError);
  assert.throws(() => removeVat(Infinity), TypeError);
  assert.throws(() => estimateCorporateTax(-5), RangeError);
});

test("helpers", () => {
  assert.equal(roundAed(1.005), 1.01);
  assert.equal(formatAed(1234.5), "AED 1,234.50");
});
