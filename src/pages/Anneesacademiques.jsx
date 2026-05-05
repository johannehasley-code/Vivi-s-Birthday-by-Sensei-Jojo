// src/components/AnneeAcademiques.jsx
import React, { useState } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

const EMPTY = { libelle: "", date_debut: "", date_fin: "", est_active: false };

export default function AnneeAcademiques() {
  const { data, loading, error, create, update, remove } = useApi("anneeacademiques");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (item) => {
    setForm({
      libelle: item.libelle,
      date_debut: item.date_debut?.slice(0, 10) || "",
      date_fin:   item.date_fin?.slice(0, 10) || "",
      est_active: !!item.est_active,
    });
    setEditId(item.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Année académique modifiée ✓" : "Année académique créée ✓");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      setConfirm(null);
      showToast("Année académique supprimée ✓");
    } catch (err) {
      setConfirm(null);
      showToast(err.message, true);
    }
  };

  const filtered = data.filter(a =>
    a.libelle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1><span className="icon">📅</span> Années Académiques</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvelle année</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{filtered.length} résultat(s)</span>
        </div>

        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement...</p></div>}
        {error   && <div className="error-state">Erreur : {error}</div>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Libellé</th><th>Date début</th><th>Date fin</th><th>Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="empty-state">Aucune année académique trouvée</td></tr>
              )}
              {filtered.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td><strong>{a.libelle}</strong></td>
                  <td>{a.date_debut?.slice(0, 10)}</td>
                  <td>{a.date_fin?.slice(0, 10)}</td>
                  <td>
                    <span className={`badge ${a.est_active ? "badge-admis" : "badge-default"}`}>
                      {a.est_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(a)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(a)}>🗑️ Supprimer</button>
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
            <h2>{editId ? "Modifier l'année académique" : "Nouvelle année académique"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Libellé *</label>
                <input required value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="ex: 2024-2025" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date début *</label>
                  <input type="date" required value={form.date_debut} onChange={e => setForm({...form, date_debut: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date fin *</label>
                  <input type="date" required value={form.date_fin} onChange={e => setForm({...form, date_fin: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <div className="toggle-wrap">
                  <label className="toggle">
                    <input type="checkbox" checked={form.est_active} onChange={e => setForm({...form, est_active: e.target.checked})} />
                    <span className="slider"/>
                  </label>
                  <span>Année active</span>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editId ? "Enregistrer" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.libelle}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}