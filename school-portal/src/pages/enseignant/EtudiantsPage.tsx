import { useCallback, useEffect, useState, type FormEvent } from 'react';
import PrivilegeHint from '../../components/PrivilegeHint';
import { useEnseignantApi } from '../../hooks/useEnseignantApi';
import { useEnseignantPrivileges } from '../../hooks/useEnseignantPrivileges';
import { errorMessage } from '../../utils/errors';

type Row = {
  id: number;
  nom: string;
  description?: string | null;
  matricule?: string | null;
  classeId?: number | null;
};

export default function EtudiantsPage() {
  const client = useEnseignantApi();
  const { canManageRefData } = useEnseignantPrivileges();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [classeIdStr, setClasseIdStr] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!client) return;
    const { data } = await client.get<Row[]>('/etudiants');
    setRows(Array.isArray(data) ? data : []);
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

  function reset() {
    setNom('');
    setDescription('');
    setMatricule('');
    setPassword('');
    setClasseIdStr('');
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!client || !canManageRefData) return;
    setBusy(true);
    setErr(null);
    try {
      let classeId: number | null = null;
      if (classeIdStr.trim() !== '') {
        const n = Number(classeIdStr);
        if (!Number.isInteger(n) || n < 1) {
          setErr('ID classe invalide (entier positif ou vide).');
          setBusy(false);
          return;
        }
        classeId = n;
      }

      if (editingId != null) {
        const body: Record<string, unknown> = {
          nom: nom.trim(),
          description: description.trim() || null,
          matricule: matricule.trim(),
          classeId,
        };
        if (password.trim()) body.password = password.trim();
        await client.put(`/etudiants/${editingId}`, body);
      } else {
        await client.post('/etudiants', {
          nom: nom.trim(),
          description: description.trim() || null,
          matricule: matricule.trim(),
          password: password.trim() || undefined,
          classeId,
        });
      }
      reset();
      await load();
    } catch (ex) {
      setErr(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    if (!client || !canManageRefData) return;
    if (!window.confirm('Supprimer cet étudiant ?')) return;
    setBusy(true);
    setErr(null);
    try {
      await client.delete(`/etudiants/${id}`);
      if (editingId === id) reset();
      await load();
    } catch (ex) {
      setErr(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  }

  function onEdit(r: Row) {
    setEditingId(r.id);
    setNom(r.nom);
    setDescription(r.description ?? '');
    setMatricule(r.matricule ?? '');
    setPassword('');
    setClasseIdStr(r.classeId != null && r.classeId > 0 ? String(r.classeId) : '');
  }

  return (
    <>
      <h1 className="page-title">Étudiants</h1>
      {!canManageRefData && <PrivilegeHint variant="readOnlyRef" />}
      <p className="page-desc">
        {canManageRefData
          ? 'Gestion des fiches étudiants (création, modification, suppression) — Chef Enseignant uniquement.'
          : 'Liste en lecture pour les enseignants ; les écritures sont réservées au Chef Enseignant.'}
      </p>
      {err && <div className="alert alert-error">{err}</div>}

      {canManageRefData && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>
            {editingId != null ? 'Modifier un étudiant' : 'Nouvel étudiant'}
          </h3>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="etu-nom">Nom</label>
              <input id="etu-nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="etu-desc">Description</label>
              <input id="etu-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="etu-mat">Matricule</label>
              <input id="etu-mat" value={matricule} onChange={(e) => setMatricule(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="etu-classe">ID classe (optionnel)</label>
              <input
                id="etu-classe"
                type="number"
                min={1}
                placeholder="Ex. 1"
                value={classeIdStr}
                onChange={(e) => setClasseIdStr(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="etu-pass">
                Mot de passe {editingId != null ? '(laisser vide pour ne pas changer)' : ''}
              </label>
              <input
                id="etu-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {editingId != null ? 'Enregistrer' : 'Créer'}
              </button>
              {editingId != null && (
                <button type="button" className="btn btn-ghost" onClick={reset}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Classe id</th>
                <th>Description</th>
                {canManageRefData && <th style={{ width: 200 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.nom}</td>
                  <td>{r.matricule ?? '—'}</td>
                  <td>{r.classeId ?? '—'}</td>
                  <td>{r.description ?? '—'}</td>
                  {canManageRefData && (
                    <td>
                      <div className="btn-row">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(r)}>
                          Modifier
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(r.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
