// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';


const gestionLinks = [

  { to: '/ajouter-etudiants',      label: 'Ajouter étudiants' },
  {to:'/gestion-inscriptions', label: 'Gestion des inscriptions' },
  { to: '/liste-etudiants',        label: 'Liste des étudiants' },
 { to: '/certificats',            label: 'Certificats d\'inscription' },
  { to: '/trombinoscope',          label: 'Trombinoscope' },
  { to: '/resultats',              label: 'Résultats de fin d\'année' },
 
  
];

const ressourcesLinks = [
   { to: '/ecoles',             label: 'Écoles' },
  { to: '/filieres',           label: 'Filières' },
   { to: '/specialites',        label: 'Spécialités' },
   {to:'/niveaux',               label: 'Niveaux' },
    { to: '/cycles',             label: 'Cycles' },
      { to: '/parcours',           label: 'Parcours' },
      {to:'/inscriptions', label: 'Inscriptions' },
      {to:'/etudiants', label: 'Étudiants' },
  { to: '/pays',               label: 'Pays' },
  { to: '/annees-academiques', label: 'Années académiques' },
  {to:'/classes', label: 'Classes' },
  { to: '/civilites',          label: 'Civilités' },
  { to: '/decisions',          label: 'Décisions' },
 

 
];

function NavSection({ label, icon, links, color }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-section">
      <button
        onClick={() => setOpen(!open)}
        className="nav-button"
      >
        <div className={`nav-icon ${color}`}>
          {icon}
        </div>
        <span>{label}</span>
        <span className={`ml-auto text-xs text-gray-400 transition-transform duration-200
                          ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="nav-links">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="nav-link"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { logout, user } = useAuth();   // ← récupère logout et user
    const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');  // ← redirige vers login après déconnexion
  };



  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">Gestion 2IE</div>
        <p className="text-xs text-gray-400 mt-0.5">Système de gestion académique</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-2">
          Menu principal
        </p>

        <NavSection
          label="Gestion des étudiants"
          color="bg-blue-50 text-blue-600"
          icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/></svg>}
          links={gestionLinks}
        />

        <div className="my-1 mx-4 border-t border-gray-100" />

        <NavSection
          label="Ressources"
          color="bg-green-50 text-green-700"
          icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zm7 0h5v5H9zm-7 7h5v5H2zm7 0h5v5H9z"/></svg>}
          links={ressourcesLinks}
        />
      </nav>




        {/* Utilisateur + Logout — tout en bas */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Connecté en tant que</p>
        <p className="text-sm font-medium text-gray-800 truncate">{user?.nom || user?.email}</p>
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm"
          style={{ width: '100%', marginTop: '12px' }}
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}