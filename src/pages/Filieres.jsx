// src/components/Filieres.jsx
import React, { useState } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

export default function Filieres() {
  const { data, loading, error, create, update, remove } = useApi("filieres");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ code: "", libelle: "", description: "" });
  const [editId, setEditId]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, isError = false) => { setToast({ msg, isError }); setTimeout(() => setToast(null), 3000); };
  const openCreate = () => { setForm({ code: "", libelle: "", description: "" }); setEditId(null); setModal(true); };
  const openEdit   = (item) => { setForm({ code: item.code || "", libelle: item.libelle, description: item.description || "" }); setEditId(item.id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form); else await create(form);
      setModal(false); showToast(editId ? "Filière modifiée ✓" : "Filière créée ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try { await remove(confirm.id); setConfirm(null); showToast("Filière supprimée ✓"); }
    catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  const filtered = data.filter(f =>
    f.libelle.toLowerCase().includes(search.toLowerCase()) ||
    (f.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1><span className="icon">📚</span> Filières</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter une filière</button>
      </div>
      <div className="table-card">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Rechercher par nom ou code..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{filtered.length} filière(s)</span>
        </div>
        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>}
        {error   && <div className="error-state">Erreur : {error}</div>}
        {!loading && !error && (
          <table>
            <thead><tr><th>#</th><th>Code</th><th>Libellé</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="5" className="empty-state">Aucune filière trouvée</td></tr>}
              {filtered.map((f, i) => (
                <tr key={f.id}>
                  <td>{i+1}</td>
                  <td>{f.code ? <span className="badge badge-default">{f.code}</span> : "—"}</td>
                  <td><strong>{f.libelle}</strong></td>
                  <td style={{ color: "var(--text-muted)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.description || "—"}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(f)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(f)}>🗑️ Supprimer</button>
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
            <h2>{editId ? "Modifier la filière" : "Nouvelle filière"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Code</label>
                  <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="ex: INFO" /></div>
                <div className="form-group"><label>Libellé *</label>
                  <input required value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="ex: Informatique" /></div>
              </div>
              <div className="form-group"><label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description de la filière" /></div>
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