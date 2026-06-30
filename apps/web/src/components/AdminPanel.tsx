import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useTranslation } from "react-i18next";

interface City {
  id: number;
  name: string;
}

export function AdminPanel() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cities, setCities] = useState<City[]>([]);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const userId = localStorage.getItem("cluegrid_user_id");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (userId) {
      headers["x-mock-user-id"] = userId;
    }
    return headers;
  };

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/user/admin/cities", {
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error(await res.text() || "Failed to fetch cities");
      }
      const data = await res.json();
      if (data.success) {
        setCities(data.cities);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch cities list.");
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchCities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAdmin]);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/admin/cities", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name: newCity }),
      });
      if (!res.ok) {
        throw new Error(await res.text() || "Failed to add city");
      }
      const data = await res.json();
      if (data.success && data.city) {
        setCities((prev) => [...prev, data.city].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCity("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create city.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCity = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/user/admin/cities/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to delete city");
      }
      setCities((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete city.");
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        <h2 style={{ color: "hsl(355,85%,58%)", margin: "0 0 12px 0" }}>⚠️ {t("admin.accessDenied")}</h2>
        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
          {t("admin.adminOnly")}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "650px",
        width: "100%",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "32px",
        textAlign: "left",
        margin: "0 auto",
      }}
      className="fade-in"
    >
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0", color: "#fff" }}>
        🛠️ {t("admin.title")}
      </h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: "0 0 24px 0" }}>
        {t("admin.subtitle")}
      </p>

      {error && (
        <div style={{ color: "hsl(355,85%,58%)", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Add City Form */}
      <form onSubmit={handleAddCity} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder={t("admin.placeholder")}
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            fontSize: "0.9rem",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.25)",
            color: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: 700,
            borderRadius: "6px",
            background: "linear-gradient(135deg, hsl(220,85%,55%), hsl(220,80%,42%))",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? t("admin.adding") : t("admin.addCity")}
        </button>
      </form>

      {/* Cities list scroll container */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "6px",
          background: "rgba(0,0,0,0.15)",
          maxHeight: "350px",
          overflowY: "auto",
        }}
      >
        {cities.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)" }}>
            {t("admin.noCities")}
          </div>
        ) : (
          cities.map((city) => (
            <div
              key={city.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.95rem" }}>{city.name}</span>
              <button
                onClick={() => handleDeleteCity(city.id)}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "hsl(355,85%,58%)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  background: "transparent",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {t("admin.delete")} ❌
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
