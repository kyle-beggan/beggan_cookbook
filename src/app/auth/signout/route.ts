import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  const resolvedHost = forwardedHost || host
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const origin = new URL(request.url).origin
  
  let redirectUrl = `${origin}/login`
  if (!isLocalEnv && resolvedHost) {
    redirectUrl = `https://${resolvedHost}/login`
  }

  return NextResponse.redirect(redirectUrl, {
    status: 302,
  })
}
