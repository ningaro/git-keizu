// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const MENU_WIDTH = 150;
const MENU_HEIGHT = 200;
const SUBMENU_WIDTH = 120;
const SUBMENU_HEIGHT = 120;
const VIEWPORT_WIDTH = 1000;
const VIEWPORT_HEIGHT = 800;
const OFFSET = 2;

let showContextMenu: typeof import("../../web/contextMenu").showContextMenu;
let hideContextMenu: typeof import("../../web/contextMenu").hideContextMenu;
let contextMenuEl: HTMLUListElement;

beforeAll(async () => {
  // Given: contextMenu DOM element exists before module loads
  contextMenuEl = document.createElement("ul");
  contextMenuEl.id = "contextMenu";
  document.body.appendChild(contextMenuEl);

  const mod = await import("../../web/contextMenu");
  showContextMenu = mod.showContextMenu;
  hideContextMenu = mod.hideContextMenu;
});

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    value: VIEWPORT_WIDTH,
    writable: true
  });
  Object.defineProperty(window, "innerHeight", {
    value: VIEWPORT_HEIGHT,
    writable: true
  });

  contextMenuEl.getBoundingClientRect = vi.fn(
    () =>
      ({
        width: MENU_WIDTH,
        height: MENU_HEIGHT,
        top: 0,
        left: 0,
        right: MENU_WIDTH,
        bottom: MENU_HEIGHT,
        x: 0,
        y: 0,
        toJSON: () => {}
      }) as DOMRect
  );
});

afterEach(() => {
  hideContextMenu();
  vi.useRealTimers();
});

function createMouseEvent(clientX: number, clientY: number): MouseEvent {
  return new MouseEvent("contextmenu", { clientX, clientY, bubbles: true });
}

function createItems(): ContextMenuElement[] {
  return [{ title: "Test Item", onClick: vi.fn() }];
}

function createSubmenuItems(onChildClick = vi.fn()): ContextMenuElement[] {
  return [
    { title: "First Item", onClick: vi.fn() },
    {
      title: "More...",
      submenu: [{ title: "Child Item", onClick: onChildClick }]
    }
  ];
}

function createSourceElem(): HTMLElement {
  const el = document.createElement("span");
  document.body.appendChild(el);
  return el;
}

function getSubmenuElement(): HTMLUListElement {
  return document.querySelector("ul.contextMenuSubmenu") as HTMLUListElement;
}

describe("showContextMenu position calculation", () => {
  it("places menu at (clientX-2, clientY-2) when it fits in viewport (TC-001)", () => {
    // Given: click at (100, 200), menu fits within viewport
    const event = createMouseEvent(100, 200);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu is positioned at (clientX - OFFSET, clientY - OFFSET)
    expect(contextMenuEl.style.left).toBe(`${100 - OFFSET}px`);
    expect(contextMenuEl.style.top).toBe(`${200 - OFFSET}px`);
  });

  it("places menu correctly at center of viewport (TC-002)", () => {
    // Given: click at center area (400, 300), menu fits within viewport
    const event = createMouseEvent(400, 300);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu is positioned at (clientX - OFFSET, clientY - OFFSET)
    expect(contextMenuEl.style.left).toBe(`${400 - OFFSET}px`);
    expect(contextMenuEl.style.top).toBe(`${300 - OFFSET}px`);
  });

  it("flips menu left when it overflows right edge (TC-003)", () => {
    // Given: click near right edge, menu width exceeds remaining space
    const clientX = VIEWPORT_WIDTH - 10;
    const clientY = 200;
    const event = createMouseEvent(clientX, clientY);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu flips left (clientX - menuWidth + OFFSET)
    expect(contextMenuEl.style.left).toBe(`${clientX - MENU_WIDTH + OFFSET}px`);
    expect(contextMenuEl.style.top).toBe(`${clientY - OFFSET}px`);
  });

  it("flips menu up when it overflows bottom edge (TC-004)", () => {
    // Given: click near bottom edge, menu height exceeds remaining space
    const clientX = 100;
    const clientY = VIEWPORT_HEIGHT - 10;
    const event = createMouseEvent(clientX, clientY);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu flips up (clientY - menuHeight + OFFSET)
    expect(contextMenuEl.style.left).toBe(`${clientX - OFFSET}px`);
    expect(contextMenuEl.style.top).toBe(`${clientY - MENU_HEIGHT + OFFSET}px`);
  });

  it("flips menu both directions at bottom-right corner (TC-005)", () => {
    // Given: click near bottom-right corner, overflows both axes
    const clientX = VIEWPORT_WIDTH - 10;
    const clientY = VIEWPORT_HEIGHT - 10;
    const event = createMouseEvent(clientX, clientY);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu flips both left and up
    expect(contextMenuEl.style.left).toBe(`${clientX - MENU_WIDTH + OFFSET}px`);
    expect(contextMenuEl.style.top).toBe(`${clientY - MENU_HEIGHT + OFFSET}px`);
  });

  it("handles (0, 0) coordinates at top-left corner (TC-006)", () => {
    // Given: click at origin (0, 0), menu fits within viewport
    const event = createMouseEvent(0, 0);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: menu is clamped to (0, 0)
    expect(contextMenuEl.style.left).toBe("0px");
    expect(contextMenuEl.style.top).toBe("0px");
  });

  it("clamps negative top when flipped menu would overflow above viewport (TC-007)", () => {
    // Given: small viewport where flipped menu top would be negative
    Object.defineProperty(window, "innerHeight", { value: 100, writable: true });
    const event = createMouseEvent(100, 50);
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(event, createItems(), sourceElem);

    // Then: top is clamped to 0
    expect(contextMenuEl.style.top).toBe("0px");
  });
});

