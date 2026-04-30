const contextMenu = document.getElementById("contextMenu")!;
let contextMenuSource: HTMLElement | null = null;
const POSITION_OFFSET = 2;
const SUBMENU_HIDE_DELAY_MS = 150;
let activeSubmenuIndex: number | null = null;
const submenuHideTimers = new Map<number, number>();

function isContextMenuSubmenu(item: ContextMenuElement): item is ContextMenuSubmenu {
  return item !== null && "submenu" in item;
}

function isContextMenuItem(item: ContextMenuElement): item is ContextMenuItem {
  return item !== null && "onClick" in item;
}

function getSubmenuElement(index: number): HTMLUListElement | null {
  return document.getElementById(`contextSubmenu_${index}`) as HTMLUListElement | null;
}

function clearSubmenuHideTimer(index: number): void {
  const timer = submenuHideTimers.get(index);
  if (timer === undefined) {
    return;
  }

  window.clearTimeout(timer);
  submenuHideTimers.delete(index);
}

function clearAllSubmenuHideTimers(): void {
  submenuHideTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  submenuHideTimers.clear();
}

function hideOtherSubmenus(activeIndex: number): void {
  document.querySelectorAll<HTMLUListElement>("ul.contextMenuSubmenu").forEach((submenuEl) => {
    const submenuIndex = Number.parseInt(submenuEl.dataset.submenuIndex ?? "", 10);
    if (submenuIndex === activeIndex) {
      return;
    }

    submenuEl.classList.remove("active");
    if (!Number.isNaN(submenuIndex)) {
      clearSubmenuHideTimer(submenuIndex);
    }
  });
}

function hideSubmenu(index: number): void {
  clearSubmenuHideTimer(index);
  const submenuEl = getSubmenuElement(index);
  if (submenuEl !== null) {
    submenuEl.classList.remove("active");
  }
  if (activeSubmenuIndex === index) {
    activeSubmenuIndex = null;
  }
}

function scheduleHideSubmenu(index: number): void {
  clearSubmenuHideTimer(index);
  const timer = window.setTimeout(() => {
    hideSubmenu(index);
  }, SUBMENU_HIDE_DELAY_MS);
  submenuHideTimers.set(index, timer);
}

function showSubmenu(parentLi: HTMLElement, index: number): void {
  clearSubmenuHideTimer(index);
  hideOtherSubmenus(index);

  const submenuEl = getSubmenuElement(index);
  if (submenuEl === null) {
    return;
  }

  submenuEl.classList.add("active");
  submenuEl.style.visibility = "hidden";

  const parentBounds = parentLi.getBoundingClientRect();
  const submenuBounds = submenuEl.getBoundingClientRect();
  const left =
    parentBounds.right + submenuBounds.width <= window.innerWidth
      ? parentBounds.right
      : Math.max(0, parentBounds.left - submenuBounds.width);
  const maxTop = Math.max(0, window.innerHeight - submenuBounds.height);
  const top = Math.max(0, Math.min(parentBounds.top, maxTop));

  submenuEl.style.left = `${left}px`;
  submenuEl.style.top = `${top}px`;
  submenuEl.style.visibility = "";
  activeSubmenuIndex = index;
}

function buildSubmenuHtml(items: ContextMenuElement[], parentIndex: number): string {
  let html = "";

  for (let childIndex = 0; childIndex < items.length; childIndex++) {
    const child = items[childIndex];
    if (child === null) {
      html += '<li class="contextMenuDivider"></li>';
      continue;
    }

    if (isContextMenuItem(child)) {
      html += `<li class="contextMenuItem" data-submenu-parent="${parentIndex}" data-submenu-child="${childIndex}">${child.title}</li>`;
    }
  }

  return html;
}

