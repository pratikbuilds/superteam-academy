import { ComponentExample } from "@/components/component-example";
import { SuperteamFooter } from "@/components/superteam-footer";

export default function Page() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-64px)]">
      <ComponentExample />
      <SuperteamFooter />
    </main>
  );
}
