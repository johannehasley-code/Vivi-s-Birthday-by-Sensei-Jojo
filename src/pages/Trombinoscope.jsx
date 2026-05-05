// src/pages/Trombinoscope.jsx
import { useState, useEffect, useRef } from 'react';
import '../App.css';

function ModalPhotoEtudiant({ etudiant, onClose, onPhotoUploaded }) {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (etudiant.photo_url) {
      setPreview(etudiant.photo_url);
    }
  }, [etudiant.photo_url]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 5 Mo');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!photo) {
      setError('Veuillez sélectionner une photo');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('photo', photo);
    
    try {
      const res = await fetch(`/api/etudiants/${etudiant.id}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur lors de l\'upload');
      const data = await res.json();
      onPhotoUploaded(etudiant.id, data.photo_url);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerPhoto = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/etudiants/${etudiant.id}/photo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      onPhotoUploaded(etudiant.id, null);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Photo de {etudiant.prenoms} {etudiant.nom}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 mb-4 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl text-gray-400">📷</span>
            )}
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="mb-2 w-full bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700">📁 Choisir une photo</button>
          
          {photo && <p className="text-sm text-green-600 mb-2">Photo sélectionnée: {photo.name}</p>}
          
          <div className="flex gap-3 w-full mt-2">
            <button onClick={handleUpload} disabled={loading || !photo} className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Upload...' : '💾 Enregistrer'}
            </button>
            {etudiant.photo_url && (
              <button onClick={handleSupprimerPhoto} disabled={loading} className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700">🗑️ Supprimer</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarteEtudiant({ etudiant, civilite, pays, onPhotoClick, onPhotoUpdated }) {
  const [photoUrl, setPhotoUrl] = useState(etudiant.photo_url);

  useEffect(() => {
    setPhotoUrl(etudiant.photo_url);
  }, [etudiant.photo_url]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-700">
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden cursor-pointer hover:opacity-80 transition"
            onClick={() => onPhotoClick(etudiant)}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={`${etudiant.prenoms} ${etudiant.nom}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 bg-gray-50">
                👤
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-14 pb-4 px-4 text-center">
        <h3 className="font-bold text-lg text-gray-800">{civilite?.libelle} {etudiant.prenoms} {etudiant.nom}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {etudiant.dateNaissance ? new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR') : 'Date non renseignée'}
        </p>
        <p className="text-sm text-gray-600 mt-1">📍 {pays?.nom || 'Pays non renseigné'}</p>
        
        {etudiant.email && (
          <p className="text-xs text-gray-500 mt-2 truncate">✉️ {etudiant.email}</p>
        )}
        {etudiant.telephone && (
          <p className="text-xs text-gray-500">📞 {etudiant.telephone}</p>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button 
            onClick={() => onPhotoClick(etudiant)}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition"
          >
            📷 {photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Trombinoscope() {
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [paysMap, setPaysMap] = useState({});
  const [civilitesMap, setCivilitesMap] = useState({});
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPays, setFilterPays] = useState('');
  const [filterCivilite, setFilterCivilite] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list

  useEffect(() => {
    fetch('/api/pays', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    }).then(res => res.json()).then(data => {
      const map = {};
      (Array.isArray(data) ? data : []).forEach(p => map[p.id] = p);
      setPaysMap(map);
    }).catch(console.error);
    
    fetch('/api/civilites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    }).then(res => res.json()).then(data => {
      const map = {};
      (Array.isArray(data) ? data : []).forEach(c => map[c.id] = c);
      setCivilitesMap(map);
    }).catch(console.error);
    
    fetchEtudiants();
  }, []);

  const fetchEtudiants = async () => {
    try {
      const res = await fetch('/api/etudiants', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setEtudiants(Array.isArray(data) ? data : []);
      setFilteredEtudiants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Impossible de charger les étudiants');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (etudiantId, photoUrl) => {
    setEtudiants(etudiants.map(e => e.id === etudiantId ? { ...e, photo_url: photoUrl } : e));
    setFilteredEtudiants(filteredEtudiants.map(e => e.id === etudiantId ? { ...e, photo_url: photoUrl } : e));
  };

  useEffect(() => {
    let result = [...etudiants];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.nom.toLowerCase().includes(term) || 
        e.prenoms.toLowerCase().includes(term) ||
        (e.email && e.email.toLowerCase().includes(term))
      );
    }
    
    if (filterPays) {
      result = result.filter(e => e.pays_id === parseInt(filterPays));
    }
    
    if (filterCivilite) {
      result = result.filter(e => e.civilites_id === parseInt(filterCivilite));
    }
    
    setFilteredEtudiants(result);
  }, [searchTerm, filterPays, filterCivilite, etudiants]);

  const paysList = Object.values(paysMap);
  const civilitesList = Object.values(civilitesMap);

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trombinoscope</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredEtudiants.length} étudiant(s) affiché(s) sur {etudiants.length}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setViewMode('grid')} className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}>📱 Grid</button>
          <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}>📋 Liste</button>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-box">
        <div className="filter-row">
          <div className="form-group">
            <label>Recherche</label>
            <input type="text" placeholder="Nom, prénom, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Pays</label>
            <select value={filterPays} onChange={(e) => setFilterPays(e.target.value)}>
              <option value="">Tous les pays</option>
              {paysList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Civilité</label>
            <select value={filterCivilite} onChange={(e) => setFilterCivilite(e.target.value)}>
              <option value="">Toutes les civilités</option>
              {civilitesList.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setSearchTerm(''); setFilterPays(''); setFilterCivilite(''); }} className="btn btn-secondary" style={{ width: '100%' }}>
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filteredEtudiants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow">
          <span className="text-6xl mb-4 block">🎓</span>
          <p className="text-lg font-medium text-gray-400">Aucun étudiant trouvé</p>
          <p className="text-sm text-gray-400 mt-1">Modifiez vos critères de recherche</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredEtudiants.map(etudiant => (
            <CarteEtudiant 
              key={etudiant.id}
              etudiant={etudiant}
              civilite={civilitesMap[etudiant.civilites_id]}
              pays={paysMap[etudiant.pays_id]}
              onPhotoClick={(e) => { setSelectedEtudiant(e); setShowPhotoModal(true); }}
              onPhotoUpdated={handlePhotoUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Photo</th>
                <th className="text-left px-4 py-3">Nom & Prénoms</th>
                <th className="text-left px-4 py-3">Civilité</th>
                <th className="text-left px-4 py-3">Date naissance</th>
                <th className="text-left px-4 py-3">Pays</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Téléphone</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEtudiants.map((etudiant, index) => (
                <tr key={etudiant.id} className="border-b hover:bg-blue-50 transition">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden cursor-pointer" onClick={() => { setSelectedEtudiant(etudiant); setShowPhotoModal(true); }}>
                      {etudiant.photo_url ? (
                        <img src={etudiant.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{etudiant.prenoms} {etudiant.nom}</td>
                  <td className="px-4 py-3">{civilitesMap[etudiant.civilites_id]?.libelle || '—'}</td>
                  <td className="px-4 py-3">{etudiant.dateNaissance ? new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">{paysMap[etudiant.pays_id]?.nom || '—'}</td>
                  <td className="px-4 py-3">{etudiant.email || '—'}</td>
                  <td className="px-4 py-3">{etudiant.telephone || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedEtudiant(etudiant); setShowPhotoModal(true); }} className="text-blue-600 hover:text-blue-800">
                      📷 Photo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPhotoModal && selectedEtudiant && (
        <ModalPhotoEtudiant 
          etudiant={selectedEtudiant}
          onClose={() => setShowPhotoModal(false)}
          onPhotoUploaded={handlePhotoUpdated}
        />
      )}
    </div>
  );
}