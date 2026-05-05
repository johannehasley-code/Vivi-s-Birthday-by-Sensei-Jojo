// src/components/Specialites.jsx
import React, { useState, useMemo } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ══════════════════════════════════════════════════════════════
   Composant Spécialités — CRUD complet
══════════════════════════════════════════════════════════════ */
export default function Specialites() {
  const { data: specialites, loading, error, create, update, remove } = useApi("specialites");
  const { data: filieres } = useApi("filieres");

  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ libelle: "", filieres_id: "", description: "" });
  const [editId, setEditId]     = useState(null);
  const [confirm, setConfirm]   = useState(null);
  const [toast, setToast]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filtreFiliere, setFiltreFiliere] = useState("");

  /* ── helpers ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const ouvrirCreation = () => {
    setForm({ libelle: "", filieres_id: "", description: "" });
    setEditId(null);
    setModal(true);
  };

  const ouvrirModification = (s) => {
    /* Retrouver l'id de la filière à partir du libellé jointuré */
    const filiere = filieres.find(f => f.libelle === s.filiere);
    setForm({
      libelle:     s.libelle,
      filieres_id: String(filiere?.id ?? ""),
      description: s.description ?? "",
    });
    setEditId(s.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Spécialité modifiée ✓" : "Spécialité créée ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      setConfirm(null);
      showToast("Spécialité supprimée ✓");
    } catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  /* Filtrage */
  const specialitesFiltrees = useMemo(() =>
    specialites.filter(s => {
      const txt = `${s.libelle} ${s.filiere ?? ""} ${s.description ?? ""}`.toLowerCase();
      return txt.includes(search.toLowerCase()) &&
             (filtreFiliere ? s.filiere === filtreFiliere : true);
    }),
  [specialites, search, filtreFiliere]);

  /* Filières disponibles pour filtre */
  const filieresDisponibles = useMemo(() =>
    [...new Set(specialites.map(s => s.filiere).filter(Boolean))].sort(),
  [specialites]);

  /* Stats par filière */
  const statsFilieres = useMemo(() => {
    const stats = {};
    specialites.forEach(s => {
      if (s.filiere) stats[s.filiere] = (stats[s.filiere] ?? 0) + 1;
    });
    return stats;
  }, [specialites]);

  /* ═══════════════════ RENDU ═══════════════════ */
  return (
    <div className="page">

      {/* En-tête */}
      <div className="page-header">
        <h1><span className="icon">🎓</span> Spécialités</h1>
        <button className="btn btn-primary" onClick={ouvrirCreation}>
          + Ajouter une spécialité
        </button>
      </div>

      {/* Stats filières */}
      {Object.keys(statsFilieres).length > 0 && (
        <div className="stats-row" style={{ marginBottom: 22 }}>
          <div className="stat-card">
            <div className="stat-num">{specialites.length}</div>
            <div className="stat-label">Total spécialités</div>
          </div>
          {Object.entries(statsFilieres).map(([filiere, count]) => (
            <div className="stat-card" key={filiere}
              style={{ cursor: "pointer", border: filtreFiliere === filiere ? "2px solid var(--primary)" : "2px solid transparent" }}
              onClick={() => setFiltreFiliere(prev => prev === filiere ? "" : filiere)}
            >
              <div className="stat-num" style={{ fontSize: "1.6rem" }}>{count}</div>
              <div className="stat-label">{filiere}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tableau */}
      <div className="table-card">
        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
          <input
            className="search-input"
            placeholder="🔍  Rechercher par nom, filière, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="search-input"
            style={{ flex: "none", width: 200 }}
            value={filtreFiliere}
            onChange={e => setFiltreFiliere(e.target.value)}
          >
            <option value="">📚 Toutes les filières</option>
            {filieresDisponibles.map(f => (
              <option key={f}>{f}</option>
            ))}
          </select>
          {(search || filtreFiliere) && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(""); setFiltreFiliere(""); }}>
              ✕ Réinitialiser
            </button>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: ".84rem", alignSelf: "center" }}>
            {specialitesFiltrees.length} spécialité(s)
          </span>
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Spécialité</th>
                <th>Filière</th>
                <th>Description</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialitesFiltrees.length === 0 && (
                <tr><td colSpan="5">
                  <div className="empty-state">Aucune spécialité trouvée.</div>
                </td></tr>
              )}
              {specialitesFiltrees.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                        color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: ".78rem",
                        flexShrink: 0,
                      }}>
                        {s.libelle.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{s.libelle}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.filiere
                      ? <span className="badge badge-admis">{s.filiere}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>
                    }
                  </td>
                  <td style={{
                    color: "var(--text-muted)", fontSize: ".86rem",
                    maxWidth: 280, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {s.description ?? "—"}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => ouvrirModification(s)}>
                        ✏️ Modifier
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(s)}>
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal formulaire ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "✏️ Modifier la spécialité" : "➕ Nouvelle spécialité"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Libellé de la spécialité *</label>
                <input
                  required
                  value={form.libelle}
                  placeholder="ex : Génie Informatique, Hydraulique…"
                  onChange={e => setForm({ ...form, libelle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Filière de rattachement *</label>
                <select
                  required
                  value={form.filieres_id}
                  onChange={e => setForm({ ...form, filieres_id: e.target.value })}
                >
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  placeholder="Description détaillée de la spécialité…"
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer" : "✅ Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.libelle}
        message="Êtes-vous sûr de vouloir supprimer la spécialité"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}