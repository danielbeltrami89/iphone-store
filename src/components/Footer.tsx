interface FooterProps {
  lastUpdate: string | null;
}

export function Footer({ lastUpdate }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white z-50 shadow flex items-center justify-center h-5">
      <span className="text-xs text-gray-600">
        Última atualização: {lastUpdate ? lastUpdate : 'Carregando...'}
      </span>
    </footer>
  );
}