// pages/index.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'iphones'));
      const data: CatalogItem[] = snapshot.docs.map((doc) => doc.data() as CatalogItem);
      setIphoneItems(data.filter((item) => item.available));
    };
    fetchData();
  }, []);

  const grouped = iphoneItems.length
    ? iphoneItems.reduce<Record<string, { url: string; colors: Set<string>; capacities: Set<string>; minPrice: number }>>(
      (acc, item) => {
        if (!acc[item.model]) {
          acc[item.model] = {
            url: item.url,
            colors: new Set(),
            capacities: new Set(),
            minPrice: item.price,
          };
        }
        acc[item.model].colors.add(item.color);
        acc[item.model].capacities.add(item.capacity);
        // Atualiza o menor preço
        if (item.price < acc[item.model].minPrice) {
          acc[item.model].minPrice = item.price;
        }
        return acc;
      },
      {}
    )
    : {};

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b)) // Ordena por modelo
      .map(([model, { colors, capacities, minPrice }]) => (
        <div key={model} className="border rounded-2xl p-4 shadow-md">
          <Image
            src={`/images/iphones/${slugify(model)}.png`}
            alt={model}
            width={300}
            height={300}
            className="rounded-xl object-contain"
          />
          <h2 className="text-xl font-semibold mt-2">{model}</h2>
          <p><strong>Colors:</strong> {[...colors].join(', ')}</p>
          <p><strong>Capacities:</strong> {[...capacities].join(', ')}</p>
          <p><strong>Valor:</strong> R$ {minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      ))}
    </div>
  );
}
