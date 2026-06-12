"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Bookmark,
  LogOut,
  User,
  X,
  Sun,
  Moon,
  Monitor,
  Mail,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Theme = "light" | "dark" | "system";
type View = "home" | "favorites";
type LoginMode = "magic" | "password";

interface SidebarProps {
  user: { email: string } | null;
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Sidebar({ user, currentView, onViewChange }: SidebarProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Apply theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-theme");

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      root.removeAttribute("data-theme");
    } else {
      // system
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.setAttribute("data-theme", "dark");
      }
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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
      if (data.success) setSent(true);
      else setError(data.error || "发送失败");
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  };

  const handlePasswordLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sign-in-with-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const switchLoginMode = (mode: LoginMode) => {
    setLoginMode(mode);
    setError("");
    setSent(false);
  };

  const themeOptions: { id: Theme; icon: typeof Sun; label: string }[] = [
    { id: "light", icon: Sun, label: "浅色" },
    { id: "dark", icon: Moon, label: "深色" },
    { id: "system", icon: Monitor, label: "跟随系统" },
  ];

  return (
    <>
      <aside className="app-sidebar">
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 mb-5">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="font-bold text-[13px] tracking-tight">AI Radar</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          <button
            onClick={() => onViewChange("home")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
              currentView === "home"
                ? "text-accent bg-accent-bg font-medium"
                : "text-text-muted hover:text-text-primary hover:bg-tag-bg"
            }`}
          >
            <TrendingUp className="w-[18px] h-[18px] shrink-0" />
            精选
          </button>
          <button
            onClick={() => user && onViewChange("favorites")}
            disabled={!user}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
              currentView === "favorites"
                ? "text-accent bg-accent-bg font-medium"
                : !user
                ? "text-text-muted opacity-40 cursor-not-allowed"
                : "text-text-muted hover:text-text-primary hover:bg-tag-bg"
            }`}
          >
            <Bookmark className="w-[18px] h-[18px] shrink-0" />
            收藏
          </button>
        </nav>

        {/* Bottom section: theme + auth */}
        <div className="mt-auto pt-3 border-t border-border space-y-1">
          {/* Theme switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-text-muted hover:text-text-primary hover:bg-tag-bg transition-colors"
            >
              {theme === "dark" ? <Moon className="w-[18px] h-[18px]" /> : theme === "light" ? <Sun className="w-[18px] h-[18px]" /> : <Monitor className="w-[18px] h-[18px]" />}
              {theme === "dark" ? "深色" : theme === "light" ? "浅色" : "跟随系统"}
            </button>

            {showThemePicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-xl shadow-lg p-1 min-w-[130px]">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setTheme(opt.id); setShowThemePicker(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                      theme === opt.id ? "text-accent bg-accent-bg font-medium" : "text-text-muted hover:bg-tag-bg"
                    }`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {user ? (
            <div>
              <button
                onClick={() => router.push("/account")}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-text-muted hover:text-text-primary hover:bg-tag-bg transition-colors"
              >
                <User className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{user.email}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-text-muted hover:text-text-primary hover:bg-tag-bg transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setSent(false); setError(""); setLoginMode("magic"); setPassword(""); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-text-muted hover:text-text-primary hover:bg-tag-bg transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
              登录
            </button>
          )}
        </div>
      </aside>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">登录</h2>
              <button onClick={() => { setShowAuthModal(false); setSent(false); }} className="p-1 rounded-lg hover:bg-tag-bg">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Login mode tabs */}
            {!sent && (
              <div className="flex gap-1 mb-4 bg-tag-bg rounded-lg p-1">
                <button
                  onClick={() => switchLoginMode("magic")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors ${
                    loginMode === "magic"
                      ? "bg-card text-text-primary font-medium shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  邮箱链接
                </button>
                <button
                  onClick={() => switchLoginMode("password")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors ${
                    loginMode === "password"
                      ? "bg-card text-text-primary font-medium shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  密码登录
                </button>
              </div>
            )}

            {loginMode === "magic" ? (
              !sent ? (
                <>
                  <p className="text-xs text-text-muted mb-4">输入邮箱，发送登录链接</p>
                  <input
                    type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-tag-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30 mb-3"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink()}
                  />
                  <button onClick={handleSendMagicLink} disabled={loading || !email}
                    className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    {loading ? "发送中..." : "发送登录链接"}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl block mb-3">📧</span>
                  <p className="text-xs text-text-muted mb-1">登录链接已发送到</p>
                  <p className="text-sm font-medium text-text-primary mb-3">{email}</p>
                  <p className="text-xs text-text-muted">请查看邮箱并点击链接</p>
                </div>
              )
            ) : (
              <>
                <p className="text-xs text-text-muted mb-4">使用邮箱和密码登录</p>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-tag-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30 mb-3"
                />
                <input
                  type="password" placeholder="输入密码" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-tag-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30 mb-3"
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                />
                <button onClick={handlePasswordLogin} disabled={loading || !email || !password}
                  className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {loading ? "登录中..." : "登录"}
                </button>
              </>
            )}
            {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
