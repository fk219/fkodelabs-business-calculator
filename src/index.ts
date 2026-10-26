/**
 * fkodelabs-business-calculator
 * Zero-dependency UAE VAT and Corporate Tax helpers.
 *
 * NOT TAX ADVICE. These are simple estimates of the basic statutory rules.
 * See README.md for sources and limitations.
 *
 * Built by FKodeLabs (https://www.fkodelabs.com).
 */

/** UAE standard VAT rate: 5% (Federal Decree-Law No. 8 of 2017, Article 3). */
export const UAE_VAT_STANDARD_RATE = 0.05;

/** 0% band ceiling for UAE Corporate Tax: AED 375,000 (Cabinet Decision No. 116 of 2022, Article 2). */
export const UAE_CT_ZERO_RATE_THRESHOLD = 375_000;

/** UAE Corporate Tax rate above the threshold: 9% (Federal Decree-Law No. 47 of 2022, Article 3). */
export const UAE_CT_STANDARD_RATE = 0.09;

export interface VatBreakdown {
  /** Amount excluding VAT, in AED. */
  net: number;
  /** VAT amount, in AED. */
  vat: number;
  /** Amount including VAT, in AED. */
  gross: number;
  /** Rate used, e.g. 0.05. */
  rate: number;
}

export interface VatOptions {
  /** VAT rate as a fraction. Defaults to 0.05 (5%). */
  rate?: number;
}

export interface CorporateTaxOptions {
  /** Ceiling of the 0% band in AED. Defaults to 375,000. */
  threshold?: number;
  /** Rate applied above the threshold. Defaults to 0.09 (9%). */
  rate?: number;
}

export interface CorporateTaxEstimate {
  /** Taxable income used for the estimate, in AED. */
  taxableIncome: number;
  /** Portion taxed at 0%, in AED. */
  zeroRatedPortion: number;
  /** Portion taxed at the standard rate, in AED. */
  standardRatedPortion: number;
  /** Estimated Corporate Tax payable, in AED. */
  tax: number;
  /** tax / taxableIncome (0 when taxableIncome is 0). */
  effectiveRate: number;
}

function assertAmount(name: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  if (value < 0) {
    throw new RangeError(`${name} must not be negative`);
  }
}

function assertRate(name: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be a fraction between 0 and 1 (e.g. 0.05 for 5%)`);
  }
}

/** Converts AED to whole fils (1 AED = 100 fils), rounding half away from zero. */
function toFils(aed: number): number {
  return Math.round((aed + Number.EPSILON) * 100);
}

function fromFils(fils: number): number {
  return fils / 100;
}

/** Rounds an AED amount to 2 decimal places (fils). */
export function roundAed(aed: number): number {
  return fromFils(toFils(aed));
}

/**
 * Adds VAT to a net (VAT-exclusive) amount.
 * @example addVat(100) // { net: 100, vat: 5, gross: 105, rate: 0.05 }
 */
export function addVat(net: number, options: VatOptions = {}): VatBreakdown {
  const rate = options.rate ?? UAE_VAT_STANDARD_RATE;
  assertAmount("net", net);
  assertRate("rate", rate);
  const netFils = toFils(net);
  const vatFils = Math.round(netFils * rate);
  return { net: fromFils(netFils), vat: fromFils(vatFils), gross: fromFils(netFils + vatFils), rate };
}

/**
 * Removes VAT from a gross (VAT-inclusive) amount.
 * net + vat always equals gross exactly (to the fils).
 * @example removeVat(105) // { net: 100, vat: 5, gross: 105, rate: 0.05 }
 */
export function removeVat(gross: number, options: VatOptions = {}): VatBreakdown {
  const rate = options.rate ?? UAE_VAT_STANDARD_RATE;
  assertAmount("gross", gross);
  assertRate("rate", rate);
  const grossFils = toFils(gross);
  const netFils = Math.round(grossFils / (1 + rate));
  return { net: fromFils(netFils), vat: fromFils(grossFils - netFils), gross: fromFils(grossFils), rate };
}

/**
 * Estimates UAE Corporate Tax under the basic rule:
 * 0% on taxable income up to AED 375,000 and 9% on the portion above it.
 *
 * Does NOT model Small Business Relief, Qualifying Free Zone Persons,
 * exempt persons, losses, groups, or large-multinational (Pillar Two) rules.
 *
 * @example estimateCorporateTax(6_000_000).tax // 506250
 */
export function estimateCorporateTax(
  taxableIncome: number,
  options: CorporateTaxOptions = {},
): CorporateTaxEstimate {
  const threshold = options.threshold ?? UAE_CT_ZERO_RATE_THRESHOLD;
  const rate = options.rate ?? UAE_CT_STANDARD_RATE;
  assertAmount("taxableIncome", taxableIncome);
  assertAmount("threshold", threshold);
  assertRate("rate", rate);
  const incomeFils = toFils(taxableIncome);
  const thresholdFils = toFils(threshold);
  const zeroFils = Math.min(incomeFils, thresholdFils);
  const standardFils = incomeFils - zeroFils;
  const taxFils = Math.round(standardFils * rate);
  return {
    taxableIncome: fromFils(incomeFils),
    zeroRatedPortion: fromFils(zeroFils),
    standardRatedPortion: fromFils(standardFils),
    tax: fromFils(taxFils),
    effectiveRate: incomeFils === 0 ? 0 : taxFils / incomeFils,
  };
}

/** Formats an AED amount, e.g. formatAed(1234.5) -> "AED 1,234.50". */
export function formatAed(aed: number, locale = "en-AE"): string {
  return `AED ${aed.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
