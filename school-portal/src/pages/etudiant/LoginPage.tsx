import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../utils/errors';

export default function EtudiantLogin() {
  const { loginEtudiant, loading, userKind } = useAuth();
  const navigate = useNavigate();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (userKind === 'etudiant') navigate('/etudiant', { replace: true });
  }, [userKind, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await loginEtudiant(matricule.trim(), password);
      navigate('/etudiant', { replace: true });
    } catch (ex) {
      setErr(errorMessage(ex));
    }
  }

  return (
    <div className="landing-hero" style={{ minHeight: '100vh' }}>
      <motion.div
        className="card"
        style={{ maxWidth: 420, width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="badge" style={{ marginBottom: '1rem' }}>
          Étudiant
        </div>
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
          Connexion
        </h1>
        <p className="page-desc" style={{ marginBottom: '1.25rem' }}>
          Matricule et mot de passe
        </p>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="etu-m">Matricule</label>
            <input
              id="etu-m"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="etu-p">Mot de passe</label>
            <input
              id="etu-p"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Connexion…' : 'Entrer'}
          </button>
        </form>
        <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
          <Link to="/">← Retour</Link>
        </p>
      </motion.div>
    </div>
  );
}
