// src/pages/CertificatInscription.jsx
import { useState, useEffect } from 'react';
import '../App.css';

// Modal pour visualiser un certificat
function ModalVisualiserCertificat({ certificat, onClose }) {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const handleImprimer = () => {
    window.print();
  };

  const handleTelecharger = async () => {
    try {
      const res = await fetch(`/api/certificats-inscription/${certificat.id}/pdf`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur téléchargement');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat_${certificat.numero_certificat || certificat.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Certificat d'inscription</h2>
          <div className="flex gap-2">
            <button onClick={handleImprimer} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">🖨️ Imprimer</button>
            <button onClick={handleTelecharger} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">📥 PDF</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        </div>
        
        <div className="p-8 print:p-4" id="certificat-content">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-800">INSTITUT 2iE</h1>
            <p className="text-gray-600">Institut International d'Ingénierie de l'Eau et de l'Environnement</p>
            <p className="text-gray-500 text-sm">Burkina Faso · Niger · Mali</p>
          </div>

          {/* Titre */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold border-b-2 border-blue-800 inline-block pb-2 px-8">
              CERTIFICAT D'INSCRIPTION
            </h2>
          </div>

          {/* Numéro */}
          <div className="text-right mb-6">
            <p className="text-sm text-gray-600">N°: <span className="font-semibold">{certificat.numero_certificat || `CERT-${certificat.id}`}</span></p>
            <p className="text-sm text-gray-600">Date d'émission: {formatDate(certificat.date_emission)}</p>
          </div>

          {/* Corps */}
          <div className="space-y-4 mb-8">
            <p className="text-lg">Je soussigné(e), <span className="font-bold">{certificat.responsable_nom || "Le Directeur des Études"}</span>,</p>
            <p>atteste que l'étudiant(e) :</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-semibold">Nom :</span> {certificat.etudiant_nom}</p>
              <p><span className="font-semibold">Prénoms :</span> {certificat.etudiant_prenoms}</p>
              <p><span className="font-semibold">Date de naissance :</span> {formatDate(certificat.etudiant_date_naissance)}</p>
              <p><span className="font-semibold">Nationalité :</span> {certificat.etudiant_pays || '—'}</p>
              <p><span className="font-semibold">Email :</span> {certificat.etudiant_email || '—'}</p>
              <p><span className="font-semibold">Téléphone :</span> {certificat.etudiant_telephone || '—'}</p>
            </div>

            <p>est régulièrement inscrit(e) à l'<span className="font-bold">Institut 2iE</span> pour l'année académique <span className="font-bold">{certificat.annee_academique}</span>,</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-semibold">Classe :</span> {certificat.classe_nom}</p>
              <p><span className="font-semibold">Filière :</span> {certificat.filiere_nom || '—'}</p>
              <p><span className="font-semibold">Niveau :</span> {certificat.niveau_nom || '—'}</p>
            </div>

            <p>L'inscription a été effectuée le <span className="font-semibold">{formatDate(certificat.date_inscription)}</span>.</p>

            {certificat.montant && (
              <p className="mt-4">Les frais de scolarité s'élèvent à <span className="font-bold">{certificat.montant.toLocaleString()} FCFA</span>.</p>
            )}

            {certificat.observations && (
              <p className="mt-4 text-gray-600 italic">Observations: {certificat.observations}</p>
            )}
          </div>

          {/* Signature */}
          <div className="mt-12 pt-8">
            <div className="border-t border-gray-300 pt-4 text-center">
              <p className="text-gray-600">Fait à Ouagadougou, le {formatDate(new Date())}</p>
              <p className="mt-4">Pour le Directeur des Études,</p>
              <div className="mt-8">
                <p className="font-bold">Signature et cachet</p>
                <div className="h-16 w-32 bg-gray-100 mx-auto mt-2 flex items-center justify-center text-gray-400 text-sm">
                  [Cachet]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal pour ajouter/modifier un certificat
function ModalFormulaireCertificat({ certificat, onClose, onSave }) {
  const [form, setForm] = useState({
    etudiant_id: '',
    annee_academique_id: '',
    classe_id: '',
    date_emission: new Date().toISOString().split('T')[0],
    responsable_nom: '',
    observations: '',
    numero_certificat: ''
  });
  const [etudiants, setEtudiants] = useState([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!certificat;

  useEffect(() => {
    // Charger les listes
    Promise.all([
      fetch('/api/etudiants', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
      fetch('/api/annees-academiques', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
      fetch('/api/classes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json())
    ]).then(([etudiantsData, anneesData, classesData]) => {
      setEtudiants(Array.isArray(etudiantsData) ? etudiantsData : []);
      setAnneesAcademiques(Array.isArray(anneesData) ? anneesData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    }).catch(console.error);

    // Si édition, charger les données
    if (certificat) {
      setForm({
        etudiant_id: certificat.etudiant_id || '',
        annee_academique_id: certificat.annee_academique_id || '',
        classe_id: certificat.classe_id || '',
        date_emission: certificat.date_emission || new Date().toISOString().split('T')[0],
        responsable_nom: certificat.responsable_nom || '',
        observations: certificat.observations || '',
        numero_certificat: certificat.numero_certificat || ''
      });
    }
  }, [certificat]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = isEditing ? `/api/certificats-inscription/${certificat.id}` : '/api/certificats-inscription';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de l\'enregistrement');
      }
      const data = await res.json();
      onSave(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Modifier le certificat' : 'Nouveau certificat d\'inscription'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro du certificat</label>
            <input name="numero_certificat" value={form.numero_certificat} onChange={handleChange} placeholder="Ex: CERT-2024-001" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant *</label>
            <select name="etudiant_id" value={form.etudiant_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionner --</option>
              {etudiants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenoms}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année académique *</label>
            <select name="annee_academique_id" value={form.annee_academique_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionner --</option>
              {anneesAcademiques.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
            <select name="classe_id" value={form.classe_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionner --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
            <input type="date" name="date_emission" value={form.date_emission} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du responsable</label>
            <input name="responsable_nom" value={form.responsable_nom} onChange={handleChange} placeholder="Le Directeur des Études" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
            <textarea name="observations" value={form.observations} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition">
              {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CertificatInscription() {
  const [certificats, setCertificats] = useState([]);
  const [filteredCertificats, setFilteredCertificats] = useState([]);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCertificat, setSelectedCertificat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');

  // Charger les certificats
  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      const res = await fetch('/api/certificats-inscription', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setCertificats(Array.isArray(data) ? data : []);
      setFilteredCertificats(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Impossible de charger les certificats');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les certificats
  useEffect(() => {
    let result = [...certificats];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.numero_certificat && c.numero_certificat.toLowerCase().includes(term)) ||
        (c.etudiant_nom && c.etudiant_nom.toLowerCase().includes(term)) ||
        (c.etudiant_prenoms && c.etudiant_prenoms.toLowerCase().includes(term)) ||
        (c.classe_nom && c.classe_nom.toLowerCase().includes(term))
      );
    }
    
    if (filterAnnee) {
      result = result.filter(c => c.annee_academique_id === parseInt(filterAnnee));
    }
    
    setFilteredCertificats(result);
  }, [searchTerm, filterAnnee, certificats]);

  // Extraire les années uniques pour le filtre
  const anneesUniques = [...new Map(certificats.map(c => [c.annee_academique_id, c.annee_academique])).entries()].map(([id, libelle]) => ({ id, libelle }));

  const handleAjouter = (nouveauCertificat) => {
    setCertificats([nouveauCertificat, ...certificats]);
  };

  const handleModifier = (certificatModifie) => {
    setCertificats(certificats.map(c => c.id === certificatModifie.id ? certificatModifie : c));
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce certificat ? Cette action est irréversible.')) return;
    try {
      const res = await fetch(`/api/certificats-inscription/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur suppression');
      setCertificats(certificats.filter(c => c.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="page">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Certificats d'inscription</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredCertificats.length} certificat(s) sur {certificats.length}
          </p>
        </div>
        <button 
          onClick={() => setShowAjoutModal(true)} 
          className="btn btn-primary"
        >
          <span className="text-lg leading-none">+</span>
          Nouveau certificat
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Recherche</label>
            <input 
              type="text" 
              placeholder="N° certificat, étudiant, classe..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Année académique</label>
            <select 
              value={filterAnnee} 
              onChange={(e) => setFilterAnnee(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
              {anneesUniques.map(a => (
                <option key={a.id} value={a.id}>{a.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setSearchTerm(''); setFilterAnnee(''); }} 
              className="w-full bg-gray-500 text-white rounded-lg py-2 text-sm hover:bg-gray-600 transition"
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Liste des certificats */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span>Chargement des certificats...</span>
          </div>
        ) : filteredCertificats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">📜</span>
            <p className="text-lg font-medium">Aucun certificat trouvé</p>
            <p className="text-sm mt-1">
              {certificats.length === 0 
                ? 'Cliquez sur "Nouveau certificat" pour commencer' 
                : 'Aucun résultat ne correspond à votre recherche'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">N° Certificat</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Étudiant</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Classe</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Année académique</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Date d'émission</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Responsable</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificats.map((certificat, index) => (
                  <tr 
                    key={certificat.id} 
                    className={`border-b border-gray-100 hover:bg-blue-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium text-blue-600">
                      {certificat.numero_certificat || `CERT-${certificat.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{certificat.etudiant_prenoms} {certificat.etudiant_nom}</div>
                      {certificat.etudiant_email && (
                        <div className="text-xs text-gray-500">{certificat.etudiant_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{certificat.classe_nom || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{certificat.annee_academique || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(certificat.date_emission)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {certificat.responsable_nom || 'Le Directeur des Études'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedCertificat(certificat); setShowViewModal(true); }} 
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Voir"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => { setSelectedCertificat(certificat); setShowEditModal(true); }} 
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleSupprimer(certificat.id)} 
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {certificats.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{certificats.length}</p>
            <p className="text-sm text-gray-500">Total certificats</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {new Set(certificats.map(c => c.etudiant_id)).size}
            </p>
            <p className="text-sm text-gray-500">Étudiants distincts</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {new Set(certificats.map(c => c.annee_academique)).size}
            </p>
            <p className="text-sm text-gray-500">Années différentes</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {certificats.filter(c => c.date_emission && new Date(c.date_emission).getMonth() === new Date().getMonth()).length}
            </p>
            <p className="text-sm text-gray-500">Ce mois-ci</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAjoutModal && (
        <ModalFormulaireCertificat 
          onClose={() => setShowAjoutModal(false)} 
          onSave={handleAjouter}
        />
      )}
      {showEditModal && selectedCertificat && (
        <ModalFormulaireCertificat 
          certificat={selectedCertificat}
          onClose={() => { setShowEditModal(false); setSelectedCertificat(null); }} 
          onSave={handleModifier}
        />
      )}
      {showViewModal && selectedCertificat && (
        <ModalVisualiserCertificat 
          certificat={selectedCertificat}
          onClose={() => { setShowViewModal(false); setSelectedCertificat(null); }} 
        />
      )}
    </div>
  );
}