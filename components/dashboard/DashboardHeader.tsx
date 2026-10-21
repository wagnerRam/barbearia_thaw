type Props = {
  lightMode: boolean;
  onToggleTheme: () => void;
};

export default function DashboardHeader({
  lightMode,
  onToggleTheme,
}: Props) {
  return (
    <header
      className={`flex min-h-20 flex-wrap items-center justify-between gap-4 border-b px-5 py-4 md:px-8 ${
        lightMode
          ? "border-[#D8D3C7] bg-white"
          : "border-[#3B3B3F] bg-[#111110]"
      }`}
    >
      <div>
        <p className="font-semibold">ThawBlack</p>
        <p className="mt-1 text-xs opacity-60">
          Painel administrativo
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm opacity-70 md:flex ${
            lightMode
              ? "border-[#D8D3C7]"
              : "border-[#3B3B3F]"
          }`}
        >
          <span>⌕</span>
          <span>Buscar no painel...</span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            lightMode ? "Ativar tema escuro" : "Ativar tema claro"
          }
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
            lightMode
              ? "border-[#D8D3C7] hover:bg-[#F1EEE3]"
              : "border-[#3B3B3F] hover:bg-[#2B2B2E]"
          }`}
        >
          <span>{lightMode ? "☾" : "☼"}</span>
          <span className="hidden sm:inline">
            {lightMode ? "Dark" : "Light"}
          </span>
        </button>

        <div
          className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${
            lightMode
              ? "bg-[#E9E5DC] text-[#171716]"
              : "bg-[#2B2B2E] text-[#F1EEE3]"
          }`}
        >
          TB
        </div>
      </div>
    </header>
  );
}