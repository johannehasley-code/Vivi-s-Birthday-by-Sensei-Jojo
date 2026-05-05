// src/components/Parcours.jsx
import React, { useState, useMemo } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ══════════════════════════════════════════════════════════════
   Composant Parcours — CRUD complet
══════════════════════════════════════════════════════════════ */
export default function Parcours() {
  const { data: parcours, loading, error, create, update, remove } = useApi("parcours");
  const { data: specialites } = useApi("specialites");
  const { data: niveaux }     = useApi("niveaux");
  const { data: cycles }      = useApi("cycles");

  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState({ libelle: "", specialites_id: "", niveaux_id: "", cycles_id: "" });
  const [editId, setEditId]           = useState(null);
  const [confirm, setConfirm]         = useState(null);
  const [toast, setToast]             = useState(null);
  const [search, setSearch]           = useState("");
  const [filtreSpecialite, setFiltreSpecialite] = useState("");
  const [filtreNiveau, setFiltreNiveau]         = useState("");
  const [detailParcours, setDetailParcours]     = useState(null);

  /* ── helpers ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const ouvrirCreation = () => {
    setForm({ libelle: "", specialites_id: "", niveaux_id: "", cycles_id: "" });
    setEditId(null);
    setModal(true);
  };

  const ouvrirModification = (p) => {
    const spec = specialites.find(s => s.libelle === p.specialite);
    const niv  = niveaux.find(n => n.libelle === p.niveau);
    const cyc  = cycles.find(c => c.libelle === p.cycle);
    setForm({
      libelle:        p.libelle,
      specialites_id: String(spec?.id ?? ""),
      niveaux_id:     String(niv?.id ?? ""),
      cycles_id:      String(cyc?.id ?? ""),
    });
    setEditId(p.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Parcours modifié ✓" : "Parcours créé ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      if (detailParcours?.id === confirm.id) setDetailParcours(null);
      setConfirm(null);
      showToast("Parcours supprimé ✓");
    } catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  /* Filtrage */
  const parcoursFiltres = useMemo(() =>
    parcours.filter(p => {
      const txt = `${p.libelle} ${p.specialite ?? ""} ${p.niveau ?? ""} ${p.cycle ?? ""}`.toLowerCase();
      return txt.includes(search.toLowerCase()) &&
             (filtreSpecialite ? p.specialite === filtreSpecialite : true) &&
             (filtreNiveau     ? p.niveau     === filtreNiveau     : true);
    }),
  [parcours, search, filtreSpecialite, filtreNiveau]);

  const specialitesDisponibles = useMemo(() =>
    [...new Set(parcours.map(p => p.specialite).filter(Boolean))].sort(),
  [parcours]);

  const niveauxDisponibles = useMemo(() =>
    [...new Set(parcours.map(p => p.niveau).filter(Boolean))].sort(),
  [parcours]);

  /* ═══════════════════ RENDU ═══════════════════ */
  return (
    <div className="page">

      {/* En-tête */}
      <div className="page-header">
        <h1><span className="icon">🗺️</span> Parcours</h1>
        <button className="btn btn-primary" onClick={ouvrirCreation}>
          + Créer un parcours
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-num">{parcours.length}</div>
          <div className="stat-label">Total parcours</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{specialitesDisponibles.length}</div>
          <div className="stat-label">Spécialités couvertes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{niveauxDisponibles.length}</div>
          <div className="stat-label">Niveaux représentés</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="table-card">
        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
          <input
            className="search-input"
            placeholder="🔍  Rechercher un parcours…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="search-input"
            style={{ flex: "none", width: 190 }}
            value={filtreSpecialite}
            onChange={e => setFiltreSpecialite(e.target.value)}
          >
            <option value="">🎓 Toutes spécialités</option>
            {specialitesDisponibles.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            className="search-input"
            style={{ flex: "none", width: 160 }}
            value={filtreNiveau}
            onChange={e => setFiltreNiveau(e.target.value)}
          >
            <option value="">📊 Tous niveaux</option>
            {niveauxDisponibles.map(n => <option key={n}>{n}</option>)}
          </select>
          {(search || filtreSpecialite || filtreNiveau) && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(""); setFiltreSpecialite(""); setFiltreNiveau(""); }}>
              ✕ Réinitialiser
            </button>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: ".84rem", alignSelf: "center" }}>
            {parcoursFiltres.length} parcours
          </span>
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Libellé du parcours</th>
                <th>Spécialité</th>
                <th>Niveau</th>
                <th>Cycle</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcoursFiltres.length === 0 && (
                <tr><td colSpan="6">
                  <div className="empty-state">Aucun parcours trouvé.</div>
                </td></tr>
              )}
              {parcoursFiltres.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    cursor: "pointer",
                    background: detailParcours?.id === p.id ? "#eef2ff" : "",
                  }}
                  onClick={() => setDetailParcours(prev => prev?.id === p.id ? null : p)}
                >
                  <td style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>{i + 1}</td>
                  <td>
                    <strong>{p.libelle}</strong>
                  </td>
                  <td>
                    {p.specialite
                      ? <span className="badge badge-admis">{p.specialite}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    {p.niveau
                      ? <span className="badge badge-inscrit">{p.niveau}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    {p.cycle
                      ? <span className="badge badge-diplome">{p.cycle}</span>
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="actions-cell">
                      <button className="btn btn-edit btn-sm" onClick={() => ouvrirModification(p)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(p)}>🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Panneau détail latéral ── */}
      {detailParcours && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 300,
          background: "#fff", zIndex: 900,
          boxShadow: "-6px 0 28px rgba(0,0,0,.14)",
          display: "flex", flexDirection: "column",
          animation: "slideInRight .25s ease",
        }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), #2557a7)",
            color: "#fff", padding: "22px 18px 28px",
          }}>
            <button onClick={() => setDetailParcours(null)} style={{
              float: "right", background: "rgba(255,255,255,.25)", border: "none",
              color: "#fff", borderRadius: 6, padding: "4px 10px",
              cursor: "pointer", fontSize: ".82rem",
            }}>✕ Fermer</button>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🗺️</div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
              {detailParcours.libelle}
            </div>
          </div>
          <div style={{ padding: "16px 18px", overflowY: "auto", flex: 1 }}>
            {[
              ["🎓", "Spécialité", detailParcours.specialite],
              ["📊", "Niveau",     detailParcours.niveau],
              ["🔄", "Cycle",      detailParcours.cycle],
            ].map(([icon, label, val]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid var(--border)", padding: "12px 0",
                fontSize: ".88rem",
              }}>
                <span style={{ color: "var(--text-muted)" }}>{icon} {label}</span>
                <span style={{ fontWeight: 500 }}>
                  {val ?? <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Non défini</em>}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <button className="btn btn-edit" style={{ flex: 1 }}
              onClick={() => { ouvrirModification(detailParcours); setDetailParcours(null); }}>
              ✏️ Modifier
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }}
              onClick={() => { setConfirm(detailParcours); setDetailParcours(null); }}>
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}

      {/* ── Modal formulaire ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "✏️ Modifier le parcours" : "➕ Nouveau parcours"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Libellé du parcours *</label>
                <input
                  required
                  value={form.libelle}
                  placeholder="ex : Licence Informatique — L1"
                  onChange={e => setForm({ ...form, libelle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Spécialité *</label>
                <select required value={form.specialites_id}
                  onChange={e => setForm({ ...form, specialites_id: e.target.value })}>
                  <option value="">-- Choisir une spécialité --</option>
                  {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Niveau *</label>
                  <select required value={form.niveaux_id}
                    onChange={e => setForm({ ...form, niveaux_id: e.target.value })}>
                    <option value="">-- Choisir --</option>
                    {[...niveaux].sort((a, b) => a.ordre - b.ordre).map(n => (
                      <option key={n.id} value={n.id}>{n.libelle}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cycle</label>
                  <select value={form.cycles_id}
                    onChange={e => setForm({ ...form, cycles_id: e.target.value })}>
                    <option value="">-- Choisir --</option>
                    {cycles.map(c => <option key={c.id} value={c.id}>{c.libelle} ({c.duree_annees} ans)</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer" : "✅ Créer le parcours"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.libelle}
        message="Êtes-vous sûr de vouloir supprimer le parcours"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}