describe("showContextMenu submenu behavior (S2)", () => {
  it("renders dividers and plain items without creating submenu DOM (TC-008)", () => {
    // Case: TC-008
    // Given: a flat menu with one divider
    const sourceElem = createSourceElem();
    const items: ContextMenuElement[] = [
      { title: "First", onClick: vi.fn() },
      null,
      { title: "Second", onClick: vi.fn() }
    ];

    // When: showContextMenu is called
    showContextMenu(createMouseEvent(100, 100), items, sourceElem);

    // Then: top-level DOM matches the expected li classes and no submenu popup is created
    const liClasses = Array.from(contextMenuEl.querySelectorAll("li")).map((el) => el.className);
    expect(liClasses).toEqual(["contextMenuItem", "contextMenuDivider", "contextMenuItem"]);
    expect(document.querySelectorAll("ul.contextMenuSubmenu")).toHaveLength(0);
  });

  it("renders submenu parent li and body-level submenu popup (TC-009)", () => {
    // Case: TC-009
    // Given: a menu containing one submenu parent
    const sourceElem = createSourceElem();

    // When: showContextMenu is called
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);

    // Then: parent li and body-level submenu are both created
    const parentLi = contextMenuEl.querySelector(
      'li.contextMenuParent[data-submenu-index="1"]'
    ) as HTMLLIElement | null;
    const submenuEl = getSubmenuElement();
    expect(parentLi).not.toBeNull();
    expect(submenuEl.dataset.submenuIndex).toBe("1");
    expect(submenuEl.parentElement).toBe(document.body);
  });

  it("activates submenu on parent mouseenter and positions it (TC-010)", () => {
    // Case: TC-010
    // Given: a parent item and submenu with measurable bounds
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 180,
          left: 50,
          right: 170,
          bottom: 204,
          x: 50,
          y: 180,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );

    // When: the user hovers the parent item
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    // Then: submenu becomes active and receives fixed coordinates
    expect(submenuEl.classList.contains("active")).toBe(true);
    expect(submenuEl.style.left).toBe("170px");
    expect(submenuEl.style.top).toBe("180px");
  });

  it("clamps submenu top within the viewport near the bottom edge (TC-011)", () => {
    // Case: TC-011
    // Given: a parent item near the viewport bottom and a tall submenu
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    Object.defineProperty(window, "innerHeight", { value: 200, writable: true });
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 190,
          left: 50,
          right: 170,
          bottom: 214,
          x: 50,
          y: 190,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );

    // When: the user hovers the parent item
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    // Then: submenu top is clamped to stay within the viewport
    expect(submenuEl.style.top).toBe("80px");
  });

  it("keeps submenu visible before the hide delay expires (TC-012)", () => {
    // Case: TC-012
    // Given: fake timers and an open submenu
    vi.useFakeTimers();
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 100,
          left: 50,
          right: 170,
          bottom: 124,
          x: 50,
          y: 100,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    // When: mouse leaves the parent and the delay has not fully elapsed
    parentLi.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    vi.advanceTimersByTime(100);

    // Then: submenu remains active
    expect(submenuEl.classList.contains("active")).toBe(true);
  });

  it("hides submenu after the hide delay elapses (TC-013)", () => {
    // Case: TC-013
    // Given: fake timers and an open submenu
    vi.useFakeTimers();
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 100,
          left: 50,
          right: 170,
          bottom: 124,
          x: 50,
          y: 100,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    // When: mouse leaves and the delay fully elapses
    parentLi.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    vi.advanceTimersByTime(200);

    // Then: submenu is no longer active
    expect(submenuEl.classList.contains("active")).toBe(false);
  });

  it("cancels the scheduled hide when the pointer enters the submenu (TC-014)", () => {
    // Case: TC-014
    // Given: fake timers and an open submenu
    vi.useFakeTimers();
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 100,
          left: 50,
          right: 170,
          bottom: 124,
          x: 50,
          y: 100,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    parentLi.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

    // When: the pointer enters the submenu before the timer fires
    submenuEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(200);

    // Then: submenu stays visible
    expect(submenuEl.classList.contains("active")).toBe(true);
  });

  it("invokes submenu item onClick and closes the whole menu on click (TC-015)", () => {
    // Case: TC-015
    // Given: an open submenu with a click spy
    const childClick = vi.fn();
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(childClick), sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;
    const submenuEl = getSubmenuElement();
    parentLi.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: 120,
          height: 24,
          top: 100,
          left: 50,
          right: 170,
          bottom: 124,
          x: 50,
          y: 100,
          toJSON: () => {}
        }) as DOMRect
    );
    submenuEl.getBoundingClientRect = vi.fn(
      () =>
        ({
          width: SUBMENU_WIDTH,
          height: SUBMENU_HEIGHT,
          top: 0,
          left: 0,
          right: SUBMENU_WIDTH,
          bottom: SUBMENU_HEIGHT,
          x: 0,
          y: 0,
          toJSON: () => {}
        }) as DOMRect
    );
    parentLi.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    const submenuItem = submenuEl.querySelector("li.contextMenuItem") as HTMLLIElement;

    // When: the submenu action is clicked
    submenuItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    // Then: the child action runs once and the menu is fully closed
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(contextMenuEl.classList.contains("active")).toBe(false);
    expect(document.querySelectorAll("ul.contextMenuSubmenu")).toHaveLength(0);
  });

  it("removes submenu DOM and source highlight on hideContextMenu (TC-016)", () => {
    // Case: TC-016
    // Given: a shown submenu and an active source element
    const sourceElem = createSourceElem();
    showContextMenu(createMouseEvent(100, 100), createSubmenuItems(), sourceElem);

    // When: hideContextMenu is called
    hideContextMenu();

    // Then: submenu DOM is removed and the source highlight is cleared
    expect(document.querySelectorAll("ul.contextMenuSubmenu")).toHaveLength(0);
    expect(sourceElem.classList.contains("contextMenuActive")).toBe(false);
  });

  it("does not register normal-item click behavior on submenu parents (TC-017)", () => {
    // Case: TC-017
    // Given: a menu with one normal item and one submenu parent
    const firstClick = vi.fn();
    const sourceElem = createSourceElem();
    const items: ContextMenuElement[] = [
      { title: "First Item", onClick: firstClick },
      {
        title: "More...",
        submenu: [{ title: "Child Item", onClick: vi.fn() }]
      }
    ];
    showContextMenu(createMouseEvent(100, 100), items, sourceElem);
    const parentLi = contextMenuEl.querySelector("li.contextMenuParent") as HTMLLIElement;

    // When: the submenu parent is clicked directly
    parentLi.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    // Then: no regular-item callback is invoked
    expect(firstClick).not.toHaveBeenCalled();
  });
});
