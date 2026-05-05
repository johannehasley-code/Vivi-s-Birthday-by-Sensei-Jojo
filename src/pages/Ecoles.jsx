// src/pages/Ecoles.jsx
import React, { useState } from "react";
import { useApi } from '../hooks/Useapi';
import ConfirmModal from './ConfirmModal';
import '../App.css';

const EMPTY = { libelle: "", adresse: "", telephone: "", email: "" };

export default function Ecoles() {
  const { data, loading, error, create, update, remove } = useApi("ecoles");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (item) => {
    setForm({ libelle: item.libelle, adresse: item.adresse || "", telephone: item.telephone || "", email: item.email || "" });
    setEditId(item.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "École modifiée avec succès ✓" : "École créée avec succès ✓");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      setConfirm(null);
      showToast("École supprimée avec succès ✓");
    } catch (err) {
      setConfirm(null);
      showToast(err.message, true);
    }
  };

  const filtered = data.filter(e =>
    e.libelle.toLowerCase().includes(search.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1><span className="icon">🏫</span> Écoles</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter une école</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Rechercher une école..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{filtered.length} école(s)</span>
        </div>

        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>}
        {error   && <div className="error-state">Erreur : {error}</div>}
        {!loading && !error && (
          <table>
            <thead>
              <tr><th>#</th><th>Nom</th><th>Adresse</th><th>Téléphone</th><th>Email</th><th>Filières</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="empty-state">Aucune école trouvée</td></tr>
              )}
              {filtered.map((ecole, i) => (
                <tr key={ecole.id}>
                  <td>{i + 1}</td>
                  <td><strong>{ecole.libelle}</strong></td>
                  <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ecole.adresse || <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>{ecole.telephone || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td>{ecole.email || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td>
                    {ecole.filieres
                      ? ecole.filieres.split(", ").map((f, j) => (
                          <span key={j} className="badge badge-inscrit" style={{ marginRight: 4 }}>{f}</span>
                        ))
                      : <span style={{ color: "var(--text-muted)" }}>Aucune</span>
                    }
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(ecole)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(ecole)}>🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Formulaire */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "Modifier l'école" : "Ajouter une école"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom de l'école *</label>
                <input required value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="ex: École Polytechnique" />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <textarea value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} placeholder="Adresse complète" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="+226 xx xx xx xx" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@ecole.org" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editId ? "Enregistrer" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.libelle}
        message="Êtes-vous sûr de vouloir supprimer l'école"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}