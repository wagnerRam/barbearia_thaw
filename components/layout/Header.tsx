
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Agendamento", href: "/agendamento" },
  { label: "Serviços", href: "/servicos" },
];

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-[0.2em]"
        >
          THAWBLACK
        </Link>

        <nav className="flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
