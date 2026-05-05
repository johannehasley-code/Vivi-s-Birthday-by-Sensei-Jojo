// src/components/ResultatsFinAnnee.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ─────────────────────────────────────────────────────────────────
   Constantes
───────────────────────────────────────────────────────────────── */
const DECISION_BADGE = {
  "Admis":              { cls: "badge-admis",    icon: "✅" },
  "Admis sous condition":{ cls: "badge-ajourne", icon: "⚠️" },
  "Redoublant":         { cls: "badge-redouble", icon: "🔁" },
  "Refusé":             { cls: "badge-exclu",    icon: "❌" },
  "Inscrit":            { cls: "badge-inscrit",  icon: "📋" },
  "Exclu":              { cls: "badge-exclu",    icon: "🚫" },
  "Diplômé":            { cls: "badge-diplome",  icon: "🎓" },
};

const COULEUR_DECISION = {
  "Admis":               "#16a34a",
  "Admis sous condition":"#ca8a04",
  "Redoublant":          "#dc2626",
  "Refusé":              "#9f1239",
  "Inscrit":             "#7c3aed",
  "Exclu":               "#be185d",
  "Diplômé":             "#0891b2",
};

const EMPTY_FORM = {
  etudiants_id: "", parcours_id: "",
  annee_academique_id: "", decisions_id: "",
  dateInscription: "",
};

