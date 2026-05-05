// // src/pages/Dashboard.jsx
// function Dashboard() {
//   return (
//     <div className="p-6 max-w-6xl mx-auto">

//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
//         <p className="text-sm text-gray-500 mt-1">Bienvenue sur le système de gestion 2IE</p>
//       </div>

//       {/* Cartes statistiques */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
//           <p className="text-sm text-gray-500 mb-1">Total étudiants</p>
//           <p className="text-3xl font-bold text-blue-600">0</p>
//         </div>
//         <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
//           <p className="text-sm text-gray-500 mb-1">Filières</p>
//           <p className="text-3xl font-bold text-green-600">0</p>
//         </div>
//         <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
//           <p className="text-sm text-gray-500 mb-1">Inscriptions</p>
//           <p className="text-3xl font-bold text-purple-600">0</p>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default Dashboard;



// src/pages/Dashboard.jsx
import { useState } from 'react';
import AjouterEtudiant from '../pages/AjouterEtudiants';
import '../App.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="page">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue sur le système de gestion 2IE</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Statistiques
        </button>
        <button
          onClick={() => setActiveTab('ajouter')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'ajouter'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ajouter un étudiant
        </button>
        <button
          onClick={() => setActiveTab('liste')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'liste'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Liste des étudiants
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-1">Total étudiants</p>
              <p className="text-3xl font-bold text-blue-600">546</p>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-1">Filières</p>
              <p className="text-3xl font-bold text-green-600">156</p>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-1">Inscriptions</p>
              <p className="text-3xl font-bold text-purple-600">265</p>
            </div>
          </div>
        )}

        {activeTab === 'ajouter' && (
          <AjouterEtudiant onSuccess={() => setActiveTab('liste')} />
        )}

        {activeTab === 'liste' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <p className="text-gray-500">Liste des étudiants à venir...</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;