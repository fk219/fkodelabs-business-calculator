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
export declare const UAE_VAT_STANDARD_RATE = 0.05;
/** 0% band ceiling for UAE Corporate Tax: AED 375,000 (Cabinet Decision No. 116 of 2022, Article 2). */
export declare const UAE_CT_ZERO_RATE_THRESHOLD = 375000;
/** UAE Corporate Tax rate above the threshold: 9% (Federal Decree-Law No. 47 of 2022, Article 3). */
export declare const UAE_CT_STANDARD_RATE = 0.09;
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
/** Rounds an AED amount to 2 decimal places (fils). */
export declare function roundAed(aed: number): number;
/**
 * Adds VAT to a net (VAT-exclusive) amount.
 * @example addVat(100) // { net: 100, vat: 5, gross: 105, rate: 0.05 }
 */
export declare function addVat(net: number, options?: VatOptions): VatBreakdown;
/**
 * Removes VAT from a gross (VAT-inclusive) amount.
 * net + vat always equals gross exactly (to the fils).
 * @example removeVat(105) // { net: 100, vat: 5, gross: 105, rate: 0.05 }
 */
export declare function removeVat(gross: number, options?: VatOptions): VatBreakdown;
/**
 * Estimates UAE Corporate Tax under the basic rule:
 * 0% on taxable income up to AED 375,000 and 9% on the portion above it.
 *
 * Does NOT model Small Business Relief, Qualifying Free Zone Persons,
 * exempt persons, losses, groups, or large-multinational (Pillar Two) rules.
 *
 * @example estimateCorporateTax(6_000_000).tax // 506250
 */
export declare function estimateCorporateTax(taxableIncome: number, options?: CorporateTaxOptions): CorporateTaxEstimate;
/** Formats an AED amount, e.g. formatAed(1234.5) -> "AED 1,234.50". */
export declare function formatAed(aed: number, locale?: string): string;
