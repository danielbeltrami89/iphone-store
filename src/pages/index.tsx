import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../libs/firebase';
import { CatalogItem } from '../types/CatalogItem';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { IphoneGrid } from '../components/ProductGrid';

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

  useEffect(() => {
  const fetchLastUpdate = async () => {
    const q = query(collection(db, 'iphones'), orderBy('updateAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const updateAt = doc.get('updateAt');
      if (updateAt && updateAt.toDate) {
        setLastUpdate(updateAt.toDate().toLocaleString('pt-BR'));
      } else {
        setLastUpdate('Não disponível');
      }
    } else {
      setLastUpdate('Não disponível');
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

  return (
    <div>
      <Header search={search} setSearch={setSearch} />
      <IphoneGrid grouped={grouped} search={search} />
      <Footer lastUpdate={lastUpdate} />
    </div>
  );
}