// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../web/dialogs", () => ({
  showCheckboxDialog: vi.fn(),
  showConfirmationDialog: vi.fn(),
  showRefInputDialog: vi.fn()
}));

vi.mock("../../web/utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../web/utils")>();
  return {
    escapeHtml: original.escapeHtml,
    sendMessage: vi.fn(),
    ELLIPSIS: original.ELLIPSIS
  };
});

import { showCheckboxDialog, showConfirmationDialog, showRefInputDialog } from "../../web/dialogs";
import { buildStashContextMenuItems } from "../../web/stashMenu";
import { ELLIPSIS, sendMessage } from "../../web/utils";

const REPO = "/test/repo";
const HASH = "abc123";
const SELECTOR = "stash@{0}";

function isContextMenuItem(item: ContextMenuElement): item is ContextMenuItem {
  return item !== null && "onClick" in item;
}

function isContextMenuSubmenu(item: ContextMenuElement): item is ContextMenuSubmenu {
  return item !== null && "submenu" in item;
}

function createMockElement(): HTMLElement {
  return document.createElement("div");
}

function getApplyStashItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = items[0];
  if (!isContextMenuItem(item)) {
    throw new Error("Apply Stash item is missing");
  }
  return item;
}

function getPopStashItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = items[1];
  if (!isContextMenuItem(item)) {
    throw new Error("Pop Stash item is missing");
  }
  return item;
}

function getMoreSubmenu(items: ContextMenuElement[]): ContextMenuSubmenu {
  const item = items[3];
  if (!isContextMenuSubmenu(item)) {
    throw new Error("More submenu is missing");
  }
  return item;
}

function getCreateBranchFromStashItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = getMoreSubmenu(items).submenu[0];
  if (!isContextMenuItem(item)) {
    throw new Error("Create Branch from Stash item is missing");
  }
  return item;
}

function getDropStashItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = getMoreSubmenu(items).submenu[1];
  if (!isContextMenuItem(item)) {
    throw new Error("Drop Stash item is missing");
  }
  return item;
}

function getCopyStashNameItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = items[5];
  if (!isContextMenuItem(item)) {
    throw new Error("Copy Stash Name item is missing");
  }
  return item;
}

function getCopyStashHashItem(items: ContextMenuElement[]): ContextMenuItem {
  const item = items[6];
  if (!isContextMenuItem(item)) {
    throw new Error("Copy Stash Hash item is missing");
  }
  return item;
}

// --- S1: Return array structure ---

describe("buildStashContextMenuItems return array (S1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-001: returns 7-element array with More submenu at index 3", () => {
    // Case: TC-001
    // Given: Valid repo, hash, selector and source element
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: Function returns the menu items array

    // Then: Array has 7 elements with separators at index 2 and 4
    expect(items).toHaveLength(7);
    expect(items[0]).not.toBeNull();
    expect(items[1]).not.toBeNull();
    expect(items[2]).toBeNull();
    expect(items[3]).not.toBeNull();
    expect(items[4]).toBeNull();
    expect(items[5]).not.toBeNull();
    expect(items[6]).not.toBeNull();
  });

  it("TC-002: each menu item has the correct title", () => {
    // Case: TC-002
    // Given: Valid repo, hash, selector and source element
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: Function returns the menu items array

    // Then: Each non-null item title matches the expected value
    expect(items[0]?.title).toBe(`Apply Stash${ELLIPSIS}`);
    expect(items[1]?.title).toBe(`Pop Stash${ELLIPSIS}`);
    expect(items[3]?.title).toBe("More...");
    expect(getMoreSubmenu(items).submenu.map((item) => item?.title ?? null)).toEqual([
      `Create Branch from Stash${ELLIPSIS}`,
      `Drop Stash${ELLIPSIS}`
    ]);
    expect(items[5]?.title).toBe("Copy Stash Name to Clipboard");
    expect(items[6]?.title).toBe("Copy Stash Hash to Clipboard");
  });
});

