import Image from 'next/image';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
}

export function Header({ search, setSearch }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow flex items-center justify-between px-4 h-16">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </div>
      <h1 className="text-xl font-bold text-center flex-1">Guk Store Imports</h1>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
          style={{ width: 120 }}
        />
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx={11} cy={11} r={8} stroke="currentColor" strokeWidth={2} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} stroke="currentColor" strokeWidth={2} />
        </svg>
      </div>
    </header>
  );
}