function addSubmenuElements(items: ContextMenuElement[]): void {
  items.forEach((item, index) => {
    if (!isContextMenuSubmenu(item)) {
      return;
    }

    const submenuEl = document.createElement("ul");
    submenuEl.className = "contextMenuSubmenu";
    submenuEl.id = `contextSubmenu_${index}`;
    submenuEl.dataset.submenuIndex = index.toString();
    submenuEl.innerHTML = buildSubmenuHtml(item.submenu, index);

    submenuEl.addEventListener("mouseenter", () => {
      clearSubmenuHideTimer(index);
    });
    submenuEl.addEventListener("mouseleave", () => {
      scheduleHideSubmenu(index);
    });

    submenuEl
      .querySelectorAll<HTMLLIElement>("li.contextMenuItem[data-submenu-parent]")
      .forEach((submenuItemEl) => {
        submenuItemEl.addEventListener("click", (e) => {
          e.stopPropagation();

          const submenuParent = Number.parseInt(submenuItemEl.dataset.submenuParent ?? "", 10);
          const submenuChild = Number.parseInt(submenuItemEl.dataset.submenuChild ?? "", 10);

          hideContextMenu();

          const parentItem = items[submenuParent];
          if (!isContextMenuSubmenu(parentItem)) {
            return;
          }

          const child = parentItem.submenu[submenuChild];
          if (isContextMenuItem(child)) {
            child.onClick();
          }
        });
      });

    document.body.appendChild(submenuEl);
  });
}

export function showContextMenu(
  e: MouseEvent,
  items: ContextMenuElement[],
  sourceElem: HTMLElement
) {
  let html = "";
  const event = e as MouseEvent;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item === null) {
      html += '<li class="contextMenuDivider"></li>';
      continue;
    }

    if (isContextMenuSubmenu(item)) {
      html += `<li class="contextMenuItem contextMenuParent" data-submenu-index="${index}">${item.title}<span class="contextMenuArrow">▸</span></li>`;
      continue;
    }

    html += `<li class="contextMenuItem" data-index="${index}">${item.title}</li>`;
  }

  hideContextMenuListener();
  contextMenu.style.opacity = "0";
  contextMenu.className = "active";
  contextMenu.innerHTML = html;
  addSubmenuElements(items);

  const bounds = contextMenu.getBoundingClientRect();
  contextMenu.style.left = `${Math.max(
    0,
    event.clientX + bounds.width < window.innerWidth
      ? event.clientX - POSITION_OFFSET
      : event.clientX - bounds.width + POSITION_OFFSET
  )}px`;
  contextMenu.style.top = `${Math.max(
    0,
    event.clientY + bounds.height < window.innerHeight
      ? event.clientY - POSITION_OFFSET
      : event.clientY - bounds.height + POSITION_OFFSET
  )}px`;
  contextMenu.style.opacity = "1";

  contextMenu
    .querySelectorAll<HTMLLIElement>("li.contextMenuItem[data-index]")
    .forEach((menuItemEl) => {
      menuItemEl.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        const index = Number.parseInt(menuItemEl.dataset.index ?? "", 10);
        hideContextMenu();
        const item = items[index];
        if (isContextMenuItem(item)) {
          item.onClick();
        }
      });
    });

  contextMenu
    .querySelectorAll<HTMLLIElement>("li.contextMenuParent[data-submenu-index]")
    .forEach((parentEl) => {
      const submenuIndex = Number.parseInt(parentEl.dataset.submenuIndex ?? "", 10);
      parentEl.addEventListener("mouseenter", () => {
        if (Number.isNaN(submenuIndex)) {
          return;
        }

        showSubmenu(parentEl, submenuIndex);
      });
      parentEl.addEventListener("mouseleave", () => {
        if (Number.isNaN(submenuIndex)) {
          return;
        }

        scheduleHideSubmenu(submenuIndex);
      });
    });

  contextMenu
    .querySelectorAll<HTMLLIElement>("li.contextMenuItem:not(.contextMenuParent)")
    .forEach((menuItemEl) => {
      menuItemEl.addEventListener("mouseenter", () => {
        if (activeSubmenuIndex !== null) {
          scheduleHideSubmenu(activeSubmenuIndex);
        }
      });
    });

  if (contextMenuSource !== null) {
    contextMenuSource.classList.remove("contextMenuActive");
  }

  contextMenuSource = sourceElem;
  contextMenuSource.classList.add("contextMenuActive");
}

export function hideContextMenu() {
  contextMenu.className = "";
  contextMenu.innerHTML = "";
  contextMenu.style.left = "0px";
  contextMenu.style.top = "0px";
  document.querySelectorAll("ul.contextMenuSubmenu").forEach((submenuEl) => {
    submenuEl.remove();
  });
  clearAllSubmenuHideTimers();
  activeSubmenuIndex = null;
  if (contextMenuSource !== null) {
    contextMenuSource.classList.remove("contextMenuActive");
    contextMenuSource = null;
  }
}

export function hideContextMenuListener() {
  if (contextMenu.classList.contains("active")) hideContextMenu();
}

export function isContextMenuActive() {
  return contextMenu.classList.contains("active");
}
