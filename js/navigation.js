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
    if (link.getAttribute("href") === current || (["standesamt.html", "location.html", "moodboard.html"].includes(current) && link.getAttribute("href") === "archiv.html")) {
      link.setAttribute("aria-current", "page");
    }
  });

  const out = $("#logout-button");
  if (out) {
    out.addEventListener("click", signOut);
  }
}
