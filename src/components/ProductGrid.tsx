import { useState } from 'react';
import Image from 'next/image';

interface IphoneGridProps {
    grouped: Record<
        string,
        Record<string, { url: string; colors: Set<string>; minPrice: number }>
    >;
    search: string;
}

const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

export function IphoneGrid({ grouped, search }: IphoneGridProps) {
    // Estado para capacidade selecionada por modelo
    const [selected, setSelected] = useState<Record<string, string>>({});

    const filtered = Object.entries(grouped).filter(([model]) =>
        model.toLowerCase().includes(search.toLowerCase())
    );

    function parseCapacity(cap: string) {
        const [num, unit] = cap.toLowerCase().replace(/\s+/g, '').match(/(\d+)(gb|tb)/)!.slice(1);
        return unit === 'tb' ? parseInt(num) * 1024 : parseInt(num);
    }

    return (
        <div className="pt-20 pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {filtered
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([model, capacities]) => {


                    const capacityList = Object.keys(capacities).sort(
                        (a, b) => parseCapacity(a) - parseCapacity(b)
                    );
                    // Capacidade selecionada ou a primeira disponível
                    const selectedCapacity =
                        selected[model] || capacityList[0];
                    const { url, colors, minPrice } =
                        capacities[selectedCapacity];

                    const message = encodeURIComponent(
                        `Olá! Tenho interesse no item ${model} ${selectedCapacity}, gostaria de ver a disponibilidade.`
                    );
                    const whatsappUrl = `https://wa.me/5511982214215?text=${message}`;

                    return (
                        <div key={model} className="border rounded-2xl p-4 shadow-md bg-white">
                            <Image
                                src={url || `/images/iphones/${slugify(model)}.png`}
                                alt={model}
                                width={300}
                                height={300}
                                className="rounded-xl object-contain"
                                style={{ height: 220, width: '100%' }} // altura fixa

                            />
                            <h2 className="text-xl font-semibold text-gray-900 mt-2">{model}</h2>
                            <div className="flex gap-2 my-2">
                                {capacityList.map((cap) => (
                                    <button
                                        key={cap}
                                        className={`px-3 py-1 rounded-lg border font-medium ${selectedCapacity === cap
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}
                                        onClick={() =>
                                            setSelected((prev) => ({
                                                ...prev,
                                                [model]: cap,
                                            }))
                                        }
                                    >
                                        {cap}
                                    </button>
                                ))}
                            </div>
                            <p className="text-gray-700"><strong>Cores:</strong> {[...colors].join(', ')}</p>
                            <p className="text-xl text-green-700 font-bold">
                               <strong>Valor:</strong>{' '}
                               {Number(minPrice).toLocaleString('pt-BR', {
                                   style: 'currency',
                                   currency: 'BRL',
                               })}
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
                })}
        </div>
    );
}