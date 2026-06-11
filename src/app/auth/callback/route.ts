import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "email";
  const next = searchParams.get("next") || "/";

  // Supabase magic link / OTP callback
  if (code || token_hash) {
    const supabase = await createClient();

    // Exchange code for session (PKCE flow)
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth callback error:", error.message);
        return NextResponse.redirect(`${origin}?auth=error`);
      }
    }

    // Verify OTP with token_hash (legacy flow)
    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as "email" | "signup" | "magiclink",
        token_hash,
      });
      if (error) {
        console.error("OTP verify error:", error.message);
        return NextResponse.redirect(`${origin}?auth=error`);
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // No code or token, redirect home
  return NextResponse.redirect(origin);
}
