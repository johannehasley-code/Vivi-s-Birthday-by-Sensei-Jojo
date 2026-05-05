// src/components/Niveaux.jsx
import React, { useState, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import ConfirmModal from "./shared/ConfirmModal";
import "../styles/global.css";

/* ══════════════════════════════════════════════════════════════
   Composant Niveaux — CRUD complet
══════════════════════════════════════════════════════════════ */
export default function Niveaux() {
  const { data: niveaux, loading, error, create, update, remove } = useApi("niveaux");

  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ libelle: "", ordre: "" });
  const [editId, setEditId]       = useState(null);
  const [confirm, setConfirm]     = useState(null);
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState("");

  /* ── helpers ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const ouvrirCreation = () => {
    const prochainOrdre = niveaux.length > 0
      ? Math.max(...niveaux.map(n => n.ordre)) + 1
      : 1;
    setForm({ libelle: "", ordre: prochainOrdre });
    setEditId(null);
    setModal(true);
  };

  const ouvrirModification = (n) => {
    setForm({ libelle: n.libelle, ordre: n.ordre });
    setEditId(n.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Niveau modifié avec succès ✓" : "Niveau créé avec succès ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      setConfirm(null);
      showToast("Niveau supprimé avec succès ✓");
    } catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  /* Tri par ordre + filtrage */
  const niveauxFiltres = useMemo(() =>
    [...niveaux]
      .filter(n => n.libelle.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.ordre - b.ordre),
  [niveaux, search]);

  /* Couleur de badge selon ordre */
  const badgeCouleur = (ordre) => {
    const palettes = ["badge-inscrit","badge-admis","badge-diplome","badge-ajourne","badge-redouble"];
    return palettes[(ordre - 1) % palettes.length];
  };

  /* ═══════════════════ RENDU ═══════════════════ */
  return (
    <div className="page">

      {/* En-tête */}
      <div className="page-header">
        <h1><span className="icon">📊</span> Niveaux d'études</h1>
        <button className="btn btn-primary" onClick={ouvrirCreation}>
          + Ajouter un niveau
        </button>
      </div>

      {/* Statistique rapide */}
      <div className="stats-row" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-num">{niveaux.length}</div>
          <div className="stat-label">Niveaux définis</div>
        </div>
        {niveauxFiltres.slice(0, 4).map(n => (
          <div className="stat-card" key={n.id}>
            <div className="stat-num" style={{ fontSize: "1.5rem" }}>N{n.ordre}</div>
            <div className="stat-label" style={{ fontSize: ".78rem" }}>{n.libelle}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="🔍  Rechercher un niveau…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ color: "var(--text-muted)", fontSize: ".84rem" }}>
            {niveauxFiltres.length} niveau(x)
          </span>
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Ordre</th>
                <th>Libellé du niveau</th>
                <th style={{ width: 120 }}>Badge</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {niveauxFiltres.length === 0 && (
                <tr><td colSpan="4">
                  <div className="empty-state">Aucun niveau trouvé.</div>
                </td></tr>
              )}
              {niveauxFiltres.map(n => (
                <tr key={n.id}>
                  <td>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "var(--primary)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "1rem",
                    }}>
                      {n.ordre}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: "1rem" }}>{n.libelle}</strong>
                    <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: 2 }}>
                      Niveau d'ordre {n.ordre}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${badgeCouleur(n.ordre)}`}>
                      Niveau {n.ordre}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => ouvrirModification(n)}>
                        ✏️ Modifier
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(n)}>
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
            <h2>{editId ? "✏️ Modifier le niveau" : "➕ Nouveau niveau"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Libellé du niveau *</label>
                <input
                  required
                  value={form.libelle}
                  placeholder="ex : Licence 1, Master 2, Doctorat 1…"
                  onChange={e => setForm({ ...form, libelle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ordre d'affichage *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.ordre}
                  placeholder="ex : 1, 2, 3…"
                  onChange={e => setForm({ ...form, ordre: parseInt(e.target.value, 10) })}
                />
                <small style={{ color: "var(--text-muted)", fontSize: ".78rem" }}>
                  L'ordre détermine le classement affiché dans les listes.
                </small>
              </div>

              {/* Aperçu du badge */}
              {form.ordre && (
                <div style={{ background: "#f8fafc", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 8 }}>
                  <span style={{ fontSize: ".82rem", color: "var(--text-muted)", marginRight: 8 }}>Aperçu :</span>
                  <span className={`badge ${badgeCouleur(parseInt(form.ordre, 10))}`}>
                    Niveau {form.ordre}
                  </span>
                  <span style={{ marginLeft: 10, fontWeight: 600, fontSize: ".9rem" }}>{form.libelle}</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer" : "✅ Créer le niveau"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ── */}
      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.libelle}
        message="Êtes-vous sûr de vouloir supprimer le niveau"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && (
        <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>
      )}
    </div>
  );
}