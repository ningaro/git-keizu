import { showCheckboxDialog, showConfirmationDialog, showRefInputDialog } from "./dialogs";
import { t } from "./i18n";
import { ELLIPSIS, escapeHtml, sendMessage } from "./utils";

export function buildStashContextMenuItems(
  repo: string,
  hash: string,
  selector: string,
  sourceElem: HTMLElement
): ContextMenuElement[] {
  const applyStashItem: ContextMenuItem = {
    title: `${t("Apply Stash")}${ELLIPSIS}`,
    onClick: () => {
      showCheckboxDialog(
        t("Are you sure you want to apply {0}?", `<b><i>${escapeHtml(selector)}</i></b>`),
        t("Reinstate Index"),
        false,
        t("Yes, apply stash"),
        (reinstateIndex) => {
          sendMessage({
            command: "applyStash",
            repo: repo,
            selector: selector,
            reinstateIndex: reinstateIndex
          });
        },
        sourceElem
      );
    }
  };
  const createBranchFromStashItem: ContextMenuItem = {
    title: `${t("Create Branch from Stash")}${ELLIPSIS}`,
    onClick: () => {
      showRefInputDialog(
        t(
          "Enter the name of the branch you would like to create from {0}:",
          `<b><i>${escapeHtml(selector)}</i></b>`
        ),
        "",
        t("Create Branch"),
        (name) => {
          sendMessage({
            command: "branchFromStash",
            repo: repo,
            branchName: name,
            selector: selector
          });
        },
        sourceElem
      );
    }
  };
  const popStashItem: ContextMenuItem = {
    title: `${t("Pop Stash")}${ELLIPSIS}`,
    onClick: () => {
      showCheckboxDialog(
        t(
          "Are you sure you want to pop {0}? This will remove the stash entry.",
          `<b><i>${escapeHtml(selector)}</i></b>`
        ),
        t("Reinstate Index"),
        false,
        t("Yes, pop stash"),
        (reinstateIndex) => {
          sendMessage({
            command: "popStash",
            repo: repo,
            selector: selector,
            reinstateIndex: reinstateIndex
          });
        },
        sourceElem
      );
    }
  };
  const dropStashItem: ContextMenuItem = {
    title: `${t("Drop Stash")}${ELLIPSIS}`,
    onClick: () => {
      showConfirmationDialog(
        t(
          "Are you sure you want to drop {0}? This cannot be undone.",
          `<b><i>${escapeHtml(selector)}</i></b>`
        ),
        () => {
          sendMessage({
            command: "dropStash",
            repo: repo,
            selector: selector
          });
        },
        sourceElem
      );
    }
  };
  const copyStashNameItem: ContextMenuItem = {
    title: t("Copy Stash Name to Clipboard"),
    onClick: () => {
      sendMessage({
        command: "copyToClipboard",
        type: "Stash Name",
        data: selector
      });
    }
  };
  const copyStashHashItem: ContextMenuItem = {
    title: t("Copy Stash Hash to Clipboard"),
    onClick: () => {
      sendMessage({
        command: "copyToClipboard",
        type: "Stash Hash",
        data: hash
      });
    }
  };

  return [
    applyStashItem,
    popStashItem,
    null,
    {
      title: t("context.more"),
      submenu: [createBranchFromStashItem, dropStashItem]
    },
    null,
    copyStashNameItem,
    copyStashHashItem
  ];
}
