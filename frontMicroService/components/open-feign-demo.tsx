'use client';

import { useState } from 'react';

type Props = {
  variant: 'matieres' | 'salles';
};

export function OpenFeignDemo({ variant }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [json, setJson] = useState<string>('');

  const [matiereId, setMatiereId] = useState('1');
  const [enseignantId, setEnseignantId] = useState('1');

  const [salleId, setSalleId] = useState('1');
  const [classeId, setClasseId] = useState('1');

  const testMatiereEnseignant = async () => {
    setErr('');
    setJson('');
    setLoading(true);
    try {
      const url = `/api/matieres/${encodeURIComponent(matiereId)}/details-avec-enseignant/${encodeURIComponent(enseignantId)}`;
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) {
        setErr(`HTTP ${res.status} — ${text || res.statusText}`);
        return;
      }
      try {
        setJson(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setJson(text);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testSalleClasse = async () => {
    setErr('');
    setJson('');
    setLoading(true);
    try {
      const q = new URLSearchParams({ classeId });
      const url = `/api/salles/${encodeURIComponent(salleId)}/avec-libelle-classe?${q.toString()}`;
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) {
        setErr(`HTTP ${res.status} — ${text || res.statusText}`);
        return;
      }
      try {
        setJson(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setJson(text);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'matieres') {
    return (
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold text-slate-800 mb-2">Fiche matière avec enseignant référent</h3>
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
          Vous consultez une matière et, sur le même écran, le nom et le descriptif de l’enseignant associé — sans
          basculer vers l’onglet Enseignants. Indiquez les deux identifiants ci-dessous puis validez ; le service
          Matières récupère automatiquement les données enseignant auprès du service dédié (OpenFeign).
        </p>
        <div className="flex flex-wrap gap-2 items-end mb-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Matière concernée</label>
            <input
              className="border rounded px-2 py-1 w-20 text-sm"
              value={matiereId}
              onChange={(e) => setMatiereId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Enseignant à afficher</label>
            <input
              className="border rounded px-2 py-1 w-24 text-sm"
              value={enseignantId}
              onChange={(e) => setEnseignantId(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm"
            disabled={loading}
            onClick={() => void testMatiereEnseignant()}
          >
            Afficher la fiche complète
          </button>
        </div>
        {err ? <p className="text-red-600 text-sm mb-2">{err}</p> : null}
        {json ? (
          <pre className="text-xs bg-slate-900 text-green-100 p-3 rounded overflow-x-auto max-h-64">{json}</pre>
        ) : null}
        {loading ? <p className="text-sm text-slate-500">Chargement en cours…</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold text-slate-800 mb-2">Depuis une salle, afficher la classe concernée</h3>
      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
        Lorsque vous gérez les salles, vous devez souvent savoir <strong>quelle classe</strong> est concernée (nom,
        description) pour une salle donnée. Sélectionnez la salle et la classe à croiser : la réponse regroupe la fiche
        salle et le libellé classe sur un seul écran — le service Salles interroge le service Classes pour vous
        (OpenFeign), sans ouvrir l’onglet Classes.
      </p>
      <div className="flex flex-wrap gap-2 items-end mb-2">
        <div>
          <label className="block text-xs font-medium text-slate-600">Salle concernée</label>
          <input
            className="border rounded px-2 py-1 w-20 text-sm"
            value={salleId}
            onChange={(e) => setSalleId(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Classe à afficher</label>
          <input
            className="border rounded px-2 py-1 w-20 text-sm"
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm"
          disabled={loading}
          onClick={() => void testSalleClasse()}
        >
          Afficher salle + classe
        </button>
      </div>
      {err ? <p className="text-red-600 text-sm mb-2">{err}</p> : null}
      {json ? (
        <pre className="text-xs bg-slate-900 text-green-100 p-3 rounded overflow-x-auto max-h-64">{json}</pre>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Chargement en cours…</p> : null}
    </div>
  );
}
