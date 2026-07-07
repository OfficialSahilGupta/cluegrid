import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useTranslation } from "react-i18next";

interface City {
  id: number;
  name: string;
}

export function ManagementPanel() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: "0 0 20px 0" }}>
        Cities are statically configured for lobbying team names. Showing active cities list:
      </p>

      {error && (
        <div style={{ color: "hsl(355,85%,58%)", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