/* ─────────────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────────────── */
export default function ResultatsFinAnnee() {
  /* API */
  const { data: inscriptions, loading, error, create, update, remove } = useApi("inscriptions");
  const { data: annees }    = useApi("anneeacademiques");
  const { data: etudiants } = useApi("etudiants");
  const { data: parcours }  = useApi("parcours");
  const { data: decisions } = useApi("decisions");

  /* État UI */
  const [anneeSelectionnee, setAnneeSelectionnee] = useState("");
  const [filtreDecision, setFiltreDecision]       = useState("");
  const [filtreParcours, setFiltreParcours]       = useState("");
  const [search, setSearch]                       = useState("");
  const [modal, setModal]                         = useState(false);
  const [form, setForm]                           = useState(EMPTY_FORM);
  const [editId, setEditId]                       = useState(null);
  const [confirm, setConfirm]                     = useState(null);
  const [toast, setToast]                         = useState(null);

  /* Sélection automatique de l'année active */
  useEffect(() => {
    if (!anneeSelectionnee && annees.length > 0) {
      const active = annees.find(a => a.est_active) ?? annees[0];
      setAnneeSelectionnee(String(active.id));
    }
  }, [annees, anneeSelectionnee]);

  /* ── Toast ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Inscriptions filtrées par année ── */
  const inscriptionsAnnee = useMemo(() =>
    inscriptions.filter(i =>
      String(i.annee_academique_id) === anneeSelectionnee ||
      annees.find(a => String(a.id) === anneeSelectionnee)?.libelle === i.annee_academique
    ),
  [inscriptions, anneeSelectionnee, annees]);

  /* ── Filtrage avancé ── */
  const inscriptionsFiltrees = useMemo(() => {
    return inscriptionsAnnee.filter(i => {
      const texte = `${i.etudiant ?? ""} ${i.parcours ?? ""}`.toLowerCase();
      const ok1 = texte.includes(search.toLowerCase());
      const ok2 = filtreDecision ? i.decision === filtreDecision : true;
      const ok3 = filtreParcours ? i.parcours  === filtreParcours  : true;
      return ok1 && ok2 && ok3;
    });
  }, [inscriptionsAnnee, search, filtreDecision, filtreParcours]);

  /* ── Statistiques ── */
  const stats = useMemo(() => {
    const total = inscriptionsAnnee.length;
    if (total === 0) return { total: 0, parDecision: {}, tauxReussite: 0 };

    const parDecision = {};
    inscriptionsAnnee.forEach(i => {
      const d = i.decision ?? "Inconnu";
      parDecision[d] = (parDecision[d] ?? 0) + 1;
    });

    const admis = (parDecision["Admis"] ?? 0) + (parDecision["Admis sous condition"] ?? 0) + (parDecision["Diplômé"] ?? 0);
    return { total, parDecision, tauxReussite: Math.round((admis / total) * 100) };
  }, [inscriptionsAnnee]);

  /* ── Listes pour filtres ── */
  const parcoursDisponibles = useMemo(() =>
    [...new Set(inscriptionsAnnee.map(i => i.parcours).filter(Boolean))].sort(),
  [inscriptionsAnnee]);

  const decisionsDisponibles = useMemo(() =>
    [...new Set(inscriptionsAnnee.map(i => i.decision).filter(Boolean))].sort(),
  [inscriptionsAnnee]);

  /* ── Ouverture formulaire ── */
  const ouvrirCreation = () => {
    const anneeId = anneeSelectionnee || (annees.find(a => a.est_active)?.id ?? "");
    setForm({ ...EMPTY_FORM, annee_academique_id: String(anneeId), dateInscription: new Date().toISOString().slice(0,10) });
    setEditId(null);
    setModal(true);
  };

  const ouvrirModification = (ins) => {
    setForm({
      etudiants_id:       String(ins.etudiant_id ?? etudiants.find(e => `${e.prenoms} ${e.nom}` === ins.etudiant)?.id ?? ""),
      parcours_id:        String(parcours.find(p => p.libelle === ins.parcours)?.id ?? ""),
      annee_academique_id:String(annees.find(a => a.libelle === ins.annee_academique)?.id ?? ""),
      decisions_id:       String(decisions.find(d => d.libelle === ins.decision)?.id ?? ""),
      dateInscription:    ins.dateInscription?.slice(0,10) ?? "",
    });
    setEditId(ins.id);
    setModal(true);
  };

  /* ── Soumission ── */
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Résultat modifié ✓" : "Résultat ajouté ✓");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  /* ── Suppression ── */
  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      setConfirm(null);
      showToast("Résultat supprimé ✓");
    } catch (err) {
      setConfirm(null);
      showToast(err.message, true);
    }
  };

  /* ── Impression ── */
  const imprimer = () => window.print();

  /* ── Libellé année sélectionnée ── */
  const libelleAnnee = annees.find(a => String(a.id) === anneeSelectionnee)?.libelle ?? "";

  /* ══════════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="page">

      {/* ─── En-tête ─────────────────────────────────────────── */}
      <div className="page-header">
        <h1><span className="icon">📊</span> Résultats de Fin d'Année</h1>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-secondary" onClick={imprimer}>🖨️ Imprimer</button>
          <button className="btn btn-primary"   onClick={ouvrirCreation}>+ Ajouter un résultat</button>
        </div>
      </div>

      {/* ─── Sélecteur d'année ───────────────────────────────── */}
      <div style={{
        background:"var(--bg-card)", borderRadius:"var(--radius)",
        boxShadow:"var(--shadow-sm)", padding:"18px 22px",
        marginBottom:22, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
      }}>
        <span style={{ fontWeight:600, color:"var(--text-muted)", fontSize:".9rem" }}>
          📅 Année académique :
        </span>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {annees.map(a => (
            <button
              key={a.id}
              className={`btn btn-sm ${String(a.id) === anneeSelectionnee ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setAnneeSelectionnee(String(a.id)); setFiltreDecision(""); setFiltreParcours(""); setSearch(""); }}
            >
              {a.libelle}
              {a.est_active && <span style={{ marginLeft:5, fontSize:".72rem", background:"rgba(255,255,255,.3)", padding:"1px 5px", borderRadius:8 }}>Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Statistiques ────────────────────────────────────── */}
      {anneeSelectionnee && stats.total > 0 && (
        <>
          {/* Cartes résumé */}
          <div className="stats-row" style={{ marginBottom:18 }}>
            <div className="stat-card">
              <div className="stat-num">{stats.total}</div>
              <div className="stat-label">Total inscrits</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color:"var(--success)" }}>
                {stats.tauxReussite}%
              </div>
              <div className="stat-label">Taux de réussite</div>
            </div>
            {Object.entries(stats.parDecision).map(([decision, count]) => (
              <div className="stat-card" key={decision}>
                <div className="stat-num" style={{ color: COULEUR_DECISION[decision] ?? "var(--primary)", fontSize:"1.6rem" }}>
                  {count}
                </div>
                <div className="stat-label">
                  {DECISION_BADGE[decision]?.icon ?? "•"} {decision}
                </div>
              </div>
            ))}
          </div>

          {/* Barre de progression par décision */}
          <div style={{
            background:"var(--bg-card)", borderRadius:"var(--radius)",
            boxShadow:"var(--shadow-sm)", padding:"20px 24px", marginBottom:22,
          }}>
            <div style={{ fontWeight:600, color:"var(--primary)", marginBottom:14, fontSize:".95rem" }}>
              📈 Répartition des résultats — {libelleAnnee}
            </div>

            {/* Barre empilée */}
            <div style={{ display:"flex", height:28, borderRadius:8, overflow:"hidden", marginBottom:16 }}>
              {Object.entries(stats.parDecision).map(([decision, count]) => (
                <div
                  key={decision}
                  title={`${decision} : ${count} (${Math.round((count/stats.total)*100)}%)`}
                  style={{
                    flex: count / stats.total,
                    background: COULEUR_DECISION[decision] ?? "#94a3b8",
                    transition:"flex .4s ease",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"#fff", fontSize:".72rem", fontWeight:700,
                    overflow:"hidden",
                  }}
                >
                  {count / stats.total > 0.05 ? `${Math.round((count/stats.total)*100)}%` : ""}
                </div>
              ))}
            </div>

            {/* Légende */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 20px" }}>
              {Object.entries(stats.parDecision).map(([decision, count]) => (
                <div key={decision} style={{ display:"flex", alignItems:"center", gap:6, fontSize:".82rem" }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background: COULEUR_DECISION[decision] ?? "#94a3b8" }}/>
                  <span>{DECISION_BADGE[decision]?.icon ?? "•"} {decision}</span>
                  <span style={{ color:"var(--text-muted)" }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── Tableau des résultats ───────────────────────────── */}
      <div className="table-card">

        {/* Barre de filtres */}
        <div className="table-toolbar" style={{ flexWrap:"wrap", gap:10 }}>
          <input
            className="search-input"
            placeholder="🔍  Rechercher un étudiant ou parcours…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth:220, flex:1 }}
          />

          <select
            className="search-input"
            style={{ flex:"none", width:180 }}
            value={filtreDecision}
            onChange={e => setFiltreDecision(e.target.value)}
          >
            <option value="">⚖️ Toutes les décisions</option>
            {decisionsDisponibles.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            className="search-input"
            style={{ flex:"none", width:200 }}
            value={filtreParcours}
            onChange={e => setFiltreParcours(e.target.value)}
          >
            <option value="">🗺️ Tous les parcours</option>
            {parcoursDisponibles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>

          {(filtreDecision || filtreParcours || search) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFiltreDecision(""); setFiltreParcours(""); setSearch(""); }}>
              ✕ Réinitialiser
            </button>
          )}

          <span style={{ color:"var(--text-muted)", fontSize:".84rem", alignSelf:"center" }}>
            {inscriptionsFiltrees.length} résultat(s)
          </span>
        </div>

        {/* État chargement */}
        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {/* Message si aucune année */}
        {!loading && !error && !anneeSelectionnee && (
          <div className="empty-state">
            <div style={{ fontSize:"2rem", marginBottom:8 }}>📅</div>
            Sélectionnez une année académique pour voir les résultats.
          </div>
        )}

        {/* Tableau */}
        {!loading && !error && anneeSelectionnee && (
          <table>
            <thead>
              <tr>
                <th style={{ width:40 }}>#</th>
                <th>Étudiant</th>
                <th>Parcours</th>
                <th>Décision</th>
                <th>Date inscription</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inscriptionsFiltrees.length === 0 && (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <div style={{ fontSize:"2rem", marginBottom:8 }}>📭</div>
                    Aucun résultat pour les critères sélectionnés.
                  </div>
                </td></tr>
              )}
              {inscriptionsFiltrees.map((ins, i) => {
                const badgeInfo = DECISION_BADGE[ins.decision] ?? { cls: "badge-default", icon: "•" };
                return (
                  <tr key={ins.id}>
                    <td style={{ color:"var(--text-muted)", fontSize:".82rem" }}>{i + 1}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:"50%",
                          background:"var(--primary)", color:"#fff",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:".72rem", fontWeight:700, flexShrink:0,
                        }}>
                          {(ins.etudiant ?? "").split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                        </div>
                        <div>
                          <strong>{ins.etudiant ?? "—"}</strong>
                          {ins.etudiant_email && (
                            <div style={{ fontSize:".74rem", color:"var(--text-muted)" }}>
                              {ins.etudiant_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:".85rem", color:"var(--text-muted)" }}>
                      {ins.parcours ?? "—"}
                    </td>
                    <td>
                      <span className={`badge ${badgeInfo.cls}`}>
                        {badgeInfo.icon} {ins.decision ?? "—"}
                      </span>
                    </td>
                    <td style={{ fontSize:".84rem", color:"var(--text-muted)" }}>
                      {ins.dateInscription?.slice(0,10) ?? "—"}
                    </td>
                    <td style={{ fontSize:".82rem" }}>
                      {ins.etudiant_email
                        ? <a href={`mailto:${ins.etudiant_email}`} style={{ color:"var(--primary-light)" }}>
                            {ins.etudiant_email}
                          </a>
                        : "—"
                      }
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-edit btn-sm"
                          onClick={() => ouvrirModification(ins)}>✏️ Modifier</button>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => setConfirm(ins)}>🗑️ Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pied de tableau */}
        {inscriptionsFiltrees.length > 0 && (
          <div style={{
            padding:"12px 20px", borderTop:"1px solid var(--border)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            fontSize:".83rem", color:"var(--text-muted)",
          }}>
            <span>Affichage de {inscriptionsFiltrees.length} sur {inscriptionsAnnee.length} résultat(s)</span>
            <span>Année : <strong style={{ color:"var(--primary)" }}>{libelleAnnee}</strong></span>
          </div>
        )}
      </div>

      {/* ══ Modal formulaire ══════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={ev => ev.stopPropagation()}>
            <h2>{editId ? "✏️ Modifier le résultat" : "➕ Nouveau résultat"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Étudiant *</label>
                <select required value={form.etudiants_id}
                  onChange={ev => setForm({ ...form, etudiants_id: ev.target.value })}>
                  <option value="">-- Choisir un étudiant --</option>
                  {etudiants.map(e => (
                    <option key={e.id} value={e.id}>{e.prenoms} {e.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Parcours *</label>
                <select required value={form.parcours_id}
                  onChange={ev => setForm({ ...form, parcours_id: ev.target.value })}>
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
                    onChange={ev => setForm({ ...form, annee_academique_id: ev.target.value })}>
                    <option value="">-- Choisir --</option>
                    {annees.map(a => (
                      <option key={a.id} value={a.id}>{a.libelle}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Décision *</label>
                  <select required value={form.decisions_id}
                    onChange={ev => setForm({ ...form, decisions_id: ev.target.value })}>
                    <option value="">-- Choisir --</option>
                    {decisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {DECISION_BADGE[d.libelle]?.icon ?? "•"} {d.libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Date d'inscription *</label>
                <input type="date" required value={form.dateInscription}
                  onChange={ev => setForm({ ...form, dateInscription: ev.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer" : "✅ Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ─────────────────────────────── */}
      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm?.etudiant ?? ""}
        message="Êtes-vous sûr de vouloir supprimer le résultat de"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast ${toast.isError ? "toast-error" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Style impression ─────────────────────────────────────── */}
      <style>{`
        @media print {
          .btn, .table-toolbar, .actions-cell, .page-header button { display: none !important; }
          .page { padding: 10px !important; }
          .table-card { box-shadow: none !important; }
          thead { background: #1a3c6e !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}