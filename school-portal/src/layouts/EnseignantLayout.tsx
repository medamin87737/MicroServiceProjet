import { motion } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/enseignant', label: 'Accueil' },
  { to: '/enseignant/scenarios', label: 'Scénarios inter-MS' },
  { to: '/enseignant/etudiants', label: 'Étudiants' },
  { to: '/enseignant/classes', label: 'Classes' },
  { to: '/enseignant/matieres', label: 'Matières' },
  { to: '/enseignant/salles', label: 'Salles' },
  { to: '/enseignant/notes', label: 'Notes' },
] as const;

export default function EnseignantLayout() {
  const { enseignant, logout } = useAuth();
  const navigate = useNavigate();
  const isChef = enseignant?.role === 'Chef Enseignant';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">T6</div>
          <div>
            <div>Twin6 Campus</div>
            <div className="brand-sub">Espace enseignant</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {enseignant && (
            <>
              <span className="badge">{enseignant.nom}</span>
              <span className="badge" style={{ background: '#f0f0f0', color: 'var(--ink)' }}>
                {enseignant.role}
              </span>
            </>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-title">Menu</div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/enseignant'}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
        {isChef && (
          <NavLink
            to="/enseignant/enseignants"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Équipe enseignants
          </NavLink>
        )}
      </aside>

      <motion.main
        className="main-area"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
