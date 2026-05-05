// src/components/Inscriptions.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ── constantes décisions ── */
const DECISION_BADGE = {
  "Admis":               { cls: "badge-admis",    icon: "✅" },
  "Admis sous condition":{ cls: "badge-ajourne",  icon: "⚠️" },
  "Redoublant":          { cls: "badge-redouble", icon: "🔁" },
  "Refusé":              { cls: "badge-exclu",    icon: "❌" },
  "Inscrit":             { cls: "badge-inscrit",  icon: "📋" },
  "Exclu":               { cls: "badge-exclu",    icon: "🚫" },
  "Diplômé":             { cls: "badge-diplome",  icon: "🎓" },
};

const EMPTY_FORM = {
  etudiants_id: "", parcours_id: "",
  annee_academique_id: "", decisions_id: "",
  dateInscription: "",
};

/* ══════════════════════════════════════════════════════════════
   Composant Inscriptions — CRUD complet
══════════════════════════════════════════════════════════════ */
export default function Inscriptions() {
  const { data: inscriptions, loading, error, create, update, remove } = useApi("inscriptions");
  const { data: etudiants } = useApi("etudiants");
  const { data: parcours }  = useApi("parcours");
  const { data: annees }    = useApi("anneeacademiques");
  const { data: decisions } = useApi("decisions");

  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [confirm, setConfirm]     = useState(null);
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState("");
  const [filtreAnnee, setFiltreAnnee]       = useState("");
  const [filtreDecision, setFiltreDecision] = useState("");
  const [filtreParcours, setFiltreParcours] = useState("");
  const [detailIns, setDetailIns]           = useState(null);

  /* Pré-sélectionner l'année active */
  useEffect(() => {
    if (!filtreAnnee && annees.length > 0) {
      const active = annees.find(a => a.est_active);
      if (active) setFiltreAnnee(active.libelle);
    }
  }, [annees, filtreAnnee]);

  /* ── helpers ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const ouvrirCreation = () => {
    const anneeActive = annees.find(a => a.est_active);
    setForm({
      ...EMPTY_FORM,
      annee_academique_id: String(anneeActive?.id ?? ""),
      dateInscription: new Date().toISOString().slice(0, 10),
    });
    setEditId(null);
    setModal(true);
  };

  const ouvrirModification = (ins) => {
    setForm({
      etudiants_id:       String(ins.etudiant_id ?? etudiants.find(e => `${e.prenoms} ${e.nom}` === ins.etudiant)?.id ?? ""),
      parcours_id:        String(parcours.find(p => p.libelle === ins.parcours)?.id ?? ""),
      annee_academique_id:String(annees.find(a => a.libelle === ins.annee_academique)?.id ?? ""),
      decisions_id:       String(decisions.find(d => d.libelle === ins.decision)?.id ?? ""),
      dateInscription:    ins.dateInscription?.slice(0, 10) ?? "",
    });
    setEditId(ins.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Inscription modifiée ✓" : "Inscription créée ✓");
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      if (detailIns?.id === confirm.id) setDetailIns(null);
      setConfirm(null);
      showToast("Inscription supprimée ✓");
    } catch (err) { setConfirm(null); showToast(err.message, true); }
  };

  /* Filtrage */
  const inscriptionsFiltrees = useMemo(() =>
    inscriptions.filter(i => {
      const txt = `${i.etudiant ?? ""} ${i.parcours ?? ""} ${i.etudiant_email ?? ""}`.toLowerCase();
      return txt.includes(search.toLowerCase()) &&
             (filtreAnnee    ? i.annee_academique === filtreAnnee    : true) &&
             (filtreDecision ? i.decision         === filtreDecision : true) &&
             (filtreParcours ? i.parcours         === filtreParcours : true);
    }),
  [inscriptions, search, filtreAnnee, filtreDecision, filtreParcours]);

  /* Options pour filtres */
  const anneesDisponibles   = useMemo(() => [...new Set(inscriptions.map(i => i.annee_academique).filter(Boolean))].sort(), [inscriptions]);
  const decisionsDisponibles = useMemo(() => [...new Set(inscriptions.map(i => i.decision).filter(Boolean))].sort(), [inscriptions]);
  const parcoursDisponibles  = useMemo(() => [...new Set(inscriptions.map(i => i.parcours).filter(Boolean))].sort(),  [inscriptions]);

  /* Stats */
  const stats = useMemo(() => {
    const source = filtreAnnee ? inscriptions.filter(i => i.annee_academique === filtreAnnee) : inscriptions;
    const total  = source.length;
    const admis  = source.filter(i => ["Admis","Admis sous condition","Diplômé"].includes(i.decision)).length;
    return { total, admis, taux: total ? Math.round((admis / total) * 100) : 0 };
  }, [inscriptions, filtreAnnee]);

  /* ═══════════════════ RENDU ═══════════════════ */
  return (
    <div className="page">

      {/* En-tête */}
      <div className="page-header">
        <h1><span className="icon">📝</span> Inscriptions</h1>
        <button className="btn btn-primary" onClick={ouvrirCreation}>
          + Inscrire un étudiant
        </button>
      </div>

      {/* Sélecteur rapide d'année */}
      <div style={{
        background: "var(--bg-card)", borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-sm)", padding: "14px 20px",
        marginBottom: 18, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: ".88rem" }}>📅 Filtrer par année :</span>
        <button
          className={`btn btn-sm ${!filtreAnnee ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFiltreAnnee("")}
        >Toutes</button>
        {annees.map(a => (
          <button
            key={a.id}
            className={`btn btn-sm ${filtreAnnee === a.libelle ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFiltreAnnee(a.libelle)}
          >
            {a.libelle}
            {a.est_active && <span style={{ marginLeft: 4, fontSize: ".7rem", opacity: .8 }}>●</span>}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">Total inscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "var(--success)" }}>{stats.admis}</div>
          <div className="stat-label">Admis / Diplômés</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: stats.taux >= 50 ? "var(--success)" : "var(--danger)" }}>
            {stats.taux}%
          </div>
          <div className="stat-label">Taux de réussite</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{inscriptionsFiltrees.length}</div>
          <div className="stat-label">Résultats affichés</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="table-card">
        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
          <input
            className="search-input"
            placeholder="🔍  Nom étudiant, email, parcours…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select className="search-input" style={{ flex: "none", width: 180 }}
            value={filtreDecision} onChange={e => setFiltreDecision(e.target.value)}>
            <option value="">⚖️ Toutes décisions</option>
            {decisionsDisponibles.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="search-input" style={{ flex: "none", width: 200 }}
            value={filtreParcours} onChange={e => setFiltreParcours(e.target.value)}>
            <option value="">🗺️ Tous parcours</option>
            {parcoursDisponibles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {(search || filtreDecision || filtreParcours) && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(""); setFiltreDecision(""); setFiltreParcours(""); }}>
              ✕ Réinitialiser
            </button>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: ".84rem", alignSelf: "center" }}>
            {inscriptionsFiltrees.length} inscription(s)
          </span>
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Étudiant</th>
                <th>Parcours</th>
                <th>Année</th>
                <th>Décision</th>
                <th>Date inscription</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inscriptionsFiltrees.length === 0 && (
                <tr><td colSpan="7">
                  <div className="empty-state">Aucune inscription trouvée.</div>
                </td></tr>
              )}
              {inscriptionsFiltrees.map((ins, i) => {
                const badge = DECISION_BADGE[ins.decision] ?? { cls: "badge-default", icon: "•" };
                const isSelected = detailIns?.id === ins.id;
                return (
                  <tr
                    key={ins.id}
                    style={{ cursor: "pointer", background: isSelected ? "#eef2ff" : "" }}
                    onClick={() => setDetailIns(prev => prev?.id === ins.id ? null : ins)}
                  >
                    <td style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>{i + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "var(--primary)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".72rem", fontWeight: 700, flexShrink: 0,
                        }}>
                          {(ins.etudiant ?? "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <strong>{ins.etudiant ?? "—"}</strong>
                          {ins.etudiant_email && (
                            <div style={{ fontSize: ".73rem", color: "var(--text-muted)" }}>
                              {ins.etudiant_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: ".84rem", color: "var(--text-muted)" }}>
                      {ins.parcours ?? "—"}
                    </td>
                    <td>
                      <span className="badge badge-default">{ins.annee_academique ?? "—"}</span>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.icon} {ins.decision ?? "—"}</span>
                    </td>
                    <td style={{ fontSize: ".83rem", color: "var(--text-muted)" }}>
                      {ins.dateInscription?.slice(0, 10) ?? "—"}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="actions-cell">
                        <button className="btn btn-edit btn-sm" onClick={() => ouvrirModification(ins)}>✏️ Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(ins)}>🗑️ Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Panneau détail inscription ── */}
      {detailIns && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 310,
          background: "#fff", zIndex: 900,
          boxShadow: "-6px 0 28px rgba(0,0,0,.14)",
          display: "flex", flexDirection: "column",
          animation: "slideInRight .25s ease",
        }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), #2557a7)",
            color: "#fff", padding: "22px 18px 26px",
          }}>
            <button onClick={() => setDetailIns(null)} style={{
              float: "right", background: "rgba(255,255,255,.25)", border: "none",
              color: "#fff", borderRadius: 6, padding: "4px 10px",
              cursor: "pointer", fontSize: ".82rem",
            }}>✕ Fermer</button>
            <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>📝</div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{detailIns.etudiant ?? "—"}</div>
            <div style={{ marginTop: 6 }}>
              <span className={`badge ${(DECISION_BADGE[detailIns.decision] ?? {cls:"badge-default"}).cls}`}>
                {(DECISION_BADGE[detailIns.decision] ?? {icon:"•"}).icon} {detailIns.decision ?? "—"}
              </span>
            </div>
          </div>
          <div style={{ padding: "16px 18px", overflowY: "auto", flex: 1 }}>
            {[
              ["🗺️", "Parcours",          detailIns.parcours],
              ["📅", "Année académique",   detailIns.annee_academique],
              ["📆", "Date inscription",   detailIns.dateInscription?.slice(0, 10)],
              ["📧", "Email étudiant",     detailIns.etudiant_email],
            ].map(([icon, label, val]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                borderBottom: "1px solid var(--border)", padding: "11px 0",
                fontSize: ".87rem", gap: 8,
              }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{icon} {label}</span>
                <span style={{ fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>
                  {val ?? <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Non renseigné</em>}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <button className="btn btn-edit" style={{ flex: 1 }}
              onClick={() => { ouvrirModification(detailIns); setDetailIns(null); }}>✏️ Modifier</button>
            <button className="btn btn-danger" style={{ flex: 1 }}
              onClick={() => { setConfirm(detailIns); setDetailIns(null); }}>🗑️ Supprimer</button>
          </div>
        </div>
      )}

      {/* ── Modal formulaire ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "✏️ Modifier l'inscription" : "➕ Nouvelle inscription"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Étudiant *</label>
                <select required value={form.etudiants_id}
                  onChange={e => setForm({ ...form, etudiants_id: e.target.value })}>
                  <option value="">-- Choisir un étudiant --</option>
                  {[...etudiants].sort((a, b) => a.nom.localeCompare(b.nom)).map(e => (
                    <option key={e.id} value={e.id}>{e.prenoms} {e.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Parcours *</label>
                <select required value={form.parcours_id}
                  onChange={e => setForm({ ...form, parcours_id: e.target.value })}>
                  <option value="">-- Choisir un parcours --</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Année académique *</label>
                  <select required value={form.annee_academique_id}
                    onChange={e => setForm({ ...form, annee_academique_id: e.target.value })}>
                    <option value="">-- Choisir --</option>
                    {annees.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.libelle}{a.est_active ? " ✓" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Décision *</label>
                  <select required value={form.decisions_id}
                    onChange={e => setForm({ ...form, decisions_id: e.target.value })}>
                    <option value="">-- Choisir --</option>
                    {decisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {(DECISION_BADGE[d.libelle] ?? { icon: "•" }).icon} {d.libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date d'inscription *</label>
                <input type="date" required value={form.dateInscription}
                  onChange={e => setForm({ ...form, dateInscription: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer" : "✅ Inscrire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.etudiant ?? ""}
        message="Êtes-vous sûr de vouloir supprimer l'inscription de"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {toast && <div className={`toast ${toast.isError ? "toast-error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}