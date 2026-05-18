import "./App.css";
import TranslationControls from "./features/components/TranslationControls";
import TranslationPane from "./features/components/TranslationPane";

function App() {
  return (
    <main className="w-screen h-screen p-6 flex flex-col gap-6">
      <TranslationControls />
      <TranslationPane />
    </main>
  );
}

export default App;
