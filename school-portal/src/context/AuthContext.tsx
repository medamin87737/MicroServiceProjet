import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { publicClient } from '../api/client';
import type { EnseignantSession, EtudiantSession } from '../types';
import { normalizeEnseignantRole } from '../utils/role';

/** GET public (gateway) — même source que les DTO lecture, rôle fiable pour l’en-tête. */
async function fetchEnseignantSessionFromApi(id: number): Promise<Partial<EnseignantSession>> {
  const { data } = await publicClient.get<{
    id?: number;
    nom?: string;
    description?: string | null;
    matricule?: string;
    role?: string;
  }>(`/enseignants/${id}`);
  return {
    id: data.id,
    nom: data.nom,
    description: data.description,
    matricule: data.matricule,
    role: normalizeEnseignantRole(data.role),
  };
}

const KEY_TYPE = 'twin6_user_type';
const KEY_ETU = 'twin6_etudiant';
const KEY_ENS = 'twin6_enseignant';

export type UserKind = 'etudiant' | 'enseignant' | null;

type AuthCtx = {
  userKind: UserKind;
  etudiant: EtudiantSession | null;
  enseignant: EnseignantSession | null;
  loading: boolean;
  loginEtudiant: (matricule: string, password: string) => Promise<void>;
  loginEnseignant: (matricule: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function loadInitial(): {
  userKind: UserKind;
  etudiant: EtudiantSession | null;
  enseignant: EnseignantSession | null;
} {
  try {
    const t = localStorage.getItem(KEY_TYPE) as UserKind;
    if (t === 'etudiant') {
      const raw = localStorage.getItem(KEY_ETU);
      if (raw) return { userKind: 'etudiant', etudiant: JSON.parse(raw), enseignant: null };
    }
    if (t === 'enseignant') {
      const raw = localStorage.getItem(KEY_ENS);
      if (raw) {
        const p = JSON.parse(raw) as EnseignantSession;
        return {
          userKind: 'enseignant',
          etudiant: null,
          enseignant: { ...p, role: normalizeEnseignantRole(p.role) },
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { userKind: null, etudiant: null, enseignant: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const init = loadInitial();
  const [userKind, setUserKind] = useState<UserKind>(init.userKind);
  const [etudiant, setEtudiant] = useState<EtudiantSession | null>(init.etudiant);
  const [enseignant, setEnseignant] = useState<EnseignantSession | null>(init.enseignant);
  const [loading, setLoading] = useState(false);

  /** Après chargement depuis le stockage ou au retour sur l’app : resynchroniser le rôle (Chef / Enseignant). */
  useEffect(() => {
    if (userKind !== 'enseignant' || !enseignant?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await fetchEnseignantSessionFromApi(enseignant.id);
        if (cancelled) return;
        setEnseignant((prev) => {
          if (!prev || prev.id !== enseignant.id) return prev;
          const role = normalizeEnseignantRole(fresh.role ?? prev.role);
          const next: EnseignantSession = {
            ...prev,
            nom: fresh.nom ?? prev.nom,
            description: fresh.description !== undefined ? fresh.description : prev.description,
            matricule: fresh.matricule ?? prev.matricule,
            role,
          };
          if (
            prev.role === next.role &&
            prev.nom === next.nom &&
            prev.matricule === next.matricule &&
            prev.description === next.description
          ) {
            return prev;
          }
          localStorage.setItem(KEY_ENS, JSON.stringify(next));
          return next;
        });
      } catch {
        /* réseau / gateway arrêté */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userKind, enseignant?.id]);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY_TYPE);
    localStorage.removeItem(KEY_ETU);
    localStorage.removeItem(KEY_ENS);
    setUserKind(null);
    setEtudiant(null);
    setEnseignant(null);
  }, []);

  const loginEtudiant = useCallback(async (matricule: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await publicClient.post<EtudiantSession>('/etudiants/auth/login', {
        matricule,
        password,
      });
      localStorage.setItem(KEY_TYPE, 'etudiant');
      localStorage.setItem(KEY_ETU, JSON.stringify(data));
      setEtudiant(data);
      setEnseignant(null);
      setUserKind('etudiant');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginEnseignant = useCallback(async (matricule: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await publicClient.post<EnseignantSession>('/enseignants/auth/login', {
        matricule,
        password,
      });
      let session: EnseignantSession = {
        ...data,
        role: normalizeEnseignantRole(data.role),
      };
      try {
        const fresh = await fetchEnseignantSessionFromApi(data.id);
        session = {
          ...session,
          ...fresh,
          role: normalizeEnseignantRole(fresh.role ?? session.role),
        };
      } catch {
        /* garder le rôle issu du login */
      }
      localStorage.setItem(KEY_TYPE, 'enseignant');
      localStorage.setItem(KEY_ENS, JSON.stringify(session));
      setEnseignant(session);
      setEtudiant(null);
      setUserKind('enseignant');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      userKind,
      etudiant,
      enseignant,
      loading,
      loginEtudiant,
      loginEnseignant,
      logout,
    }),
    [userKind, etudiant, enseignant, loading, loginEtudiant, loginEnseignant, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
