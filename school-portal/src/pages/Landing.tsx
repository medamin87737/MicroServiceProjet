import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Landing() {
  return (
    <div className="landing-hero">
      <div className="landing-grid" aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          className="brand-mark"
          style={{ margin: '0 auto 1rem', width: 56, height: 56, fontSize: '1.1rem' }}
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          T6
        </motion.div>
        <motion.h1
          className="page-title"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.5rem' }}
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Twin6 Campus
        </motion.h1>
        <motion.p
          className="page-desc"
          style={{ margin: '0 auto 2.5rem' }}
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Portail pédagogique — espace étudiant et enseignant, connecté à votre microservices
          gateway.
        </motion.p>

        <motion.div
          className="login-split"
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          <Link to="/login/etudiant" className="card shimmer" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="badge" style={{ marginBottom: '0.75rem' }}>
                  Espace étudiant
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.35rem', fontSize: '1.25rem' }}>
                  Connexion matricule
                </h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Consultez votre profil et l’actualité du campus.
                </p>
              </div>
              <span style={{ fontSize: '1.5rem', color: 'var(--accent)' }} aria-hidden>
                →
              </span>
            </div>
          </Link>

          <Link to="/login/enseignant" className="card" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="badge" style={{ marginBottom: '0.75rem' }}>
                  Espace enseignant
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.35rem', fontSize: '1.25rem' }}>
                  Gestion & notes
                </h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Classes, matières, salles et notes selon vos droits.
                </p>
              </div>
              <span style={{ fontSize: '1.5rem', color: 'var(--accent)' }} aria-hidden>
                →
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
