#!/usr/bin/env bash
# Vercel build for this app. The repo-root vercel.json runs it both from
# projects rooted at alinoor/ and from one rooted at the repository top, so it
# must not assume the working directory. The Supabase values below are the
# public client settings (also in .github/workflows/deploy.yml); Vercel env
# vars override them.
set -euo pipefail
cd "$(dirname "$0")/.."
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://cgtetucceocbldqthgiw.supabase.co}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndGV0dWNjZW9jYmxkcXRoZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Njc1NzYsImV4cCI6MjA4NTE0MzU3Nn0.NGJ4sSE3kA1KPzTnUokEObM7EB-_okf3O_KRd7KFJ1s}"
npx next build
