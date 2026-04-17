import { useCallback, useEffect, useState, type FormEvent } from 'react';
import PrivilegeHint from '../../components/PrivilegeHint';
import { useEnseignantApi } from '../../hooks/useEnseignantApi';
import { useEnseignantPrivileges } from '../../hooks/useEnseignantPrivileges';
import { errorMessage } from '../../utils/errors';

type HistRow = {
  _id?: string;
  etudiantId?: number;
  matiereId?: number;
  ancienneValeur?: number;
  nouvelleValeur?: number;
  action?: string;
  createdAt?: string;
};

type NoteLookupRow = {
  inscriptionId?: string;
  etudiantId?: number;
  matiereId?: number;
  note?: {
    id?: string;
    valeur?: number;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

export default function NotesPage() {
  const client = useEnseignantApi();
  const { canWriteNotes, isChef } = useEnseignantPrivileges();

  const [historique, setHistorique] = useState<HistRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [insE, setInsE] = useState('');
  const [insM, setInsM] = useState('');
  const [noteE, setNoteE] = useState('');
  const [noteM, setNoteM] = useState('');
  const [noteV, setNoteV] = useState('12');
  const [lookupEtudiantId, setLookupEtudiantId] = useState('');
  const [lookupRows, setLookupRows] = useState<NoteLookupRow[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [selectedNoteMeta, setSelectedNoteMeta] = useState<{ etudiantId?: number; matiereId?: number } | null>(
    null,
  );
  const [updateValue, setUpdateValue] = useState('12');

  const load = useCallback(async () => {
    if (!client) return;
    const { data } = await client.get<HistRow[]>('/notes/historique');
    setHistorique(Array.isArray(data) ? data : []);
  }, [client]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    (async () => {
      setErr(null);
      try {
        await load();
      } catch (e) {
        if (!cancelled) setErr(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, load]);

  async function submitInscription(e: FormEvent) {
    e.preventDefault();
    if (!client || !canWriteNotes) return;
    setBusy(true);
    setErr(null);
    try {
      await client.post('/notes/inscriptions', {
        etudiantId: Number(insE),
        matiereId: Number(insM),
      });
      setInsE('');
      setInsM('');
      await load();
    } catch (ex) {
      setErr(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  }

  async function submitNote(e: FormEvent) {
    e.preventDefault();
    if (!client || !canWriteNotes) return;
    setBusy(true);
    setErr(null);
    try {
      await client.post('/notes', {
        etudiantId: Number(noteE),
        matiereId: Number(noteM),
        valeur: Number(noteV),
      });
      setNoteE('');
      setNoteM('');
      setNoteV('12');
      await load();
    } catch (ex) {
      setErr(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  }

  async function lookupNotesByEtudiant(e: FormEvent) {
    e.preventDefault();
    if (!client || !canWriteNotes) return;
    const etuId = Number(lookupEtudiantId);
    if (!Number.isInteger(etuId) || etuId < 1) {
      setErr("ID étudiant invalide.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { data } = await client.get<NoteLookupRow[]>(`/notes/etudiants/${etuId}`);
      setLookupRows(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(errorMessage(ex));
      setLookupRows([]);
    } finally {
      setBusy(false);
    }
  }

  function chooseNoteToEdit(row: NoteLookupRow) {
    const noteId = row.note?.id;
    if (!noteId) return;
    setSelectedNoteId(noteId);
    setSelectedNoteMeta({ etudiantId: row.etudiantId, matiereId: row.matiereId });
    setUpdateValue(String(row.note?.valeur ?? 12));
  }

  async function submitUpdateNote(e: FormEvent) {
    e.preventDefault();
    if (!client || !canWriteNotes) return;
    if (!selectedNoteId) {
      setErr('Sélectionnez une note à modifier dans le tableau.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await client.put(`/notes/${selectedNoteId}`, {
        valeur: Number(updateValue),
      });
      await load();
      if (lookupEtudiantId.trim() !== '') {
        const { data } = await client.get<NoteLookupRow[]>(`/notes/etudiants/${Number(lookupEtudiantId)}`);
        setLookupRows(Array.isArray(data) ? data : []);
      }
    } catch (ex) {
      setErr(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Notes</h1>
      <p className="page-desc">
        Même logique que le service MSNotes : lecture pour Enseignant et Chef ; inscriptions et saisie de
        notes pour le rôle Enseignant uniquement.
      </p>
      {isChef && <PrivilegeHint variant="chefNotesReadOnly" />}
      {canWriteNotes && <PrivilegeHint variant="enseignantNotes" />}
      {err && <div className="alert alert-error">{err}</div>}

      {canWriteNotes && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Inscrire un étudiant à une matière</h3>
          <form onSubmit={submitInscription} style={{ display: 'grid', gap: '0.75rem', maxWidth: 400 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Étudiant ID</label>
              <input type="number" min={1} value={insE} onChange={(e) => setInsE(e.target.value)} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Matière ID</label>
              <input type="number" min={1} value={insM} onChange={(e) => setInsM(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Inscrire
            </button>
          </form>
        </div>
      )}

      {canWriteNotes && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Affecter une note (0–20)</h3>
          <form onSubmit={submitNote} style={{ display: 'grid', gap: '0.75rem', maxWidth: 400 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Étudiant ID</label>
              <input type="number" min={1} value={noteE} onChange={(e) => setNoteE(e.target.value)} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Matière ID</label>
              <input type="number" min={1} value={noteM} onChange={(e) => setNoteM(e.target.value)} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Note</label>
              <input
                type="number"
                min={0}
                max={20}
                step="0.25"
                value={noteV}
                onChange={(e) => setNoteV(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {canWriteNotes && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>
            Modifier une note existante (sélection + mise à jour)
          </h3>
          <form onSubmit={lookupNotesByEtudiant} style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Étudiant ID (pour charger ses notes)</label>
              <input
                type="number"
                min={1}
                value={lookupEtudiantId}
                onChange={(e) => setLookupEtudiantId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-ghost" disabled={busy}>
              Charger notes de l'étudiant
            </button>
          </form>

          <div className="table-wrap" style={{ marginTop: '0.9rem' }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Inscription ID</th>
                  <th>Étudiant</th>
                  <th>Matière</th>
                  <th>Note ID</th>
                  <th>Valeur</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lookupRows.map((r, idx) => (
                  <tr key={r.inscriptionId ?? String(idx)}>
                    <td>{r.inscriptionId ?? '—'}</td>
                    <td>{r.etudiantId ?? '—'}</td>
                    <td>{r.matiereId ?? '—'}</td>
                    <td>{r.note?.id ?? '—'}</td>
                    <td>{typeof r.note?.valeur === 'number' ? r.note.valeur : '—'}</td>
                    <td>
                      {r.note?.id ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => chooseNoteToEdit(r)}
                        >
                          Modifier
                        </button>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>Aucune note</span>
                      )}
                    </td>
                  </tr>
                ))}
                {lookupRows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ color: 'var(--muted)' }}>
                      Chargez un étudiant pour sélectionner une note à modifier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={submitUpdateNote} style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Note ID sélectionnée</label>
              <input value={selectedNoteId} readOnly placeholder="Cliquez sur Modifier dans le tableau" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Contexte</label>
              <input
                value={
                  selectedNoteMeta
                    ? `Étudiant ${selectedNoteMeta.etudiantId ?? '—'} · Matière ${selectedNoteMeta.matiereId ?? '—'}`
                    : ''
                }
                readOnly
                placeholder="Aucun contexte sélectionné"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Nouvelle valeur (0–20)</label>
              <input
                type="number"
                min={0}
                max={20}
                step="0.25"
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy || !selectedNoteId}>
              Enregistrer modification
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--line)' }}>
          <strong>Historique</strong>
        </div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Matière</th>
                <th>Action</th>
                <th>Ancienne</th>
                <th>Nouvelle</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((h, i) => (
                <tr key={h._id ?? String(i)}>
                  <td>{h.etudiantId ?? '—'}</td>
                  <td>{h.matiereId ?? '—'}</td>
                  <td>{h.action ?? '—'}</td>
                  <td>{h.ancienneValeur ?? '—'}</td>
                  <td>{h.nouvelleValeur ?? '—'}</td>
                  <td>{h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
