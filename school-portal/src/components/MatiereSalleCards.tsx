import { useCallback, useEffect, useState } from 'react';
import type { AxiosInstance } from 'axios';
import { errorMessage } from '../utils/errors';

type SalleRow = { id: number; nom: string; description?: string | null };
type ClasseRow = { id: number; nom: string; description?: string | null };
type MatiereRow = {
  id: number;
  nom: string;
  description?: string | null;
  salleId?: number | null;
  classeId?: number | null;
  heureDebutSeance?: string | null;
  heureFinSeance?: string | null;
};
type SalleAvecMatieres = {
  salleId?: number;
  salleNom?: string;
  salleDescription?: string | null;
  matieres?: MatiereRow[];
};
type ClasseAvecMatieres = {
  classeId?: number;
  classeNom?: string;
  classeDescription?: string | null;
  matieres?: MatiereRow[];
};

function formatCreneau(debut?: string | null, fin?: string | null) {
  if (!debut || !fin) return 'Horaire non défini';
  return `${debut} - ${fin}`;
}

export function MatieresAffectationCard({
  client,
  title = 'Matières et salles',
}: {
  client: AxiosInstance | null;
  title?: string;
}) {
  const [rows, setRows] = useState<MatiereRow[]>([]);
  const [sallesMap, setSallesMap] = useState<Record<number, string>>({});
  const [classesMap, setClassesMap] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) return;
    const [matieresRes, sallesRes, classesRes] = await Promise.all([
      client.get<MatiereRow[]>('/matieres'),
      client.get<SalleRow[]>('/salles'),
      client.get<ClasseRow[]>('/classes'),
    ]);
    const matieres = Array.isArray(matieresRes.data) ? matieresRes.data : [];
    const salles = Array.isArray(sallesRes.data) ? sallesRes.data : [];
    const classes = Array.isArray(classesRes.data) ? classesRes.data : [];
    const nextMap = salles.reduce<Record<number, string>>((acc, s) => {
      acc[s.id] = s.nom;
      return acc;
    }, {});
    const nextClassesMap = classes.reduce<Record<number, string>>((acc, c) => {
      acc[c.id] = c.nom;
      return acc;
    }, {});
    setRows(matieres);
    setSallesMap(nextMap);
    setClassesMap(nextClassesMap);
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

  return (
    <div className="card" style={{ marginTop: '1rem', padding: 0 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--line)' }}>
        <strong>{title}</strong>
      </div>
      {err && <div className="alert alert-error">{err}</div>}
      <div className="table-wrap" style={{ border: 'none' }}>
        <table className="data">
          <thead>
            <tr>
              <th>ID matière</th>
              <th>Matière</th>
              <th>Classe</th>
              <th>Salle</th>
              <th>Créneau</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.nom}</td>
                <td>{m.classeId != null ? `${classesMap[m.classeId] ?? 'Classe'} (id ${m.classeId})` : '—'}</td>
                <td>{m.salleId != null ? `${sallesMap[m.salleId] ?? 'Salle'} (id ${m.salleId})` : '—'}</td>
                <td>{formatCreneau(m.heureDebutSeance, m.heureFinSeance)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--muted)' }}>
                  Aucune matière disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SallesAvecMatieresCard({
  client,
  title = 'Salles et matières dédiées',
}: {
  client: AxiosInstance | null;
  title?: string;
}) {
  const [rows, setRows] = useState<SalleAvecMatieres[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) return;
    const { data: sallesData } = await client.get<SalleRow[]>('/salles');
    const salles = Array.isArray(sallesData) ? sallesData : [];

    const details = await Promise.all(
      salles.map(async (s) => {
        const { data } = await client.get<SalleAvecMatieres>(`/salles/${s.id}/matieres-dediees`);
        return data;
      }),
    );

    setRows(details);
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

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{title}</h3>
      {err && <div className="alert alert-error">{err}</div>}
      {rows.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {rows.map((s, idx) => (
            <div key={s.salleId ?? `s-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>
                  {s.salleNom ?? 'Salle'} {s.salleId != null ? `(id ${s.salleId})` : ''}
                </strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {(s.matieres ?? []).length} matière(s)
                </span>
              </div>
              {s.salleDescription ? (
                <div style={{ marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.92rem' }}>{s.salleDescription}</div>
              ) : null}
              {(s.matieres ?? []).length > 0 ? (
                <ul style={{ margin: '0.65rem 0 0', paddingLeft: '1.15rem' }}>
                  {(s.matieres ?? []).map((m) => (
                    <li key={m.id} style={{ marginBottom: '0.45rem' }}>
                      <strong>{m.nom}</strong> — {formatCreneau(m.heureDebutSeance, m.heureFinSeance)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: '0.65rem 0 0', color: 'var(--muted)' }}>Aucune matière assignée à cette salle.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: 'var(--muted)' }}>Aucune salle disponible.</p>
      )}
    </div>
  );
}

export function ClassesAvecMatieresCard({
  client,
  title = 'Classes et matières dédiées',
  classId,
}: {
  client: AxiosInstance | null;
  title?: string;
  classId?: number;
}) {
  const [rows, setRows] = useState<ClasseAvecMatieres[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) return;

    if (classId != null) {
      const { data } = await client.get<ClasseAvecMatieres>(`/classes/${classId}/matieres-dediees`);
      setRows(data ? [data] : []);
      return;
    }

    const { data: classesData } = await client.get<ClasseRow[]>('/classes');
    const classes = Array.isArray(classesData) ? classesData : [];
    const details = await Promise.all(
      classes.map(async (c) => {
        const { data } = await client.get<ClasseAvecMatieres>(`/classes/${c.id}/matieres-dediees`);
        return data;
      }),
    );
    setRows(details);
  }, [client, classId]);

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

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{title}</h3>
      {err && <div className="alert alert-error">{err}</div>}
      {rows.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {rows.map((c, idx) => (
            <div key={c.classeId ?? `c-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>
                  {c.classeNom ?? 'Classe'} {c.classeId != null ? `(id ${c.classeId})` : ''}
                </strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {(c.matieres ?? []).length} matière(s)
                </span>
              </div>
              {c.classeDescription ? (
                <div style={{ marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.92rem' }}>{c.classeDescription}</div>
              ) : null}
              {(c.matieres ?? []).length > 0 ? (
                <ul style={{ margin: '0.65rem 0 0', paddingLeft: '1.15rem' }}>
                  {(c.matieres ?? []).map((m) => (
                    <li key={m.id} style={{ marginBottom: '0.45rem' }}>
                      <strong>{m.nom}</strong> — salle {m.salleId ?? '—'} — {formatCreneau(m.heureDebutSeance, m.heureFinSeance)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: '0.65rem 0 0', color: 'var(--muted)' }}>Aucune matière dédiée à cette classe.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: 'var(--muted)' }}>Aucune classe disponible.</p>
      )}
    </div>
  );
}
