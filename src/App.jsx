// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }          from './context/AuthContext';
import ProtectedRoute            from './components/ProtectedRoute';
import LoginPage                 from './pages/LoginPage';
import Dashboard                 from './pages/Dashboard';
import Sidebar                   from './components/Sidebar';
import './App.css';
import AjouterEtudiants          from './pages/AjouterEtudiants';
import ListeEtudiants            from './pages/ListeEtudiants';
import Trombinoscope             from './pages/Trombinoscope';
import ResultatsFinannee         from './pages/ResultatsFinannee';
import CertificatsInscription    from './pages/CertificatsInscription';
import GestionInscriptions       from './pages/GestionInscriptions';
import AnneesAcademiques         from './pages/AnneesAcademiques';
import Civilites                 from './pages/Civilites';
import Cycles                    from './pages/Cycles';
import Decisions                 from './pages/Decisions';
import Ecoles                    from './pages/Ecoles';
import Filieres                  from './pages/Filieres';
import Parcours                  from './pages/Parcours';
import Pays                      from './pages/Pays';
import Specialites               from './pages/Specialites';

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          {/* chemins relatifs — sans le / au début */}
          <Route path="dashboard"            element={<Dashboard />} />
          <Route path="ajouter-etudiants"    element={<AjouterEtudiants />} />
          <Route path="liste-etudiants"      element={<ListeEtudiants />} />
          <Route path="trombinoscope"        element={<Trombinoscope />} />
          <Route path="resultats"            element={<ResultatsFinannee />} />
          <Route path="certificats"          element={<CertificatsInscription />} />
          <Route path="gestion-inscriptions" element={<GestionInscriptions />} />
          <Route path="annees-academiques"   element={<AnneesAcademiques />} />
          <Route path="civilites"            element={<Civilites />} />
          <Route path="cycles"               element={<Cycles />} />
          <Route path="decisions"            element={<Decisions />} />
          <Route path="ecoles"               element={<Ecoles />} />
          <Route path="filieres"             element={<Filieres />} />
          <Route path="parcours"             element={<Parcours />} />
          <Route path="pays"                 element={<Pays />} />
          <Route path="specialites"          element={<Specialites />} />
          <Route path="*"                    element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}