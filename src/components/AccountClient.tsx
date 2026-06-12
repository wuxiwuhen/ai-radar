"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

interface AccountClientProps {
  email: string;
}

export default function AccountClient({ email }: AccountClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSetPassword = async () => {
    setError("");
    setSuccess(false);

    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "设置失败");
      }
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app-shell">
      <Sidebar
        user={{ email }}
        currentView="home"
        onViewChange={() => router.push("/")}
      />
      <div className="app-body">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
          <button
            onClick={() => router.push("/")}
            className="p-1.5 rounded-lg hover:bg-tag-bg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <span className="text-sm font-semibold">账号设置</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-md">
          {/* Desktop title */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/")}
              className="p-1.5 rounded-lg hover:bg-tag-bg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
            <h1 className="text-base font-semibold">账号设置</h1>
          </div>

          {/* Email display */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-bg flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-text-muted mb-0.5">邮箱地址</p>
                <p className="text-sm text-text-primary truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Set password */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold">设置密码</h2>
            </div>

            {success ? (
              <div className="text-center py-3">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-text-primary mb-1">
                  密码设置成功！
                </p>
                <p className="text-xs text-text-muted">
                  下次可使用邮箱和密码登录
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-3 text-xs text-accent hover:underline"
                >
                  重新设置
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="输入新密码（至少6位）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-tag-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30 pr-10"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSetPassword()
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-tag-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSetPassword()
                    }
                  />
                </div>

                <button
                  onClick={handleSetPassword}
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {loading ? "保存中..." : "保存密码"}
                </button>
              </>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
            )}
          </div>

          {/* Logout */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-text-muted hover:text-text-primary hover:bg-tag-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
