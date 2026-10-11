
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="text-sm">
          © {new Date().getFullYear()} THAWBLACK
        </p>

        <p className="text-xs">
          Barbearia &amp; estilo masculino
        </p>
      </div>
    </footer>
  );
}
