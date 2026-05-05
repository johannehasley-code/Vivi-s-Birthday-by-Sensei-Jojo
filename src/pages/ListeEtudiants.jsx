// src/components/ListeEtudiants.jsx
import React, { useState, useMemo } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const COULEURS = [
  "#1a3c6e","#e8a020","#16a34a","#7c3aed",
  "#dc2626","#0891b2","#be185d","#92400e",
];
const couleurAvatar = (index) => COULEURS[index % COULEURS.length];

const getInitiales = (etudiant) =>
  `${(etudiant.prenoms?.[0] ?? "").toUpperCase()}${(etudiant.nom?.[0] ?? "").toUpperCase()}`;

const calculerAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const EMPTY_FORM = {
  nom: "", prenoms: "", pays_id: "",
  civilites_id: "", dateNaissance: "",
  email: "", telephone: "",
};

/* ─────────────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────────────── */
export default function ListeEtudiants() {
  /* API */
  const { data: etudiants, loading, error, create, update, remove } = useApi("etudiants");
  const { data: pays }      = useApi("pays");
  const { data: civilites } = useApi("civilites");

  /* État UI */
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [confirm, setConfirm]     = useState(null);
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState("");
  const [filtrePays, setFiltrePays] = useState("");
  const [vue, setVue]             = useState("table"); // "table" | "carte"
  const [tri, setTri]             = useState({ col: "nom", dir: "asc" });
  const [detailEtudiant, setDetailEtudiant] = useState(null);

  /* ── Toast ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Ouverture formulaire ── */
  const ouvrirCreation = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true); };

  const ouvrirModification = (e) => {
    setForm({
      nom:          e.nom,
      prenoms:      e.prenoms,
      pays_id:      pays.find(p => p.libelle === e.pays)?.id ?? "",
      civilites_id: civilites.find(c => c.libelle === e.civilite)?.id ?? "",
      dateNaissance: e.dateNaissance?.slice(0, 10) ?? "",
      email:        e.email ?? "",
      telephone:    e.telephone ?? "",
    });
    setEditId(e.id);
    setModal(true);
  };

  /* ── Soumission ── */
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (editId) await update(editId, form);
      else        await create(form);
      setModal(false);
      showToast(editId ? "Étudiant modifié avec succès ✓" : "Étudiant ajouté avec succès ✓");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  /* ── Suppression ── */
  const handleDelete = async () => {
    try {
      await remove(confirm.id);
      if (detailEtudiant?.id === confirm.id) setDetailEtudiant(null);
      setConfirm(null);
      showToast("Étudiant supprimé avec succès ✓");
    } catch (err) {
      setConfirm(null);
      showToast(err.message, true);
    }
  };

  /* ── Tri colonnes ── */
  const basculerTri = (col) =>
    setTri(prev => ({ col, dir: prev.col === col && prev.dir === "asc" ? "desc" : "asc" }));

  const fleche = (col) => tri.col === col ? (tri.dir === "asc" ? " ↑" : " ↓") : " ⇅";

  /* ── Filtrage + tri mémoïsés ── */
  const etudiantsFiltres = useMemo(() => {
    let liste = etudiants.filter(e => {
      const haystack = `${e.nom} ${e.prenoms} ${e.email ?? ""} ${e.pays ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase()) &&
             (filtrePays ? e.pays === filtrePays : true);
    });
    return [...liste].sort((a, b) => {
      const va = (a[tri.col] ?? "").toString().toLowerCase();
      const vb = (b[tri.col] ?? "").toString().toLowerCase();
      return tri.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [etudiants, search, filtrePays, tri]);

  /* ── Statistiques ── */
  const stats = useMemo(() => ({
    total:         etudiants.length,
    nationalites:  [...new Set(etudiants.map(e => e.pays))].filter(Boolean).length,
    hommes:        etudiants.filter(e => e.civilite === "Monsieur").length,
    femmes:        etudiants.filter(e => ["Madame","Mademoiselle"].includes(e.civilite)).length,
  }), [etudiants]);

  const listePays = useMemo(() =>
    [...new Set(etudiants.map(e => e.pays))].filter(Boolean).sort(),
  [etudiants]);

  /* ── Index pour avatar coloré ── */
  const indexEtudiant = (id) => etudiants.findIndex(e => e.id === id);

  /* ══════════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="page">

      {/* ─── En-tête ─────────────────────────────────────────── */}
      <div className="page-header">
        <h1><span className="icon">👥</span> Liste des Étudiants</h1>
        <button className="btn btn-primary" onClick={ouvrirCreation}>
          + Nouvel étudiant
        </button>
      </div>

      {/* ─── Statistiques ────────────────────────────────────── */}
      <div className="stats-row">
        {[
          { num: stats.total,       label: "Total étudiants",  icon: "👥" },
          { num: stats.nationalites,label: "Nationalités",     icon: "🌍" },
          { num: stats.hommes,      label: "Hommes",           icon: "👨" },
          { num: stats.femmes,      label: "Femmes",           icon: "👩" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{s.icon}</div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Tableau principal ───────────────────────────────── */}
      <div className="table-card">

        {/* Barre d'outils */}
        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
          <input
            className="search-input"
            placeholder="🔍  Nom, email, pays…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 200, flex: 1 }}
          />

          <select
            className="search-input"
            style={{ flex: "none", width: 170 }}
            value={filtrePays}
            onChange={e => setFiltrePays(e.target.value)}
          >
            <option value="">🌍 Tous les pays</option>
            {listePays.map(p => <option key={p}>{p}</option>)}
          </select>

          {/* Bascule vue */}
          <div style={{ display:"flex", gap:4 }}>
            <button
              className={`btn btn-sm ${vue==="table" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setVue("table")} title="Vue tableau">
              ☰ Tableau
            </button>
            <button
              className={`btn btn-sm ${vue==="carte" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setVue("carte")} title="Vue cartes / trombinoscope">
              ⊞ Cartes
            </button>
          </div>

          <span style={{ color:"var(--text-muted)", fontSize:".84rem", alignSelf:"center" }}>
            {etudiantsFiltres.length} résultat(s)
          </span>
        </div>

        {/* États de chargement */}
        {loading && <div className="loading-state"><div className="spinner"/><p>Chargement…</p></div>}
        {error   && <div className="error-state">⚠ Erreur : {error}</div>}

        {/* ══ VUE TABLEAU ══════════════════════════════════════ */}
        {!loading && !error && vue === "table" && (
          <table>
            <thead>
              <tr>
                <th style={{ width:52 }}>Avatar</th>
                <th style={{ cursor:"pointer" }} onClick={() => basculerTri("nom")}>
                  Étudiant{fleche("nom")}
                </th>
                <th>Civilité</th>
                <th style={{ cursor:"pointer" }} onClick={() => basculerTri("pays")}>
                  Pays{fleche("pays")}
                </th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Âge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {etudiantsFiltres.length === 0 && (
                <tr><td colSpan="8">
                  <div className="empty-state">Aucun étudiant ne correspond à votre recherche.</div>
                </td></tr>
              )}
              {etudiantsFiltres.map((e) => {
                const idx = indexEtudiant(e.id);
                const isSelected = detailEtudiant?.id === e.id;
                return (
                  <tr
                    key={e.id}
                    style={{ cursor:"pointer", background: isSelected ? "#eef2ff" : "" }}
                    onClick={() => setDetailEtudiant(prev => prev?.id === e.id ? null : e)}
                  >
                    <td>
                      <div style={{
                        width:36, height:36, borderRadius:"50%",
                        background: couleurAvatar(idx), color:"#fff",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:700, fontSize:".76rem",
                      }}>
                        {getInitiales(e)}
                      </div>
                    </td>
                    <td>
                      <strong>{e.prenoms} {e.nom}</strong>
                      <div style={{ fontSize:".74rem", color:"var(--text-muted)" }}>
                        Inscrit le {e.created_at?.slice(0,10) ?? "—"}
                      </div>
                    </td>
                    <td><span className="badge badge-default">{e.civilite ?? "—"}</span></td>
                    <td>{e.pays ?? <span style={{ color:"var(--text-muted)" }}>—</span>}</td>
                    <td style={{ fontSize:".85rem" }}>
                      {e.email
                        ? <a href={`mailto:${e.email}`} style={{ color:"var(--primary-light)" }}
                             onClick={ev => ev.stopPropagation()}>{e.email}</a>
                        : <span style={{ color:"var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ fontSize:".85rem" }}>
                      {e.telephone ?? <span style={{ color:"var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      {calculerAge(e.dateNaissance) !== null
                        ? <span className="badge badge-inscrit">{calculerAge(e.dateNaissance)} ans</span>
                        : <span style={{ color:"var(--text-muted)" }}>—</span>}
                    </td>
                    <td onClick={ev => ev.stopPropagation()}>
                      <div className="actions-cell">
                        <button className="btn btn-edit btn-sm"
                          onClick={() => ouvrirModification(e)}>✏️ Modifier</button>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => setConfirm(e)}>🗑️ Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ══ VUE CARTES (trombinoscope) ═══════════════════════ */}
        {!loading && !error && vue === "carte" && (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(190px,1fr))",
            gap:18, padding:24,
          }}>
            {etudiantsFiltres.length === 0 && (
              <div className="empty-state" style={{ gridColumn:"1/-1" }}>
                Aucun étudiant trouvé.
              </div>
            )}
            {etudiantsFiltres.map(e => {
              const idx = indexEtudiant(e.id);
              const isSelected = detailEtudiant?.id === e.id;
              return (
                <div
                  key={e.id}
                  onClick={() => setDetailEtudiant(prev => prev?.id === e.id ? null : e)}
                  style={{
                    background:"#fff", borderRadius:"var(--radius)",
                    boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
                    border: `2px solid ${isSelected ? couleurAvatar(idx) : "transparent"}`,
                    padding:"22px 16px", textAlign:"center",
                    cursor:"pointer", transition:"all .2s",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.boxShadow = "var(--shadow-md)"}
                  onMouseLeave={ev => ev.currentTarget.style.boxShadow = isSelected ? "var(--shadow-md)" : "var(--shadow-sm)"}
                >
                  {/* Avatar */}
                  <div style={{
                    width:62, height:62, borderRadius:"50%",
                    background: couleurAvatar(idx), color:"#fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontWeight:800, fontSize:"1.3rem",
                    margin:"0 auto 14px",
                    boxShadow:`0 4px 14px ${couleurAvatar(idx)}44`,
                  }}>
                    {getInitiales(e)}
                  </div>
                  <div style={{ fontWeight:700, fontSize:".93rem", marginBottom:3 }}>
                    {e.prenoms} {e.nom}
                  </div>
                  <div style={{ fontSize:".76rem", color:"var(--text-muted)", marginBottom:6 }}>
                    {e.civilite ?? ""} {e.pays ? `• ${e.pays}` : ""}
                  </div>
                  {e.email && (
                    <div style={{
                      fontSize:".72rem", color:"var(--primary-light)",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      marginBottom:12,
                    }}>
                      {e.email}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:6, justifyContent:"center" }}
                       onClick={ev => ev.stopPropagation()}>
                    <button className="btn btn-edit btn-sm"
                      onClick={() => ouvrirModification(e)}>✏️</button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => setConfirm(e)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ Panneau de détail latéral ═════════════════════════════ */}
      {detailEtudiant && (
        <div style={{
          position:"fixed", top:0, right:0, bottom:0, width:300,
          background:"#fff", zIndex:900,
          boxShadow:"-6px 0 28px rgba(0,0,0,.14)",
          display:"flex", flexDirection:"column",
          animation:"slideInRight .25s ease",
        }}>
          {/* Header */}
          <div style={{
            background:`linear-gradient(135deg, var(--primary), ${couleurAvatar(indexEtudiant(detailEtudiant.id))})`,
            color:"#fff", padding:"22px 18px 28px",
          }}>
            <button onClick={() => setDetailEtudiant(null)} style={{
              float:"right", background:"rgba(255,255,255,.25)", border:"none",
              color:"#fff", borderRadius:6, padding:"4px 10px",
              cursor:"pointer", fontSize:".82rem",
            }}>✕</button>

            <div style={{
              width:58, height:58, borderRadius:"50%",
              background:"rgba(255,255,255,.25)", color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:800, fontSize:"1.25rem", marginBottom:12,
              border:"2px solid rgba(255,255,255,.5)",
            }}>
              {getInitiales(detailEtudiant)}
            </div>
            <div style={{ fontWeight:700, fontSize:"1.05rem" }}>
              {detailEtudiant.prenoms} {detailEtudiant.nom}
            </div>
            <div style={{ fontSize:".8rem", opacity:.85, marginTop:2 }}>
              {detailEtudiant.civilite ?? ""}
            </div>
          </div>

          {/* Corps */}
          <div style={{ padding:"16px 18px", overflowY:"auto", flex:1 }}>
            {[
              ["🌍", "Pays",          detailEtudiant.pays],
              ["📅", "Date naiss.",   detailEtudiant.dateNaissance?.slice(0,10)],
              ["🎂", "Âge",           calculerAge(detailEtudiant.dateNaissance) != null
                                        ? `${calculerAge(detailEtudiant.dateNaissance)} ans` : null],
              ["📧", "Email",         detailEtudiant.email],
              ["📱", "Téléphone",     detailEtudiant.telephone],
              ["🗓", "Inscrit le",    detailEtudiant.created_at?.slice(0,10)],
            ].map(([icon, label, val]) => (
              <div key={label} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                borderBottom:"1px solid var(--border)", padding:"10px 0",
                fontSize:".86rem", gap:8,
              }}>
                <span style={{ color:"var(--text-muted)", display:"flex", gap:6, alignItems:"center" }}>
                  <span>{icon}</span><span>{label}</span>
                </span>
                <span style={{ fontWeight:500, textAlign:"right", wordBreak:"break-all" }}>
                  {val ?? <em style={{ color:"var(--text-muted)", fontStyle:"italic" }}>Non renseigné</em>}
                </span>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ padding:14, borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
            <button className="btn btn-edit" style={{ flex:1 }}
              onClick={() => { ouvrirModification(detailEtudiant); setDetailEtudiant(null); }}>
              ✏️ Modifier
            </button>
            <button className="btn btn-danger" style={{ flex:1 }}
              onClick={() => { setConfirm(detailEtudiant); setDetailEtudiant(null); }}>
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}

      {/* ══ Modal formulaire ══════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={ev => ev.stopPropagation()}>
            <h2>{editId ? "✏️ Modifier l'étudiant" : "➕ Nouvel étudiant"}</h2>
            <form onSubmit={handleSubmit}>

              {/* Identité */}
              <div style={{ fontWeight:600, color:"var(--primary)", fontSize:".84rem",
                borderBottom:"2px solid var(--border)", paddingBottom:6, marginBottom:14 }}>
                Identité
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Civilité *</label>
                  <select required value={form.civilites_id}
                    onChange={ev => setForm({ ...form, civilites_id: ev.target.value })}>
                    <option value="">-- Choisir --</option>
                    {civilites.map(c => (
                      <option key={c.id} value={c.id}>{c.abreviation} {c.libelle}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pays *</label>
                  <select required value={form.pays_id}
                    onChange={ev => setForm({ ...form, pays_id: ev.target.value })}>
                    <option value="">-- Choisir un pays --</option>
                    {pays.map(p => (
                      <option key={p.id} value={p.id}>{p.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input required value={form.nom} placeholder="Nom de famille"
                    onChange={ev => setForm({ ...form, nom: ev.target.value })} />
                </div>
                <div className="form-group">
                  <label>Prénoms *</label>
                  <input required value={form.prenoms} placeholder="Prénoms"
                    onChange={ev => setForm({ ...form, prenoms: ev.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Date de naissance</label>
                <input type="date" value={form.dateNaissance}
                  onChange={ev => setForm({ ...form, dateNaissance: ev.target.value })} />
              </div>

              {/* Contact */}
              <div style={{ fontWeight:600, color:"var(--primary)", fontSize:".84rem",
                borderBottom:"2px solid var(--border)", paddingBottom:6, margin:"18px 0 14px" }}>
                Contact
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} placeholder="ex: nom@email.com"
                    onChange={ev => setForm({ ...form, email: ev.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone} placeholder="+226 xx xx xx xx"
                    onChange={ev => setForm({ ...form, telephone: ev.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "💾 Enregistrer les modifications" : "✅ Créer l'étudiant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ─────────────────────────────── */}
      <ConfirmModal
        isOpen={!!confirm}
        itemName={confirm ? `${confirm.prenoms} ${confirm.nom}` : ""}
        message="Êtes-vous sûr de vouloir supprimer l'étudiant"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast ${toast.isError ? "toast-error" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}