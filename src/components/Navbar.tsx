"use client";

import { useState } from "react";
import { Search, LogOut, X, Bookmark, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  user: { email: string } | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: "home" | "favorites";
  onViewChange: (view: "home" | "favorites") => void;
}

export default function Navbar({
  user,
  searchQuery,
  onSearchChange,
  currentView,
  onViewChange,
}: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendMagicLink = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "发送失败");
      }
    } catch {
      setError("网络错误，请重试");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          {/* Brand */}
          <button onClick={() => onViewChange("home")} className="flex items-center gap-2 shrink-0">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-bold text-sm tracking-tight">AI Radar</span>
          </button>

          {/* Nav tabs */}
          <div className="flex items-center gap-0.5 rounded-full px-1 py-0.5" style={{ background: "var(--tag-bg)" }}>
            <button
              onClick={() => onViewChange("home")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentView === "home"
                  ? "bg-accent-bg text-accent-text"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              精选
            </button>
            {user && (
              <button
                onClick={() => onViewChange("favorites")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentView === "favorites"
                    ? "bg-accent-bg text-accent-text"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Bookmark className="w-3 h-3" />
                收藏
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="搜索标题/摘要…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--tag-bg)] text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Auth */}
          <div className="shrink-0">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setSent(false);
                  setError("");
                }}
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-text-primary">邮箱登录</h2>
              <button
                onClick={() => { setShowAuthModal(false); setSent(false); setError(""); }}
                className="p-1 rounded-lg hover:bg-[var(--tag-bg)]"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {!sent ? (
              <>
                <p className="text-xs text-text-muted mb-4">
                  输入您的邮箱，我们将发送一个登录链接
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--tag-bg)] border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30 mb-3"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink()}
                />
                <button
                  onClick={handleSendMagicLink}
                  disabled={loading || !email}
                  className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "发送中..." : "发送登录链接"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <span className="text-3xl block mb-3">📧</span>
                <p className="text-xs text-text-muted mb-1">登录链接已发送到</p>
                <p className="text-sm font-medium text-text-primary mb-3">{email}</p>
                <p className="text-xs text-text-muted">请查看邮箱并点击登录链接</p>
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
