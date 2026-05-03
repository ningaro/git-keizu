import { afterEach, describe, expect, it } from "vitest";

import { getWebviewLocale, t } from "../../web/i18n";

const originalMessages = globalThis.webviewMessages;
const originalLocale = globalThis.webviewLocale;

afterEach(() => {
  globalThis.webviewMessages = originalMessages;
  globalThis.webviewLocale = originalLocale;
});

describe("web i18n helper", () => {
  it("TC-001: returns a translated key with placeholders", () => {
    // Given: webviewMessages contains a template with two placeholders
    globalThis.webviewMessages = { greeting: "Hello {0}, {1}" };

    // When: t is called with arguments
    const result = t("greeting", "Git", "Keizu");

    // Then: placeholders are replaced in order
    expect(result).toBe("Hello Git, Keizu");
  });

  it("TC-002: falls back to the key for missing messages", () => {
    // Given: webviewMessages does not contain the key
    globalThis.webviewMessages = {};

    // When: t is called
    const result = t("missing.key");

    // Then: the key itself is returned
    expect(result).toBe("missing.key");
  });

  it("TC-003: replaces missing placeholder arguments with an empty string", () => {
    // Given: a template references an argument that is not provided
    globalThis.webviewMessages = { missingArg: "Value: {0}/{1}" };

    // When: t is called with only one argument
    const result = t("missingArg", "A");

    // Then: the missing argument is rendered as an empty string
    expect(result).toBe("Value: A/");
  });

  it("TC-004: treats undefined global messages as an empty dictionary", () => {
    // Given: webviewMessages is unavailable
    delete (globalThis as Partial<typeof globalThis>).webviewMessages;

    // When: t is called
    const result = t("fallback.key");

    // Then: the helper falls back to the key
    expect(result).toBe("fallback.key");
  });

  it("TC-005: normalizes locale to ja only when webviewLocale is ja", () => {
    // Given: locale is ja
    globalThis.webviewLocale = "ja";

    // When/Then: ja is returned
    expect(getWebviewLocale()).toBe("ja");

    // Given: locale is not ja
    globalThis.webviewLocale = "en";

    // When/Then: en is returned
    expect(getWebviewLocale()).toBe("en");
  });
});