// --- S2: Apply Stash menu item ---

describe("Apply Stash menu item (S2)", () => {
  let sourceElem: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    sourceElem = createMockElement();
  });

  it("TC-003: onClick calls showCheckboxDialog with correct arguments", () => {
    // Case: TC-003
    // Given: Apply Stash menu item built with known repo, selector, sourceElem
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: showCheckboxDialog called once with escaped selector in message, correct label/default/action/target
    expect(showCheckboxDialog).toHaveBeenCalledTimes(1);
    const args = vi.mocked(showCheckboxDialog).mock.calls[0];
    expect(args[0]).toContain(SELECTOR);
    expect(args[1]).toBe("Reinstate Index");
    expect(args[2]).toBe(false);
    expect(args[3]).toBe("Yes, apply stash");
    expect(typeof args[4]).toBe("function");
    expect(args[5]).toBe(sourceElem);
  });

  it("TC-004: callback with reinstateIndex=true sends applyStash message", () => {
    // Case: TC-004
    // Given: Apply Stash dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getApplyStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];

    // When: Callback invoked with reinstateIndex=true
    callback(true);

    // Then: sendMessage called with applyStash command and reinstateIndex=true
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "applyStash",
      repo: REPO,
      selector: SELECTOR,
      reinstateIndex: true
    });
  });

  it("TC-005: callback with reinstateIndex=false sends applyStash message", () => {
    // Case: TC-005
    // Given: Apply Stash dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getApplyStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];

    // When: Callback invoked with reinstateIndex=false
    callback(false);

    // Then: sendMessage called with applyStash command and reinstateIndex=false
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "applyStash",
      repo: REPO,
      selector: SELECTOR,
      reinstateIndex: false
    });
  });
});

// --- S3: Create Branch from Stash menu item ---

describe("Create Branch from Stash menu item (S3)", () => {
  let sourceElem: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    sourceElem = createMockElement();
  });

  it("TC-006: onClick calls showRefInputDialog with correct arguments", () => {
    // Case: TC-006
    // Given: Create Branch menu item built with known repo, selector, sourceElem
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);

    // When: Create Branch onClick is triggered
    getCreateBranchFromStashItem(items).onClick();

    // Then: showRefInputDialog called once with escaped selector in message, empty default, correct action/target
    expect(showRefInputDialog).toHaveBeenCalledTimes(1);
    const args = vi.mocked(showRefInputDialog).mock.calls[0];
    expect(args[0]).toContain(SELECTOR);
    expect(args[1]).toBe("");
    expect(args[2]).toBe("Create Branch");
    expect(typeof args[3]).toBe("function");
    expect(args[4]).toBe(sourceElem);
  });

  it("TC-007: callback with branch name sends branchFromStash message", () => {
    // Case: TC-007
    // Given: Create Branch dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getCreateBranchFromStashItem(items).onClick();
    const callback = vi.mocked(showRefInputDialog).mock.calls[0][3];

    // When: Callback invoked with branch name "feature-branch"
    callback("feature-branch");

    // Then: sendMessage called with branchFromStash command and correct branch name
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "branchFromStash",
      repo: REPO,
      branchName: "feature-branch",
      selector: SELECTOR
    });
  });
});

// --- S4: Pop Stash menu item ---

