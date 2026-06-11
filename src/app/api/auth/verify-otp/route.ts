import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email, token } = await request.json();

  if (!email || !token) {
    return NextResponse.json(
      { success: false, error: "邮箱和验证码不能为空" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: "验证码错误或已过期" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    user: data.user,
  });
}
