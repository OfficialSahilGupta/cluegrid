import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, changeLanguage } from "../i18n.js";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === i18n.language) || SUPPORTED_LOCALES[0]!;

  const filtered = SUPPORTED_LOCALES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", zIndex: 6000 }}>
      <button
        onClick={() => setOpen(!open)}
        title={t("language.switchTo")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-default)",
          borderRadius: "20px",
          padding: "6px 12px",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.85rem",
        }}
      >
        <span>{currentLocale.flag}</span>
        <span>{currentLocale.code.toUpperCase()}</span>
        <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <div
          className="scale-up"
          style={{
            position: "absolute",
            top: "44px",
            right: 0,
            width: "260px",
            maxHeight: "380px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Search input */}
          <div style={{ padding: "8px" }}>
            <input
              type="text"
              placeholder={`${t("language.label")}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-surface-raised)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          {/* Language list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleSelect(locale.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 14px",
                  background:
                    locale.code === i18n.language
                      ? "var(--accent-bg-subtle)"
                      : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  color: locale.code === i18n.language ? "var(--accent)" : "var(--text-primary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: locale.code === i18n.language ? 700 : 500,
                  fontSize: "0.9rem",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (locale.code !== i18n.language) {
                    e.currentTarget.style.background = "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (locale.code !== i18n.language) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{locale.flag}</span>
                <span>{locale.name}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.7rem",
                    opacity: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {locale.code}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