describe("Pop Stash menu item (S4)", () => {
  let sourceElem: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    sourceElem = createMockElement();
  });

  it("TC-008: onClick calls showCheckboxDialog with correct arguments including remove text", () => {
    // Case: TC-008
    // Given: Pop Stash menu item built with known repo, selector, sourceElem
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);

    // When: Pop Stash onClick is triggered
    getPopStashItem(items).onClick();

    // Then: showCheckboxDialog called once with escaped selector and "remove" text in message
    expect(showCheckboxDialog).toHaveBeenCalledTimes(1);
    const args = vi.mocked(showCheckboxDialog).mock.calls[0];
    expect(args[0]).toContain(SELECTOR);
    expect(args[0]).toContain("remove the stash entry");
    expect(args[1]).toBe("Reinstate Index");
    expect(args[2]).toBe(false);
    expect(args[3]).toBe("Yes, pop stash");
    expect(typeof args[4]).toBe("function");
    expect(args[5]).toBe(sourceElem);
  });

  it("TC-009: callback with reinstateIndex=true sends popStash message", () => {
    // Case: TC-009
    // Given: Pop Stash dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getPopStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];

    // When: Callback invoked with reinstateIndex=true
    callback(true);

    // Then: sendMessage called with popStash command and reinstateIndex=true
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "popStash",
      repo: REPO,
      selector: SELECTOR,
      reinstateIndex: true
    });
  });

  it("TC-010: callback with reinstateIndex=false sends popStash message", () => {
    // Case: TC-010
    // Given: Pop Stash dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getPopStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];

    // When: Callback invoked with reinstateIndex=false
    callback(false);

    // Then: sendMessage called with popStash command and reinstateIndex=false
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "popStash",
      repo: REPO,
      selector: SELECTOR,
      reinstateIndex: false
    });
  });
});

// --- S5: Drop Stash menu item ---

describe("Drop Stash menu item (S5)", () => {
  let sourceElem: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    sourceElem = createMockElement();
  });

  it("TC-011: onClick calls showConfirmationDialog with correct arguments", () => {
    // Case: TC-011
    // Given: Drop Stash menu item built with known repo, selector, sourceElem
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);

    // When: Drop Stash onClick is triggered
    getDropStashItem(items).onClick();

    // Then: showConfirmationDialog called once with escaped selector and "cannot be undone" in message
    expect(showConfirmationDialog).toHaveBeenCalledTimes(1);
    const args = vi.mocked(showConfirmationDialog).mock.calls[0];
    expect(args[0]).toContain(SELECTOR);
    expect(args[0]).toContain("cannot be undone");
    expect(typeof args[1]).toBe("function");
    expect(args[2]).toBe(sourceElem);
  });

  it("TC-012: callback sends dropStash message", () => {
    // Case: TC-012
    // Given: Drop Stash confirmation dialog shown
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, sourceElem);
    getDropStashItem(items).onClick();
    const callback = vi.mocked(showConfirmationDialog).mock.calls[0][1];

    // When: Callback invoked (user confirmed)
    callback();

    // Then: sendMessage called with dropStash command
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "dropStash",
      repo: REPO,
      selector: SELECTOR
    });
  });
});

// --- S6: Copy to Clipboard menu items ---

describe("Copy to Clipboard menu items (S6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-013: Copy Stash Name sends copyToClipboard with selector as data", () => {
    // Case: TC-013
    // Given: Copy Stash Name menu item
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: Copy Stash Name onClick is triggered
    getCopyStashNameItem(items).onClick();

    // Then: sendMessage called with copyToClipboard command, type "Stash Name", data=selector
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "copyToClipboard",
      type: "Stash Name",
      data: SELECTOR
    });
  });

  it("TC-014: Copy Stash Hash sends copyToClipboard with hash as data", () => {
    // Case: TC-014
    // Given: Copy Stash Hash menu item
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: Copy Stash Hash onClick is triggered
    getCopyStashHashItem(items).onClick();

    // Then: sendMessage called with copyToClipboard command, type "Stash Hash", data=hash
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      command: "copyToClipboard",
      type: "Stash Hash",
      data: HASH
    });
  });
});

// --- S7: Input boundary values and HTML escape verification ---

