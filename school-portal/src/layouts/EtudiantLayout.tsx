import { motion } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EtudiantLayout() {
  const { etudiant, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell app-shell--etu">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">T6</div>
          <div>
            <div>Twin6 Campus</div>
            <div className="brand-sub">Espace étudiant</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {etudiant && (
            <span className="badge">
              {etudiant.nom} · {etudiant.matricule}
            </span>
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
        <NavLink to="/etudiant" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Accueil
        </NavLink>
        <NavLink
          to="/etudiant/classe"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Classe
        </NavLink>
        <NavLink
          to="/etudiant/matieres"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Matières
        </NavLink>
        <NavLink
          to="/etudiant/notes"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Notes
        </NavLink>
        <NavLink
          to="/etudiant/scenarios"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Scénarios inter-MS
        </NavLink>
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
