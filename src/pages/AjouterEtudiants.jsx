// src/pages/AjouterEtudiants.jsx
import { useState, useEffect } from 'react';
import '../App.css';

function ModalAjouterEtudiant({ onClose, onAjouter }) {
  const [form, setForm] = useState({
    nom: '',
    prenoms: '',
    pays_id: '',
    civilites_id: '',
    dateNaissance: '',
    email: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pays, setPays] = useState([]);
  const [civilites, setCivilites] = useState([]);

  useEffect(() => {
    fetch('/api/pays')
      .then((res) => res.json())
      .then((data) => setPays(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('/api/civilites')
      .then((res) => res.json())
      .then((data) => setCivilites(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/etudiants', {
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
      const nouvelEtudiant = await res.json();
      onAjouter(nouvelEtudiant);
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
          <h2 className="text-xl font-bold text-gray-800">Ajouter un étudiant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label>Civilité *</label>
            <select name="civilites_id" value={form.civilites_id} onChange={handleChange} required>
              <option value="">-- Sélectionner --</option>
              {civilites.map((c) => (<option key={c.id} value={c.id}>{c.libelle}</option>))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Nom *</label><input name="nom" value={form.nom} onChange={handleChange} required maxLength="45" /></div>
            <div className="form-group"><label>Prénoms *</label><input name="prenoms" value={form.prenoms} onChange={handleChange} required maxLength="45" /></div>
          </div>
          <div className="form-group"><label>Date de naissance</label><input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} /></div>
          <div className="form-group"><label>Pays *</label>
            <select name="pays_id" value={form.pays_id} onChange={handleChange} required>
              <option value="">-- Sélectionner --</option>
              {pays.map((p) => (<option key={p.id} value={p.id}>{p.libelle}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} maxLength="100" /></div>
          <div className="form-group"><label>Téléphone</label><input name="telephone" value={form.telephone} onChange={handleChange} maxLength="20" /></div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>{loading ? 'Ajout...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AjouterEtudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paysMap, setPaysMap] = useState({});
  const [civilitesMap, setCivilitesMap] = useState({});

  useEffect(() => {
    fetch('/api/pays')
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach(p => map[p.id] = p.libelle);
        setPaysMap(map);
      }).catch(console.error);

    fetch('/api/civilites')
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach(c => map[c.id] = c.libelle);
        setCivilitesMap(map);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/etudiants', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    })
      .then((res) => { if (!res.ok) throw new Error('Erreur serveur'); return res.json(); })
      .then((data) => setEtudiants(Array.isArray(data) ? data : []))
      .catch((err) => { setError('Impossible de charger les étudiants'); setEtudiants([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleAjouter = (nouvelEtudiant) => setEtudiants([nouvelEtudiant, ...etudiants]);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '—';

  return (
    <div className="page">
      <div className="page-header">
        <div><h1><span className="icon">👥</span> Gestion des étudiants</h1></div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Ajouter</button>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="table-card">
        {loading ? <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>
        : etudiants.length === 0 ? <div className="empty-state">Aucun étudiant</div>
        : (
          <table>
            <thead>
              <tr><th>#</th><th>Civilité</th><th>Nom</th><th>Prénoms</th><th>Date naissance</th><th>Pays</th><th>Email</th><th>Téléphone</th><th>Inscrit le</th></tr>
            </thead>
            <tbody>
              {etudiants.map((e, i) => (
                <tr key={e.id}>
                  <td>{i+1}</td>
                  <td>{civilitesMap[e.civilites_id] || '—'}</td>
                  <td><strong>{e.nom}</strong></td>
                  <td>{e.prenoms}</td>
                  <td>{formatDate(e.dateNaissance)}</td>
                  <td>{paysMap[e.pays_id] || '—'}</td>
                  <td>{e.email || '—'}</td>
                  <td>{e.telephone || '—'}</td>
                  <td>{formatDate(e.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && <ModalAjouterEtudiant onClose={() => setShowModal(false)} onAjouter={handleAjouter} />}
    </div>
  );
}