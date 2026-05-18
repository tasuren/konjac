export default function TranslationControls() {
  return (
    <div className="relative flex items-center h-12">
      <div className="absolute h-fit left-1/2 -translate-x-1/2">
        <div className="flex justify-center gap-4">
          <div>
            <select>
              <option>あ</option>
            </select>
          </div>

          <div>
            <select>
              <option>あ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-6 ml-auto mr-2">
        <select>
          <option>あ</option>
        </select>
      </div>
    </div>
  );
}
