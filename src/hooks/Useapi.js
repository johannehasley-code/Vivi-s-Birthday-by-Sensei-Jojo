// src/hooks/useApi.js
import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api";

export function useApi(endpoint) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (body) => {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Erreur création");
    await fetchData();
    return json;
  };

  const update = async (id, body) => {
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Erreur modification");
    await fetchData();
    return json;
  };

  const remove = async (id) => {
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Erreur suppression");
    await fetchData();
    return json;
  };

  return { data, loading, error, refetch: fetchData, create, update, remove };
}