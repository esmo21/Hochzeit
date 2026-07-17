import { requireAuth } from "./auth.js";
import { initNavigation } from "./navigation.js";

async function init() {
  const session = await requireAuth();
  if (!session) {
    return;
  }

  initNavigation();
}

init();
