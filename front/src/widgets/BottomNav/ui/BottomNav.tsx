import { useNavStore } from "@/shared/model/navStore";
import { hapticLight } from "@/shared/lib/telegram";

const items = [
  { key: "home", icon: "📅", label: "Таблица" },
  { key: "my", icon: "🎯", label: "Мои записи" },
] as const;

export function BottomNav() {
  const { tab, setTab } = useNavStore();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-tg-secondary bg-tg-bg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map((it) => {
          const active = tab === it.key;
          return (
            <button
              key={it.key}
              onClick={() => {
                hapticLight();
                setTab(it.key);
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition active:opacity-60 ${active ? "text-dim" : "text-tg-hint"
                }`}
            >
              <span className="text-xl">{it.icon}</span>
              <span className="text-[11px] font-medium">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}