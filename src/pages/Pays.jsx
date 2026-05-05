// src/pages/Pays.jsx
import { useState, useEffect } from 'react';
import '../App.css';

function ModalAjouterPays({ onClose, onAjouter }) {
  const [form, setForm]= useState({ nom: '', code: '', indicatif: '', devise: '', continent: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de l\'ajout');
      }
      const nouveauPays = await res.json();
      onAjouter(nouveauPays);
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
          <h2 className="text-xl font-bold text-gray-800">Ajouter un pays</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Code ISO</label><input name="code" value={form.code} onChange={handleChange} placeholder="Ex: FR, CI, SN" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Indicatif téléphonique</label><input name="indicatif" value={form.indicatif} onChange={handleChange} placeholder="Ex: +225, +33" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Devise</label><input name="devise" value={form.devise} onChange={handleChange} placeholder="Ex: FCFA, Euro" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
            <select name="continent" value={form.continent} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionner --</option>
              <option value="Afrique">Afrique</option>
              <option value="Europe">Europe</option>
              <option value="Asie">Asie</option>
              <option value="Amérique">Amérique</option>
              <option value="Océanie">Océanie</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition">{loading ? 'Ajout...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalModifierPays({ pays, onClose, onModifier }) {
  const [form, setForm] = useState({ 
    nom: pays.nom, 
    code: pays.code || '', 
    indicatif: pays.indicatif || '', 
    devise: pays.devise || '', 
    continent: pays.continent || '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pays/${pays.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de la modification');
      }
      const paysModifie = await res.json();
      onModifier(paysModifie);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Modifier le pays</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Code ISO</label><input name="code" value={form.code} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Indicatif téléphonique</label><input name="indicatif" value={form.indicatif} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Devise</label><input name="devise" value={form.devise} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
            <select name="continent" value={form.continent} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Sélectionner --</option>
              <option value="Afrique">Afrique</option>
              <option value="Europe">Europe</option>
              <option value="Asie">Asie</option>
              <option value="Amérique">Amérique</option>
              <option value="Océanie">Océanie</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition">{loading ? 'Modification...' : 'Modifier'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pays() {
  const [pays, setPays] = useState([]);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPays, setSelectedPays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPays();
  }, []);

  const fetchPays = async () => {
    try {
      const res = await fetch('/api/pays', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setPays(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Impossible de charger les pays');
    } finally {
      setLoading(false);
    }
  };

  const handleAjouter = (nouveauPays) => {
    setPays([nouveauPays, ...pays]);
  };

  const handleModifier = (paysModifie) => {
    setPays(pays.map(p => p.id === paysModifie.id ? paysModifie : p));
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pays ?')) return;
    try {
      const res = await fetch(`/api/pays/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) throw new Error('Erreur suppression');
      setPays(pays.filter(p => p.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des pays</h1>
          <p className="text-sm text-gray-500 mt-1">{pays.length} pays enregistré(s)</p>
        </div>
        <button onClick={() => setShowAjoutModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <span className="text-lg leading-none">+</span> Ajouter un pays
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">{error}</div>}

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : pays.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun pays enregistré</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Indicatif</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Devise</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Continent</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pays.map((p, index) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{p.code || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.indicatif || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.devise || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.continent || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedPays(p); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3">Modifier</button>
                    <button onClick={() => handleSupprimer(p.id)} className="text-red-600 hover:text-red-800">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAjoutModal && <ModalAjouterPays onClose={() => setShowAjoutModal(false)} onAjouter={handleAjouter} />}
      {showEditModal && selectedPays && <ModalModifierPays pays={selectedPays} onClose={() => setShowEditModal(false)} onModifier={handleModifier} />}
    </div>
  );
}