import React, { useState } from "react";

export function FeedbackRobot() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"bug" | "feature">("bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Simulate submission saving to localStorage history
    const feedbackList = JSON.parse(localStorage.getItem("cluegrid_feedback") || "[]");
    feedbackList.push({
      category,
      description,
      email,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("cluegrid_feedback", JSON.stringify(feedbackList));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription("");
      setEmail("");
      setIsOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* Floating Robot Button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 4900,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Pulsing Hint Speech Bubble */}
        {!isOpen && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              animation: "float-pulse 3s infinite ease-in-out",
              pointerEvents: "none",
            }}
          >
            Need a feature or found a bug?
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--accent)",
            border: "none",
            color: "var(--accent-text-on)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(5deg)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
          title="Send Feedback"
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="1"></circle>
              <path d="M12 6v5"></path>
              <line x1="8" y1="16" x2="8.01" y2="16"></line>
              <line x1="16" y1="16" x2="16.01" y2="16"></line>
              <path d="M9 11V9a3 3 0 0 1 6 0v2"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Feedback Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 4800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
            className="scale-up"
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              Feedback Assistant
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>
              Report issues or request new options. Our developer team reviews submissions regularly.
            </p>

            {submitted ? (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "var(--accent)",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Transmission received. Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Category selector */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setCategory("bug")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: category === "bug" ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                      background: category === "bug" ? "var(--accent-bg-subtle)" : "rgba(255,255,255,0.02)",
                      color: category === "bug" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}
                  >
                    Report a Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("feature")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: category === "feature" ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                      background: category === "feature" ? "var(--accent-bg-subtle)" : "rgba(255,255,255,0.02)",
                      color: category === "feature" ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}
                  >
                    Suggest a Feature
                  </button>
                </div>

                {/* Description Textarea */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      category === "bug"
                        ? "Describe what happened, step-by-step if possible..."
                        : "Describe the new option or improvement you would like to see..."
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                  />
                </div>

                {/* Email Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                  />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      background: "transparent",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: "var(--accent)",
                      color: "var(--accent-text-on)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
