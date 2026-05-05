// src/components/Cycles.jsx
import React, { useState } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

export default function Cycles() {
  const { data, loading, error, create, update, remove } = useApi("cycles");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ libelle: "", duree_annees: 2 });
  const [editId, setEditId]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, isError = false) => { setToast({ msg, isError }); setTimeout(() => setToast(null), 3000); };
  const openCreate = () => { setForm({ libelle: "", duree_annees: 2 }); setEditId(null); setModal(true); };
  const openEdit   = (item) => { setForm({ libelle: item.libelle, duree_annees: item.duree_annees }); setEditId(item.id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form); else await create(form);
      setModal(false); showToast(editId ? "Cycle modifié ✓" : "Cycle créé ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try { await remove(confirm.id); setConfirm(null); showToast("Cycle supprimé ✓"); }
    catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  const filtered = data.filter(c => c.libelle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1><span className="icon">🔄</span> Cycles</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un cycle</button>
      </div>
      <div className="table-card">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{filtered.length} cycle(s)</span>
        </div>
        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>}
        {error   && <div className="error-state">Erreur : {error}</div>}
        {!loading && !error && (
          <table>
            <thead><tr><th>#</th><th>Libellé</th><th>Durée (années)</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="4" className="empty-state">Aucun cycle trouvé</td></tr>}
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>{i+1}</td>
                  <td><strong>{c.libelle}</strong></td>
                  <td><span className="badge badge-inscrit">{c.duree_annees} an{c.duree_annees > 1 ? "s" : ""}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(c)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(c)}>🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "Modifier le cycle" : "Nouveau cycle"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Libellé *</label>
                <input required value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="ex: Licence" /></div>
              <div className="form-group"><label>Durée en années *</label>
                <input type="number" min="1" max="10" required value={form.duree_annees} onChange={e => setForm({...form, duree_annees: parseInt(e.target.value)})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editId ? "Enregistrer" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!confirm} itemName={confirm?.libelle} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      {toast && <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}