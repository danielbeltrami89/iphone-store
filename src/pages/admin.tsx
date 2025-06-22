import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../libs/firebase';

interface CatalogItem {
    id: string;
    model: string;
    capacity: string;
    color: string;
    available: boolean;
    price: number;
    url: string;
}

type GroupedItem = {
    ids: string[];
    model: string;
    capacity: string;
    colors: { color: string; available: boolean; id: string }[];
    price: number;
};

export default function Admin() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<GroupedItem> & { colors?: { color: string; available: boolean; id: string }[] }>({});
    const [newItem, setNewItem] = useState<{ model: string; capacity: string; colors: string; price: number }>({
        model: '',
        capacity: '',
        colors: '',
        price: 0,
    });

    // Carregar dados
    useEffect(() => {
        const fetchData = async () => {
            const snapshot = await getDocs(collection(db, 'iphones'));
            const data: CatalogItem[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as CatalogItem[];
            setItems(data);
        };
        fetchData();
    }, []);

    // Agrupar por modelo/capacidade
    const grouped: GroupedItem[] = [];
    const groupMap = new Map<string, GroupedItem>();
    for (const item of items) {
        const key = `${item.model}||${item.capacity}`;
        if (!groupMap.has(key)) {
            groupMap.set(key, {
                ids: [],
                model: item.model,
                capacity: item.capacity,
                colors: [],
                price: item.price,
            });
        }
        const group = groupMap.get(key)!;
        group.ids.push(item.id);
        group.colors.push({ color: item.color, available: item.available, id: item.id });
    }
    grouped.push(...groupMap.values());

    const groupedSorted = [...grouped].sort((a, b) => a.model.localeCompare(b.model));

    // Editar
    const startEdit = (group: GroupedItem) => {
        setEditingKey(`${group.model}||${group.capacity}`);
        setEditData({
            ...group,
            colors: group.colors.map(c => ({ ...c })), // cópia para edição
        });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
        const { name, value, type, checked } = e.target;
        if (name === 'color' && typeof idx === 'number') {
            setEditData((prev) => {
                const colors = prev.colors ? [...prev.colors] : [];
                colors[idx] = { ...colors[idx], color: value };
                return { ...prev, colors };
            });
        } else if (name === 'available' && typeof idx === 'number') {
            setEditData((prev) => {
                const colors = prev.colors ? [...prev.colors] : [];
                colors[idx] = { ...colors[idx], available: checked };
                return { ...prev, colors };
            });
        } else {
            setEditData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const saveEdit = async () => {
        if (!editingKey || !editData.colors) return;
        const { model, capacity, price, colors } = editData;
        if (!model || !capacity || !colors) return;

        // Atualizar cada cor individualmente
        for (const c of colors) {
            await updateDoc(doc(db, 'iphones', c.id), {
                model,
                capacity,
                color: c.color,
                available: c.available,
                price,
            });
        }
        // Atualizar estado
        const snapshot = await getDocs(collection(db, 'iphones'));
        const data: CatalogItem[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as CatalogItem[];
        setItems(data);
        setEditingKey(null);
        setEditData({});
    };

    // Excluir grupo
    const handleDelete = async (group: GroupedItem) => {
        if (!window.confirm(`Excluir todos os iPhones ${group.model} - ${group.capacity}?`)) return;
        const batch = writeBatch(db);
        group.ids.forEach(id => batch.delete(doc(db, 'iphones', id)));
        await batch.commit();
        setItems((prev) => prev.filter((item) => !group.ids.includes(item.id)));
    };

    // Adicionar novo grupo/cor
    const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const colorArr = newItem.colors.split(',').map((c) => c.trim()).filter(Boolean);
        for (const color of colorArr) {
            await addDoc(collection(db, 'iphones'), {
                model: newItem.model,
                capacity: newItem.capacity,
                color,
                available: false, // default
                price: newItem.price,
                url: '',
            });
        }
        const snapshot = await getDocs(collection(db, 'iphones'));
        const data: CatalogItem[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as CatalogItem[];
        setItems(data);
        setNewItem({ model: '', capacity: '', colors: '', price: 0 });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administração de iPhones</h1>
            <form onSubmit={handleAdd} className="mb-6 flex gap-2 items-end">
                <input name="model" value={newItem.model} onChange={handleNewChange} placeholder="Modelo" className="border p-1" required />
                <input name="capacity" value={newItem.capacity} onChange={handleNewChange} placeholder="Capacidade" className="border p-1" required />
                <input name="colors" value={newItem.colors} onChange={handleNewChange} placeholder="Cores (separadas por vírgula)" className="border p-1" required />
                <input name="price" type="number" value={newItem.price} onChange={handleNewChange} placeholder="Preço" className="border p-1" required />
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Adicionar</button>
            </form>
            <table className="min-w-full border">
                <thead>
                    <tr>
                        <th>Modelo</th>
                        <th>Capacidade</th>
                        <th>Cores</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedSorted.map((group) => {
                        // Filtra apenas as cores disponíveis
                        const availableColors = group.colors.filter(c => c.available);

                        // Linha de edição
                        if (editingKey === `${group.model}||${group.capacity}`) {
                            return (
                                <tr key={group.model + group.capacity}>
                                    <td>
                                        <input
                                            name="model"
                                            value={editData.model || ''}
                                            onChange={handleEditChange}
                                            className="border p-1"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="capacity"
                                            value={editData.capacity || ''}
                                            onChange={handleEditChange}
                                            className="border p-1"
                                        />
                                    </td>
                                    <td>
                                        {editData.colors?.map((c, idx) => (
                                            <div key={c.id} className="flex items-center gap-2 mb-1">
                                                <input
                                                    name="color"
                                                    value={c.color}
                                                    onChange={e => handleEditChange(e, idx)}
                                                    className="border p-1"
                                                    style={{ width: 80 }}
                                                />
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="available"
                                                        checked={c.available}
                                                        onChange={e => handleEditChange(e, idx)}
                                                    />{' '}
                                                    Disponível
                                                </label>
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <input
                                            name="price"
                                            type="number"
                                            value={editData.price || ''}
                                            onChange={handleEditChange}
                                            className="border p-1"
                                        />
                                    </td>
                                    <td>
                                        <button onClick={saveEdit} className="bg-green-500 text-white px-2 py-1 rounded">Salvar</button>
                                        <button onClick={() => setEditingKey(null)} className="ml-2 bg-gray-300 px-2 py-1 rounded">Cancelar</button>
                                    </td>
                                </tr>
                            );
                        }

                        // Linha normal (apenas cores disponíveis)
                        return (
                            <tr key={group.model + group.capacity}>
                                <td>{group.model}</td>
                                <td>{group.capacity}</td>
                                <td>
                                    {availableColors.length > 0
                                        ? availableColors.map(c => (
                                            <span key={c.id} className="inline-block mr-2">
                                                {c.color}
                                            </span>
                                        ))
                                        : null}
                                </td>
                                <td>R$ {group.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td>
                                    <button onClick={() => startEdit(group)} className="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                                    <button onClick={() => handleDelete(group)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Excluir</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}