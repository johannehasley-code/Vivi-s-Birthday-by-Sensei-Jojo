// src/pages/Inscriptions.jsx
import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/Useapi";
import ConfirmModal from "./ConfirmModal";
import "../App.css";

/* ─────────────────────────────────────────────────────────────────
   Constantes et helpers
───────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  etudiants_id: "",
  parcours_id: "",
  annee_academique_id: "",
  decisions_id: "",
  dateInscription: new Date().toISOString().slice(0, 10), // Aujourd'hui par défaut
};

/* ─────────────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────────────── */
export default function Inscriptions() {
  /* API */
  const { data: inscriptions, loading, error, create } = useApi("inscriptions");
  const { data: etudiants } = useApi("etudiants");
  const { data: parcours }  = useApi("parcours");
  const { data: annees }    = useApi("anneeacademiques");
  const { data: decisions } = useApi("decisions");

  /* État UI */
  const [form, setForm]     = useState(EMPTY_FORM);
  const [toast, setToast]   = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  /* ── Toast ── */
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Gestion formulaire ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ── Soumission ── */
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoadingSubmit(true);
    try {
      await create(form);
      setForm(EMPTY_FORM);
      showToast("Inscription créée avec succès ✓");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoadingSubmit(false);
    }
  };

  /* ── Sélection automatique de l'année active ── */
  useEffect(() => {
    if (annees.length > 0 && !form.annee_academique_id) {
      const active = annees.find(a => a.est_active);
      if (active) {
        setForm(prev => ({ ...prev, annee_academique_id: active.id }));
      }
    }
  }, [annees, form.annee_academique_id]);

  /* ══════════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════════ */
  if (loading) return <div className="page"><div className="loading">Chargement...</div></div>;
  if (error) return <div className="page"><div className="error">Erreur: {error}</div></div>;

  return (
    <div className="page">

      {/* ─── En-tête ─────────────────────────────────────────── */}
      <div className="page-header">
        <h1><span className="icon">📋</span> Inscriptions</h1>
      </div>

      {/* ─── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className={`toast ${toast.isError ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}

      {/* ─── Formulaire d'inscription ────────────────────────── */}
      <div className="table-card">
        <h2 style={{ marginBottom: 20, color: "var(--primary)" }}>Nouvelle inscription</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>

          {/* Étudiant */}
          <div className="form-group">
            <label>Étudiant *</label>
            <select
              name="etudiants_id"
              value={form.etudiants_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            >
              <option value="">-- Sélectionner un étudiant --</option>
              {etudiants.map(e => (
                <option key={e.id} value={e.id}>
                  {e.prenoms} {e.nom} ({e.email})
                </option>
              ))}
            </select>
          </div>

          {/* Parcours */}
          <div className="form-group">
            <label>Parcours *</label>
            <select
              name="parcours_id"
              value={form.parcours_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            >
              <option value="">-- Sélectionner un parcours --</option>
              {parcours.map(p => (
                <option key={p.id} value={p.id}>{p.libelle}</option>
              ))}
            </select>
          </div>

          {/* Année académique */}
          <div className="form-group">
            <label>Année académique *</label>
            <select
              name="annee_academique_id"
              value={form.annee_academique_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            >
              <option value="">-- Sélectionner une année --</option>
              {annees.map(a => (
                <option key={a.id} value={a.id}>
                  {a.libelle} {a.est_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Décision */}
          <div className="form-group">
            <label>Décision *</label>
            <select
              name="decisions_id"
              value={form.decisions_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            >
              <option value="">-- Sélectionner une décision --</option>
              {decisions.map(d => (
                <option key={d.id} value={d.id}>{d.libelle}</option>
              ))}
            </select>
          </div>

          {/* Date d'inscription */}
          <div className="form-group">
            <label>Date d'inscription *</label>
            <input
              type="date"
              name="dateInscription"
              value={form.dateInscription}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            />
          </div>

          {/* Bouton soumettre */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingSubmit}
              style={{ opacity: loadingSubmit ? 0.5 : 1 }}
            >
              {loadingSubmit ? "Inscription en cours..." : "Inscrire l'étudiant"}
            </button>
          </div>

        </form>
      </div>

      {/* ─── Liste récente des inscriptions ───────────────────── */}
      <div className="table-card" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 20, color: "var(--primary)" }}>Inscriptions récentes</h2>

        {inscriptions.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Aucune inscription pour le moment.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "2px solid var(--border)" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Étudiant</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Parcours</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Année</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Décision</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.slice(0, 10).map(i => (
                  <tr key={i.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px" }}>{i.etudiant}</td>
                    <td style={{ padding: "12px" }}>{i.parcours}</td>
                    <td style={{ padding: "12px" }}>{i.annee_academique}</td>
                    <td style={{ padding: "12px" }}>{i.decision}</td>
                    <td style={{ padding: "12px" }}>{new Date(i.dateInscription).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}</content>
<parameter name="filePath">c:\Users\Johanne Hasley\OneDrive\Pictures\Camera Roll\Desktop\gestion-2ie\gestion2ie\src\pages\Inscriptions.jsx