describe("Input boundary values and HTML escape (S7)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-015: empty selector embeds empty escapeHtml result in dialog and sendMessage", () => {
    // Case: TC-015
    // Given: selector is empty string
    const items = buildStashContextMenuItems(REPO, HASH, "", createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Dialog message contains empty escape result; callback sends empty selector
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("<b><i></i></b>");
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];
    callback(false);
    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ selector: "" }));
  });

  it("TC-016: empty repo is passed through to sendMessage", () => {
    // Case: TC-016
    // Given: repo is empty string
    const items = buildStashContextMenuItems("", HASH, SELECTOR, createMockElement());

    // When: Apply Stash onClick and callback invoked
    getApplyStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];
    callback(false);

    // Then: sendMessage repo field is ""
    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ repo: "" }));
  });

  it("TC-017: empty hash is passed through to Copy Hash sendMessage", () => {
    // Case: TC-017
    // Given: hash is empty string
    const items = buildStashContextMenuItems(REPO, "", SELECTOR, createMockElement());

    // When: Copy Hash onClick is triggered
    getCopyStashHashItem(items).onClick();

    // Then: sendMessage data field is ""
    expect(sendMessage).toHaveBeenCalledWith({
      command: "copyToClipboard",
      type: "Stash Hash",
      data: ""
    });
  });

  it("TC-018: HTML special characters are escaped in dialog messages", () => {
    // Case: TC-018
    // Given: selector contains HTML special characters
    const specialSelector = "<b>&\"test'</b>";
    const items = buildStashContextMenuItems(REPO, HASH, specialSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Dialog message contains HTML-escaped selector (no raw special chars)
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("&lt;b&gt;&amp;&quot;test&#x27;&lt;&#x2F;b&gt;");
    expect(message).not.toContain("<b>&\"test'</b>");
  });

  it("TC-019: script tag is escaped preventing XSS", () => {
    // Case: TC-019
    // Given: selector contains XSS script tag
    const xssSelector = "<script>alert(1)</script>";
    const items = buildStashContextMenuItems(REPO, HASH, xssSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Dialog message has escaped script tag, no raw <script>
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("&lt;script&gt;");
    expect(message).not.toContain("<script>");
  });

  it("TC-020: @ and {} in stash selector are not escaped by escapeHtml", () => {
    // Case: TC-020
    // Given: selector contains typical stash reference with @{}
    const stashSelector = "stash@{0}";
    const items = buildStashContextMenuItems(REPO, HASH, stashSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: @ and {} are preserved as-is (not in escapeHtml's escape set)
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("stash@{0}");
  });

  it("TC-021: unicode characters pass through escapeHtml unchanged", () => {
    // Case: TC-021
    // Given: selector contains unicode characters
    const unicodeSelector = "日本語スタッシュ";
    const items = buildStashContextMenuItems(REPO, HASH, unicodeSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Unicode characters are preserved in dialog message
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("日本語スタッシュ");
  });

  it("TC-022: newline characters pass through escapeHtml unchanged", () => {
    // Case: TC-022
    // Given: selector contains newline characters
    const newlineSelector = "line1\nline2";
    const items = buildStashContextMenuItems(REPO, HASH, newlineSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Newline characters are preserved in dialog message
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("line1\nline2");
  });

  it("TC-023: pre-encoded ampersand gets double-encoded by escapeHtml", () => {
    // Case: TC-023
    // Given: selector contains already-encoded HTML entity
    const preEncodedSelector = "&amp;already-encoded";
    const items = buildStashContextMenuItems(REPO, HASH, preEncodedSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: The & is re-escaped resulting in &amp;amp;already-encoded
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain("&amp;amp;already-encoded");
  });

  it("TC-024: repo with spaces is passed through to sendMessage as-is", () => {
    // Case: TC-024
    // Given: repo path contains spaces
    const spacedRepo = "/path/with spaces/repo";
    const items = buildStashContextMenuItems(spacedRepo, HASH, SELECTOR, createMockElement());

    // When: Apply Stash onClick and callback invoked
    getApplyStashItem(items).onClick();
    const callback = vi.mocked(showCheckboxDialog).mock.calls[0][4];
    callback(false);

    // Then: sendMessage repo field contains the spaced path as-is
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ repo: "/path/with spaces/repo" })
    );
  });

  it("TC-025: non-hex hash is passed through to sendMessage as-is", () => {
    // Case: TC-025
    // Given: hash is not a valid hex value
    const nonHexHash = "not-a-hex-value";
    const items = buildStashContextMenuItems(REPO, nonHexHash, SELECTOR, createMockElement());

    // When: Copy Hash onClick is triggered
    getCopyStashHashItem(items).onClick();

    // Then: sendMessage data field contains the non-hex value as-is
    expect(sendMessage).toHaveBeenCalledWith({
      command: "copyToClipboard",
      type: "Stash Hash",
      data: "not-a-hex-value"
    });
  });

  it("TC-026: null selector causes escapeHtml to throw TypeError at runtime", () => {
    // Case: TC-026
    // Given: selector is null (TypeScript type violation at runtime)
    const items = buildStashContextMenuItems(
      REPO,
      HASH,
      null as unknown as string,
      createMockElement()
    );

    // When: Apply Stash onClick is triggered (escapeHtml(null) called)
    // Then: TypeError thrown because null has no .replace() method
    expect(() => getApplyStashItem(items).onClick()).toThrow(TypeError);
  });

  it("TC-027: null hash is passed through to sendMessage data", () => {
    // Case: TC-027
    // Given: hash is null (TypeScript type violation at runtime)
    const items = buildStashContextMenuItems(
      REPO,
      null as unknown as string,
      SELECTOR,
      createMockElement()
    );

    // When: Copy Hash onClick is triggered
    getCopyStashHashItem(items).onClick();

    // Then: sendMessage data field is null
    expect(sendMessage).toHaveBeenCalledWith({
      command: "copyToClipboard",
      type: "Stash Hash",
      data: null
    });
  });

  it("TC-028: very long string is passed through without truncation", () => {
    // Case: TC-028
    // Given: selector is an extremely long string (10000 chars)
    const longSelector = "a".repeat(10000);
    const items = buildStashContextMenuItems(REPO, HASH, longSelector, createMockElement());

    // When: Apply Stash onClick is triggered
    getApplyStashItem(items).onClick();

    // Then: Full string appears in dialog message without truncation
    const message = vi.mocked(showCheckboxDialog).mock.calls[0][0];
    expect(message).toContain(longSelector);
  });
});

describe("Stash context menu structure (S8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-029: returns the new top-level order with More submenu in the middle", () => {
    // Case: TC-029
    // Given: a valid stash menu input
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: the menu array is built

    // Then: the top-level order matches the reorganization spec
    expect(items).toHaveLength(7);
    expect(items[0]?.title).toBe(`Apply Stash${ELLIPSIS}`);
    expect(items[1]?.title).toBe(`Pop Stash${ELLIPSIS}`);
    expect(items[2]).toBeNull();
    expect(items[3]?.title).toBe("More...");
    expect(items[4]).toBeNull();
    expect(items[5]?.title).toBe("Copy Stash Name to Clipboard");
    expect(items[6]?.title).toBe("Copy Stash Hash to Clipboard");
  });

  it("TC-030: More submenu contains Create Branch from Stash and Drop Stash without dividers", () => {
    // Case: TC-030
    // Given: a valid stash menu input
    const items = buildStashContextMenuItems(REPO, HASH, SELECTOR, createMockElement());

    // When: the More submenu is inspected
    const submenu = getMoreSubmenu(items).submenu;

    // Then: submenu contains exactly two actionable items and no null dividers
    expect(submenu).toHaveLength(2);
    expect(submenu.map((item) => item?.title ?? null)).toEqual([
      `Create Branch from Stash${ELLIPSIS}`,
      `Drop Stash${ELLIPSIS}`
    ]);
    expect(submenu.includes(null)).toBe(false);
  });
});
