export type WebviewLocale = "en" | "ja" | "ru";

export function getWebviewLocale(): WebviewLocale {
  if (globalThis.webviewLocale === "ja") {
    return "ja";
  }
  if (globalThis.webviewLocale === "ru") {
    return "ru";
  }
  return "en";
}

export function t(key: string, ...args: (string | number)[]): string {
  const template = getMessages()[key] ?? key;
  return template.replace(/\{(\d+)\}/g, (_match, index: string) => {
    const value = args[Number.parseInt(index, 10)];
    return value === undefined ? "" : String(value);
  });
}

function getMessages(): Record<string, string> {
  return typeof globalThis.webviewMessages === "object" && globalThis.webviewMessages !== null
    ? globalThis.webviewMessages
    : {};
}
