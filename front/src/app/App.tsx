import { useNavStore } from "@/shared/model/navStore";
import { HomePage } from "@/pages/HomePage/ui/HomePage";
import { MyBookingsPage } from "@/pages/MyBookingsPage/ui/MyBookingsPage";
import { BottomNav } from "@/widgets/BottomNav/ui/BottomNav";
import { LoadingModal } from "@/shared/ui/LoadingModal";
import { AuthGate } from "@/features/auth/ui/AuthGate";

export function App() {
  const tab = useNavStore((s) => s.tab);

  return (
    <AuthGate>
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-tg-bg">
        <div className="min-h-screen">{tab === "home" ? <HomePage /> : <MyBookingsPage />}</div>
        <BottomNav />
        <LoadingModal />
      </div>
    </AuthGate>
  );
}