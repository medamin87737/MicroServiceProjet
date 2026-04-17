'use client';

import { useState } from 'react';

type NoteEntry = {
  inscriptionId: string;
  etudiantId: number;
  matiereId: number;
  note: {
    id: string;
    valeur: number;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

type HistoriqueEntry = {
  _id: string;
  noteId: string;
  etudiantId: number;
  matiereId: number;
  ancienneValeur?: number;
  nouvelleValeur: number;
  action: string;
  createdAt?: string;
};

export function NotesManagement() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [insEt, setInsEt] = useState('1');
  const [insMat, setInsMat] = useState('1');

  const [nEt, setNEt] = useState('1');
  const [nMat, setNMat] = useState('1');
  const [nVal, setNVal] = useState('12');

  const [consultEt, setConsultEt] = useState('1');
  const [rows, setRows] = useState<NoteEntry[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const [histFilter, setHistFilter] = useState('');
  const [hist, setHist] = useState<HistoriqueEntry[]>([]);

  const [auditPayload, setAuditPayload] = useState<string>('');
  const [pedagogiePayload, setPedagogiePayload] = useState<string>('');

  const parseIntOr = (s: string, fallback: number) => {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const postInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/notes/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiantId: parseIntOr(insEt, 0),
          matiereId: parseIntOr(insMat, 0),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
    } catch (err) {
      setError(`Inscription: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const postNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiantId: parseIntOr(nEt, 0),
          matiereId: parseIntOr(nMat, 0),
          valeur: Number(nVal),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
    } catch (err) {
      setError(`Note: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEtudiant = async () => {
    setError('');
    setLoading(true);
    try {
      const id = parseIntOr(consultEt, 0);
      const res = await fetch(`/api/notes/etudiants/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NoteEntry[];
      setRows(Array.isArray(data) ? data : []);
      setEditId(null);
    } catch (err) {
      setError(`Consultation: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valeur: Number(editVal) }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      setEditId(null);
      await loadEtudiant();
    } catch (err) {
      setError(`Modification: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Scénario RabbitMQ A : journal reçu par MSEtudiant (audit des événements grade.*) */
  const loadAuditDepuisJava = async () => {
    setError('');
    setLoading(true);
    setAuditPayload('');
    try {
      const res = await fetch('/api/etudiants/audit/notes-events');
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${text}`);
      setAuditPayload(JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      setError(`Audit Java: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Scénario RabbitMQ B : suivi reçu par MSClasse (inscription.created) */
  const loadSuiviPedagogique = async () => {
    setError('');
    setLoading(true);
    setPedagogiePayload('');
    try {
      const res = await fetch('/api/classes/pedagogie/inscriptions-recues');
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${text}`);
      setPedagogiePayload(JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      setError(`Suivi Classes: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorique = async () => {
    setError('');
    setLoading(true);
    try {
      const q =
        histFilter.trim() === ''
          ? '/api/notes/historique'
          : `/api/notes/historique?etudiantId=${encodeURIComponent(histFilter.trim())}`;
      const res = await fetch(q);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as HistoriqueEntry[];
      setHist(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Historique: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Les identifiants étudiant / matière correspondent aux id créés dans les onglets Etudiants et Matieres.
        Ordre : <strong>Scénario 2</strong> (inscription) puis <strong>Scénario 1</strong> (note créée puis modifiée).
      </p>

      {/* —— Scénario 2 RabbitMQ —— */}
      <div className="rounded-xl border-2 border-teal-400/80 bg-teal-50/40 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-teal-900 tracking-tight">
            Scénario 2 — RabbitMQ : inscription étudiant ↔ matière
          </h2>
          <p className="text-sm text-teal-800/90 mt-1">
            Événement <code className="bg-teal-100 px-1 rounded text-xs">inscription.created</code> → consommateur{' '}
            <strong>MSClasse</strong> (suivi pédagogique). À faire en premier pour un nouveau couple étudiant/matière.
          </p>
        </div>

        <section className="bg-white rounded border border-teal-200 p-4">
          <h3 className="font-semibold mb-3 text-teal-900">1. Affecter un étudiant à une matière</h3>
        <form onSubmit={postInscription} className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Étudiant (id)</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={insEt}
              onChange={(e) => setInsEt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Matière (id)</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={insMat}
              onChange={(e) => setInsMat(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded h-10" disabled={loading}>
            Inscrire (envoi Scénario 2)
          </button>
        </form>
      </section>
      </div>

      {/* —— Scénario 1 RabbitMQ —— */}
      <div className="rounded-xl border-2 border-violet-400/80 bg-violet-50/40 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-violet-900 tracking-tight">
            Scénario 1 — RabbitMQ : notes (création &amp; modification)
          </h2>
          <p className="text-sm text-violet-800/90 mt-1">
            Événements <code className="bg-violet-100 px-1 rounded text-xs">grade.created</code> puis{' '}
            <code className="bg-violet-100 px-1 rounded text-xs">grade.updated</code> → consommateur{' '}
            <strong>MSEtudiant</strong> (audit). Nécessite une inscription (Scénario 2) pour le même couple.
          </p>
        </div>

        <section className="bg-white rounded border border-violet-200 p-4">
          <h3 className="font-semibold mb-3 text-violet-900">2. Affecter une note (première fois)</h3>
          <p className="text-xs text-slate-600 mb-2">Déclenche <code className="bg-slate-100 px-1 rounded">grade.created</code>.</p>
        <form onSubmit={postNote} className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Étudiant (id)</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={nEt}
              onChange={(e) => setNEt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Matière (id)</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={nMat}
              onChange={(e) => setNMat(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Note (0–20)</label>
            <input
              className="border rounded px-3 py-2 w-24"
              type="number"
              min={0}
              max={20}
              step={0.25}
              value={nVal}
              onChange={(e) => setNVal(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded h-10" disabled={loading}>
            Enregistrer la note (envoi grade.created)
          </button>
        </form>
      </section>

      <section className="bg-white rounded border border-violet-200 p-4">
        <h3 className="font-semibold mb-3 text-violet-900">3. Consulter puis modifier une note</h3>
        <p className="text-xs text-slate-600 mb-2">
          Le bouton <strong>Mettre à jour</strong> déclenche <code className="bg-slate-100 px-1 rounded">grade.updated</code>.
        </p>
        <div className="flex flex-wrap gap-2 items-end mb-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Étudiant (id)</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={consultEt}
              onChange={(e) => setConsultEt(e.target.value)}
            />
          </div>
          <button type="button" onClick={() => void loadEtudiant()} className="bg-blue-600 text-white px-4 py-2 rounded h-10" disabled={loading}>
            Charger
          </button>
        </div>

        {editId ? (
          <form onSubmit={saveEdit} className="mb-4 flex flex-wrap gap-2 items-end border-t pt-3">
            <p className="text-sm w-full">
              Modifier la note <span className="font-mono">{editId}</span>
            </p>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={0}
              max={20}
              step={0.25}
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              required
            />
            <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded h-10" disabled={loading}>
              Mettre à jour
            </button>
            <button
              type="button"
              className="bg-slate-200 px-4 py-2 rounded h-10"
              onClick={() => setEditId(null)}
            >
              Annuler
            </button>
          </form>
        ) : null}

        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.inscriptionId} className="border rounded p-3 flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-sm">
                  Matière <span className="font-mono">#{r.matiereId}</span>
                  {r.note ? (
                    <>
                      {' '}
                      — note <span className="font-semibold">{r.note.valeur}</span>
                      <span className="text-slate-500 text-xs ml-2 font-mono">{r.note.id}</span>
                    </>
                  ) : (
                    <span className="text-slate-500"> — pas de note</span>
                  )}
                </p>
              </div>
              {r.note ? (
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-amber-500 text-white text-sm"
                  onClick={() => {
                    setEditId(r.note!.id);
                    setEditVal(String(r.note!.valeur));
                  }}
                >
                  Modifier
                </button>
              ) : null}
            </div>
          ))}
          {!loading && rows.length === 0 ? <p className="text-slate-600 text-sm">Aucune ligne (chargez un étudiant).</p> : null}
        </div>
      </section>
      </div>

      <section className="bg-white rounded border border-slate-200 p-4">
        <h3 className="font-semibold mb-3">4. Historique des notes (MSNotes / Mongo)</h3>
        <p className="text-xs text-slate-600 mb-3">Journal local des actions — pas un événement RabbitMQ distinct.</p>
        <div className="flex flex-wrap gap-2 items-end mb-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Filtrer par étudiant (id), vide = tout</label>
            <input
              className="border rounded px-3 py-2 w-28"
              type="number"
              min={1}
              value={histFilter}
              onChange={(e) => setHistFilter(e.target.value)}
              placeholder="optionnel"
            />
          </div>
          <button type="button" onClick={() => void loadHistorique()} className="bg-blue-600 text-white px-4 py-2 rounded h-10" disabled={loading}>
            Charger l&apos;historique
          </button>
        </div>
        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
          {hist.map((h) => (
            <li key={h._id} className="border rounded p-2 bg-slate-50">
              <span className="text-slate-600">{h.action}</span> — étudiant {h.etudiantId}, matière {h.matiereId}
              {h.ancienneValeur !== undefined && h.ancienneValeur !== null ? (
                <>
                  {' '}
                  : {h.ancienneValeur} → {h.nouvelleValeur}
                </>
              ) : (
                <> : {h.nouvelleValeur}</>
              )}
              {h.createdAt ? <span className="text-xs text-slate-500 ml-2">{new Date(h.createdAt).toLocaleString()}</span> : null}
            </li>
          ))}
        </ul>
        {!loading && hist.length === 0 ? <p className="text-slate-600 text-sm">Aucun historique chargé.</p> : null}
      </section>

      <section className="bg-white rounded border-2 border-slate-300 p-4">
        <h3 className="font-semibold mb-1">5. Vérifier les messages RabbitMQ côté Java</h3>
        <p className="text-sm text-slate-600 mb-4">
          Relit les données persistées par les consommateurs (via Gateway <code className="text-xs bg-slate-100 px-1 rounded">/api</code> → 8087).
          Prérequis : RabbitMQ + services démarrés.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3">
            <h4 className="font-semibold text-violet-900 text-sm mb-1">Contrôle Scénario 1 (notes)</h4>
            <p className="text-xs text-slate-600 mb-2">
              Audit <code className="bg-white px-1 rounded">grade.*</code> chez <strong>MSEtudiant</strong>
            </p>
            <button
              type="button"
              onClick={() => void loadAuditDepuisJava()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded text-sm w-full"
              disabled={loading}
            >
              Charger l&apos;audit des notes
            </button>
            {auditPayload ? (
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-700 mb-1">GET /etudiants/audit/notes-events</p>
                <pre className="text-xs bg-slate-900 text-green-100 p-3 rounded overflow-x-auto max-h-48">{auditPayload}</pre>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
            <h4 className="font-semibold text-teal-900 text-sm mb-1">Contrôle Scénario 2 (inscriptions)</h4>
            <p className="text-xs text-slate-600 mb-2">
              Suivi <code className="bg-white px-1 rounded">inscription.created</code> chez <strong>MSClasse</strong>
            </p>
            <button
              type="button"
              onClick={() => void loadSuiviPedagogique()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm w-full"
              disabled={loading}
            >
              Charger le suivi pédagogique
            </button>
            {pedagogiePayload ? (
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-700 mb-1">GET /classes/pedagogie/inscriptions-recues</p>
                <pre className="text-xs bg-slate-900 text-cyan-100 p-3 rounded overflow-x-auto max-h-48">{pedagogiePayload}</pre>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      {loading ? <p className="text-slate-600 text-sm">Chargement...</p> : null}
    </div>
  );
}
