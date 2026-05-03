import { sendMessage, svgIcons, vscode } from "./utils";

const contextMenu = document.getElementById("contextMenu")!;
let contextMenuSource: HTMLElement | null = null;
const POSITION_OFFSET = 2;
const SUBMENU_HIDE_DELAY_MS = 150;
const MAX_RECENT_ACTIONS = 5;
let activeSubmenuIndex: number | null = null;
const submenuHideTimers = new Map<number, number>();

function isContextMenuSubmenu(item: ContextMenuElement): item is ContextMenuSubmenu {
  return item !== null && "submenu" in item;
}

function isContextMenuLabel(item: ContextMenuElement): item is ContextMenuLabel {
  return item !== null && "kind" in item && item.kind === "label";
}

function isContextMenuItem(item: ContextMenuElement): item is ContextMenuItem {
  return item !== null && "onClick" in item;
}

function buildContextMenuLabelHtml(item: ContextMenuLabel): string {
  return `<li class="contextMenuLabel">${item.icon ?? ""}<span class="contextMenuLabelText">${item.title}</span></li>`;
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

    if (isContextMenuLabel(child)) {
      html += buildContextMenuLabelHtml(child);
      continue;
    }

    if (isContextMenuItem(child)) {
      html += `<li class="contextMenuItem" data-submenu-parent="${parentIndex}" data-submenu-child="${childIndex}">${child.title}</li>`;
    }
  }

  return html;
}

function normalizeRecentActions(recentActions: GG.RecentActionId[]): GG.RecentActionId[] {
  const seen = new Set<GG.RecentActionId>();
  const normalizedRecentActions: GG.RecentActionId[] = [];

  for (const actionId of recentActions) {
    if (seen.has(actionId)) {
      continue;
    }
    seen.add(actionId);
    normalizedRecentActions.push(actionId);
    if (normalizedRecentActions.length === MAX_RECENT_ACTIONS) {
      break;
    }
  }

  return normalizedRecentActions;
}

function collectRecentActionItems(
  items: ContextMenuElement[],
  recentActionItems = new Map<GG.RecentActionId, ContextMenuItem>()
): Map<GG.RecentActionId, ContextMenuItem> {
  for (const item of items) {
    if (item === null) {
      continue;
    }

    if (isContextMenuSubmenu(item)) {
      collectRecentActionItems(item.submenu, recentActionItems);
      continue;
    }

    if (isContextMenuLabel(item)) {
      continue;
    }

    if (item.recentActionId !== undefined && !recentActionItems.has(item.recentActionId)) {
      recentActionItems.set(item.recentActionId, item);
    }
  }

  return recentActionItems;
}

function buildItemsWithRecentActions(
  items: ContextMenuElement[],
  recentActions: GG.RecentActionId[] | undefined
): ContextMenuElement[] {
  if (
    typeof viewState === "undefined" ||
    viewState.showRecentActions !== true ||
    recentActions === undefined ||
    recentActions.length === 0
  ) {
    return items;
  }

  const recentActionItems = collectRecentActionItems(items);
  if (recentActionItems.size < 2) {
    return items;
  }

  const recentItems = normalizeRecentActions(recentActions)
    .map((actionId) => recentActionItems.get(actionId))
    .filter((item): item is ContextMenuItem => item !== undefined);

  if (recentItems.length === 0) {
    return items;
  }

  return [
    { kind: "label", title: "Recent", icon: svgIcons.history },
    ...recentItems,
    null,
    ...items
  ];
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
  sourceElem: HTMLElement,
  recentActions?: GG.RecentActionId[]
) {
  const itemsToRender = buildItemsWithRecentActions(items, recentActions);
  let html = "";
  const event = e as MouseEvent;

  for (let index = 0; index < itemsToRender.length; index++) {
    const item = itemsToRender[index];
    if (item === null) {
      html += '<li class="contextMenuDivider"></li>';
      continue;
    }

    if (isContextMenuLabel(item)) {
      html += buildContextMenuLabelHtml(item);
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
  addSubmenuElements(itemsToRender);

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
        const item = itemsToRender[index];
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

export function recordRecentAction(repo: string, actionId: GG.RecentActionId): void {
  if (typeof viewState === "undefined") {
    return;
  }

  const repoState = viewState.repos[repo];
  if (repoState === undefined) {
    return;
  }

  const updatedRepoState: GG.GitRepoState = {
    ...repoState,
    recentActions: normalizeRecentActions([actionId, ...(repoState.recentActions ?? [])])
  };
  viewState.repos[repo] = updatedRepoState;

  const webviewState = vscode.getState();
  if (webviewState !== null) {
    vscode.setState({
      ...webviewState,
      gitRepos: {
        ...webviewState.gitRepos,
        [repo]: updatedRepoState
      }
    });
  }

  sendMessage({
    command: "saveRepoState",
    repo,
    state: updatedRepoState
  });
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
