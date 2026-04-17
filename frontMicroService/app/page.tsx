'use client';

import { useEffect, useMemo, useState } from 'react';
import { NotesManagement } from '@/components/notes-management';
import { OpenFeignDemo } from '@/components/open-feign-demo';

type Entity = {
  id?: number;
  nom: string;
  description: string;
};

type ResourceConfig = {
  key: string;
  label: string;
  path: string;
};

const resources: ResourceConfig[] = [
  { key: 'etudiants', label: 'Etudiants', path: 'etudiants' },
  { key: 'enseignants', label: 'Enseignants', path: 'enseignants' },
  { key: 'classes', label: 'Classes', path: 'classes' },
  { key: 'matieres', label: 'Matieres', path: 'matieres' },
  { key: 'salles', label: 'Salles', path: 'salles' },
  { key: 'notes', label: 'Notes', path: 'notes' },
];

export default function Home() {
  const [selected, setSelected] = useState<ResourceConfig>(resources[0]);
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Entity>({ nom: '', description: '' });

  const title = useMemo(() => `Gestion des ${selected.label}`, [selected.label]);
  const isNotes = selected.key === 'notes';
  const isMatiereFeign = selected.key === 'matieres';
  const isSalleFeign = selected.key === 'salles';

  useEffect(() => {
    if (isNotes) return;
    void loadItems();
    // Reload list whenever selected resource changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.path, isNotes]);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/${selected.path}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = (await res.json()) as Entity[];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(`Chargement impossible: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nom: '', description: '' });
    setEditingId(null);
  };

  const onSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError('');
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/${selected.path}/${editingId}` : `/api/${selected.path}`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      resetForm();
      await loadItems();
    } catch (e) {
      setError(`Enregistrement impossible: ${(e as Error).message}`);
    }
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    setError('');
    try {
      const res = await fetch(`/api/${selected.path}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      if (editingId === id) resetForm();
      await loadItems();
    } catch (e) {
      setError(`Suppression impossible: ${(e as Error).message}`);
    }
  };

  const onEdit = (item: Entity) => {
    setEditingId(item.id ?? null);
    setForm({ nom: item.nom ?? '', description: item.description ?? '' });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-2">Front React - Microservices</h1>
        <p className="text-sm text-slate-600 mb-6">
          Interface CRUD connectee au backend via API Gateway (`/api` -&gt; `localhost:8087`)
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {resources.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setSelected(r);
                resetForm();
                setError('');
              }}
              className={`rounded border px-4 py-2 text-sm ${
                selected.key === r.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <section className="bg-white rounded border p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          {isNotes ? (
            <NotesManagement />
          ) : (
            <>
              <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                  required
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    {editingId === null ? 'Ajouter' : 'Modifier'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-slate-200 px-4 py-2 rounded">
                    Annuler
                  </button>
                  <button type="button" onClick={loadItems} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Rafraichir la liste
                  </button>
                </div>
              </form>
              {error ? <p className="text-red-600 mt-3 text-sm">{error}</p> : null}
              {isMatiereFeign ? <OpenFeignDemo variant="matieres" /> : null}
              {isSalleFeign ? <OpenFeignDemo variant="salles" /> : null}
            </>
          )}
        </section>

        {!isNotes ? (
          <section className="bg-white rounded border p-4">
            <h3 className="font-semibold mb-3">Liste</h3>
            {loading ? <p>Chargement...</p> : null}
            {!loading && items.length === 0 ? (
              <p className="text-slate-600 text-sm">Aucune donnee.</p>
            ) : null}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      #{item.id} - {item.nom}
                    </p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit(item)} className="px-3 py-1 rounded bg-amber-500 text-white">
                      Editer
                    </button>
                    <button type="button" onClick={() => onDelete(item.id)} className="px-3 py-1 rounded bg-red-600 text-white">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
