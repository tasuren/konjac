import TranslationControls from "./components/TranslationControls";
import TranslationPane from "./components/TranslationPane";

export function TranslationView() {
  return (
    <main className="w-screen h-screen p-6 flex flex-col gap-6">
      <TranslationControls />
      <TranslationPane />
    </main>
  );
}
