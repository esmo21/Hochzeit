import { signOut } from "./auth.js";
import { $ } from "./utils.js";

export function initNavigation() {
  const toggle = $(".nav-toggle");
  const menu = $(".nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.setAttribute("aria-current", "page");
    }
  });

  const navList = $(".nav-list");
  if (navList && !navList.querySelector('a[href="moodboard.html"]')) {
    const moodboardItem = document.createElement("li");
    const moodboardLink = document.createElement("a");
    moodboardLink.className = "nav-link";
    moodboardLink.href = "moodboard.html";
    moodboardLink.textContent = "Moodboard";
    moodboardItem.append(moodboardLink);

    const logoutButton = $("#logout-button");
    if (logoutButton?.parentElement === navList) {
      navList.insertBefore(moodboardItem, logoutButton.parentElement);
    } else {
      navList.append(moodboardItem);
    }
  }

  const out = $("#logout-button");
  if (out) {
    out.addEventListener("click", signOut);
  }
}
