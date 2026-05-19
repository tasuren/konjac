import "./App.css";
import TranslationControls from "./features/translation/components/TranslationControls";
import TranslationPane from "./features/translation/components/TranslationPane";

function App() {
  return (
    <main className="w-screen h-screen p-6 flex flex-col gap-4">
      <TranslationControls />
      <TranslationPane />
    </main>
  );
}

export default App;
