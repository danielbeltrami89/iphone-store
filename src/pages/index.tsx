// pages/index.tsx
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Image from 'next/image';

const firebaseConfig = {
  apiKey: "AIzaSyAWXzE1xdVa7XQruWlQHLK9JtgW-uqkv_4",
  authDomain: "list-iphone-store.firebaseapp.com",
  databaseURL: "https://list-iphone-store-default-rtdb.firebaseio.com",
  projectId: "list-iphone-store",
  storageBucket: "list-iphone-store.firebasestorage.app",
  messagingSenderId: "98895176605",
  appId: "1:98895176605:web:dda51bbe9524d406d00574",
  measurementId: "G-314BSY59BL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
     {Object.entries(grouped).map(([model, { url, colors, capacities, minPrice }]) => (
       <div key={model} className="border rounded-2xl p-4 shadow-md">
         <Image
           src={url || `/images/iphones/${slugify(model)}.png`}
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
