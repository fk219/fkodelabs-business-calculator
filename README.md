# fkodelabs-business-calculator

Zero-dependency TypeScript helpers for two everyday UAE business sums:

- **VAT**: add or remove the 5% standard rate, rounded to the fils, with `net + vat === gross` guaranteed.
- **Corporate Tax**: estimate tax under the basic rule, 0% on taxable income up to AED 375,000 and 9% on the portion above it.

**Live demo:** https://fk219.github.io/fkodelabs-business-calculator/

> ⚠️ **Not tax advice.** This package estimates the basic statutory rules only. It does not model zero-rated or exempt VAT supplies, Small Business Relief, Qualifying Free Zone Persons, exempt persons, tax losses, tax groups, or rules for large multinational groups. Laws and guidance change. Confirm with the [Federal Tax Authority](https://tax.gov.ae) or a registered tax agent before filing, invoicing or pricing.

## Install

```bash
npm install github:fk219/fkodelabs-business-calculator
```

Or copy `dist/index.js` into your project. It has no dependencies and works in Node 18+ and modern browsers as an ES module.

## Usage

```ts
import { addVat, removeVat, estimateCorporateTax, formatAed } from "fkodelabs-business-calculator";

addVat(1000);
// { net: 1000, vat: 50, gross: 1050, rate: 0.05 }

removeVat(1050);
// { net: 1000, vat: 50, gross: 1050, rate: 0.05 }

addVat(250, { rate: 0 }); // custom rate, e.g. a zero-rated supply
// { net: 250, vat: 0, gross: 250, rate: 0 }

estimateCorporateTax(6_000_000);
// {
//   taxableIncome: 6000000,
//   zeroRatedPortion: 375000,
//   standardRatedPortion: 5625000,
//   tax: 506250,
//   effectiveRate: 0.084375
// }

formatAed(506250); // "AED 506,250.00"
```

### API

| Function | Returns |
| --- | --- |
| `addVat(net, { rate? })` | `{ net, vat, gross, rate }`; `rate` defaults to `0.05` |
| `removeVat(gross, { rate? })` | `{ net, vat, gross, rate }`; `net + vat` always equals `gross` |
| `estimateCorporateTax(taxableIncome, { threshold?, rate? })` | `{ taxableIncome, zeroRatedPortion, standardRatedPortion, tax, effectiveRate }`; defaults are `375000` and `0.09` |
| `roundAed(amount)` | amount rounded to 2 decimal places |
| `formatAed(amount, locale?)` | e.g. `"AED 1,234.50"` |

Constants: `UAE_VAT_STANDARD_RATE` (`0.05`), `UAE_CT_ZERO_RATE_THRESHOLD` (`375000`), `UAE_CT_STANDARD_RATE` (`0.09`).

Amounts are handled in whole fils internally to avoid floating-point drift. Negative, `NaN` or infinite inputs throw.

## Sources

The rates were checked against official UAE sources in October 2026:

- **VAT 5%**: Federal Decree-Law No. 8 of 2017 on Value Added Tax, Article 3 ("a standard rate of 5% shall be imposed on any supply or Import"). [FTA PDF](https://tax.gov.ae/DataFolder/Files/Pdf/VAT-Decree-Law-No-8-of-2017.pdf) · [FTA FAQ: "The standard rate of VAT in the UAE is 5%"](https://tax.gov.ae/en/faq.aspx?keyword=What+is+the+standard+rate+of+VAT+in+the+UAE%3F)
- **Corporate Tax 0% / 9%**: Federal Decree-Law No. 47 of 2022 on the Taxation of Corporations and Businesses, Article 3. [Ministry of Finance PDF](https://mof.gov.ae/wp-content/uploads/2022/12/Federal-Decree-Law-No.-47-of-2022-EN.pdf)
- **AED 375,000 threshold**: Cabinet Decision No. 116 of 2022, Article 2. [FTA PDF](https://tax.gov.ae/Datafolder/Files/Legislation/Corporate%20Tax/Cabinet%20Decision%20No.%20116%20of%202022%20-%20for%20publishing.pdf)
- **Worked example used in the tests** (AED 6,000,000 taxable income gives AED 506,250): FTA Corporate Tax General Guide, Example 1. [FTA PDF](https://tax.gov.ae/DataFolder/Files/Guides/CT/CT%20General%20Guide%20-%20EN%20-%2010%2009%202023.pdf)

## Development

```bash
npm install
npm test   # builds with tsc, copies the bundle into docs/, runs node:test
```

The demo in `docs/` is a single static page served by GitHub Pages.

## Licence

[MIT](LICENSE)

---

Built by **[FKodeLabs](https://www.fkodelabs.com)**, a web and app development studio in Dubai.
