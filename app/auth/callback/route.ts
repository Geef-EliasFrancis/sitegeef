import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, normalizeInternalPath } from "@/lib/security";
import { isEmailAllowlisted } from "@/lib/auth/allowlist";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = normalizeInternalPath(searchParams.get("next"), "/minha-area");
  const appOrigin = getAppOrigin(request.headers);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      if (userEmail && (await isEmailAllowlisted(userEmail))) {
        return NextResponse.redirect(new URL(next, appOrigin));
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${appOrigin}/login?error=not_allowed`);
    }
  }

  return NextResponse.redirect(`${appOrigin}/login?error=auth_error`);
}
