import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countryToDisplayCurrency,
  getDefaultDisplayCurrency,
  isoCountryToDisplayCurrency,
} from "../lib/currency/country-to-display-currency.ts";

describe("countryToDisplayCurrency", () => {
  it("maps Nigeria codes and names to NGN", () => {
    assert.equal(countryToDisplayCurrency("NG"), "NGN");
    assert.equal(countryToDisplayCurrency("NGA"), "NGN");
    assert.equal(countryToDisplayCurrency("nigeria"), "NGN");
  });

  it("maps other countries to USD", () => {
    assert.equal(countryToDisplayCurrency("US"), "USD");
    assert.equal(countryToDisplayCurrency("United Kingdom"), "USD");
  });

  it("returns null for empty input", () => {
    assert.equal(countryToDisplayCurrency(""), null);
    assert.equal(countryToDisplayCurrency(undefined), null);
  });
});

describe("isoCountryToDisplayCurrency", () => {
  it("maps NG to NGN and others to USD", () => {
    assert.equal(isoCountryToDisplayCurrency("NG"), "NGN");
    assert.equal(isoCountryToDisplayCurrency("gb"), "USD");
  });
});

describe("getDefaultDisplayCurrency", () => {
  it("defaults to USD when env unset", () => {
    const prev = process.env.DEFAULT_DISPLAY_CURRENCY;
    delete process.env.DEFAULT_DISPLAY_CURRENCY;
    assert.equal(getDefaultDisplayCurrency(), "USD");
    if (prev) process.env.DEFAULT_DISPLAY_CURRENCY = prev;
  });
});
