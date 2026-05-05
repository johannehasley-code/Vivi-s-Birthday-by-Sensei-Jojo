// src/components/Decisions.jsx
import React, { useState } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

const BADGE_MAP = {
  "Admis":             "badge-admis",
  "Admis sous condition": "badge-ajourne",
  "Redoublant":        "badge-redouble",
  "Refusé":            "badge-exclu",
  "Inscrit":           "badge-inscrit",
  "Exclu":             "badge-exclu",
  "Diplômé":           "badge-diplome",
};

export default function Decisions() {
  const { data, loading, error, create, update, remove } = useApi("decisions");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ libelle: "", description: "" });
  const [editId, setEditId]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, isError = false) => { setToast({ msg, isError }); setTimeout(() => setToast(null), 3000); };
  const openCreate = () => { setForm({ libelle: "", description: "" }); setEditId(null); setModal(true); };
  const openEdit   = (item) => { setForm({ libelle: item.libelle, description: item.description || "" }); setEditId(item.id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form); else await create(form);
      setModal(false); showToast(editId ? "Décision modifiée ✓" : "Décision créée ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try { await remove(confirm.id); setConfirm(null); showToast("Décision supprimée ✓"); }
    catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  const filtered = data.filter(d => d.libelle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1><span className="icon">⚖️</span> Décisions</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter une décision</button>
      </div>
      <div className="table-card">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{filtered.length} décision(s)</span>
        </div>
        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>}
        {error   && <div className="error-state">Erreur : {error}</div>}
        {!loading && !error && (
          <table>
            <thead><tr><th>#</th><th>Décision</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="4" className="empty-state">Aucune décision trouvée</td></tr>}
              {filtered.map((d, i) => (
                <tr key={d.id}>
                  <td>{i+1}</td>
                  <td><span className={`badge ${BADGE_MAP[d.libelle] || "badge-default"}`}>{d.libelle}</span></td>
                  <td style={{ color: "var(--text-muted)" }}>{d.description || "—"}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(d)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(d)}>🗑️ Supprimer</button>
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
            <h2>{editId ? "Modifier la décision" : "Nouvelle décision"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Libellé *</label>
                <input required value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="ex: Admis, Ajourné, Redoublant..." /></div>
              <div className="form-group"><label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description de la décision" /></div>
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