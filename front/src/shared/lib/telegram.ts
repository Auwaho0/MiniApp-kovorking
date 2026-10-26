type TgUser = {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
};

type TgWebApp = {
  initData: string;
  initDataUnsafe: { user?: TgUser };
  colorScheme: "light" | "dark";                     
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  setHeaderColor: (c: string) => void;
  setBackgroundColor: (c: string) => void;
  onEvent?: (event: string, handler: () => void) => void;  
  offEvent?: (event: string, handler: () => void) => void;  
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (s: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (s: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
};

const tg: TgWebApp | undefined = (window as any).Telegram?.WebApp;

export function getTg() {
  return tg;
}

/**
 * Ставит/снимает `.dark` на <html>.
 * В Telegram — по colorScheme. Вне Telegram — по prefers-color-scheme.
 * Цвета берутся из CSS (.dark / :root) — не перебиваем их themeParams,
 * чтобы сохранить бренд.
 */
export function applyTheme() {
  let isDark: boolean;
  if (tg) {
    isDark = tg.colorScheme === "dark";
  } else if (typeof window !== "undefined") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = false;
  }
  document.documentElement.classList.toggle("dark", isDark);
}

export function initTelegram() {
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor("secondary_bg_color");
      tg.setBackgroundColor("bg_color");
    } catch {
      /* noop */
    }

    // Синхронизация при смене темы в Telegram
    tg.onEvent?.("themeChanged", applyTheme);
  } else if (typeof window !== "undefined") {
    // Вне Telegram — слушаем системную тему
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", applyTheme);
  }

  applyTheme();
}

export function getTgUser(): TgUser | null {
  return tg?.initDataUnsafe?.user ?? null;
}

export function hapticLight() { tg?.HapticFeedback?.impactOccurred("light"); }
export function hapticMedium() { tg?.HapticFeedback?.impactOccurred("medium"); }
export function hapticSuccess() { tg?.HapticFeedback?.notificationOccurred("success"); }
export function hapticError() { tg?.HapticFeedback?.notificationOccurred("error"); }

export function setBackButton(visible: boolean, cb?: () => void) {
  if (!tg) return;
  if (visible) {
    tg.BackButton.show();
    if (cb) tg.BackButton.onClick(cb);
  } else {
    tg.BackButton.hide();
    if (cb) tg.BackButton.offClick(cb);
  }
}