import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '../../libs/firebase';

interface CatalogItem {
  model: string;
  capacity: string;
  color: string;
  available: boolean;
  price: number;
  url: string;
}

export default function Home() {
  const [iphoneItems, setIphoneItems] = useState<CatalogItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'iphones'));
      const data: CatalogItem[] = snapshot.docs.map((doc) => doc.data() as CatalogItem);
      setIphoneItems(data.filter((item) => item.available));
    };
    fetchData();
  }, []);

  // Busca a última atualização (ajuste conforme seu Firestore)
  useEffect(() => {
    const fetchLastUpdate = async () => {
      // Supondo que cada documento tem um campo updateAt (Timestamp)
      const q = query(collection(db, 'iphones'), orderBy('updateAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const updateAt = doc.get('updateAt');
        if (updateAt && updateAt.toDate) {
          setLastUpdate(updateAt.toDate().toLocaleString('pt-BR'));
        }
      }
    };
    fetchLastUpdate();
  }, []);

  // Agrupa por modelo > capacidade
  const grouped = iphoneItems.reduce<Record<
    string,
    Record<string, { url: string; colors: Set<string>; minPrice: number }>
  >>((acc, item) => {
    if (!acc[item.model]) acc[item.model] = {};
    if (!acc[item.model][item.capacity]) {
      acc[item.model][item.capacity] = {
        url: item.url,
        colors: new Set(),
        minPrice: item.price,
      };
    }
    acc[item.model][item.capacity].colors.add(item.color);
    if (item.price < acc[item.model][item.capacity].minPrice) {
      acc[item.model][item.capacity].minPrice = item.price;
    }
    return acc;
  }, {});

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

  // Filtro de busca
  const filtered = Object.entries(grouped)
    .filter(([model]) => model.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white z-50 shadow flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </div>
        <h1 className="text-xl font-bold text-center flex-1">Catálogo iPhones</h1>
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

      {/* GRID */}
      <div className="pt-20 pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        {filtered
          .sort(([a], [b]) => a.localeCompare(b))
          .flatMap(([model, capacities]) =>
            Object.entries(capacities)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([capacity, { url, colors, minPrice }]) => {
                const message = encodeURIComponent(
                  `Olá! Tenho interesse no item ${model} ${capacity}, gostaria de ver a disponibilidade.`
                );
                const whatsappUrl = `https://wa.me/5511982214215?text=${message}`;
                return (
                  <div key={model + capacity} className="border rounded-2xl p-4 shadow-md bg-white">
                    <Image
                      src={url || `/images/iphones/${slugify(model)}.png`}
                      alt={model}
                      width={300}
                      height={300}
                      className="rounded-xl object-contain"
                    />
                    <h2 className="text-xl font-semibold mt-2">{model}</h2>
                    <p><strong>Capacidade:</strong> {capacity}</p>
                    <p><strong>Cores disponíveis:</strong> {[...colors].join(', ')}</p>
                    <p>
                      <strong>Valor:</strong> {minPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      Comprar no WhatsApp
                    </a>
                  </div>
                );
              })
          )}
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full bg-white z-50 shadow flex items-center justify-center h-12">
        <span className="text-sm text-gray-600">
          Última atualização: {lastUpdate ? lastUpdate : 'Carregando...'}
        </span>
      </footer>
    </div>
  );
}