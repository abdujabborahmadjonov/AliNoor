// AliNoor MCP server for local clients (Claude Desktop, Claude Code, …): reads
// and edits your AliNoor daily schedule over stdio, signed in with your email
// and password. The hosted version for claude.ai lives at /api/mcp.
//
// Run from the alinoor/ directory:
//   ALINOOR_EMAIL=you@example.com ALINOOR_PASSWORD=… npm run mcp
// See mcp/README.md for client setup.

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, createAliNoorServer } from './tools'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: true },
})

let userId: string | null = null

const signIn = async () => {
  if (userId) return userId
  const email = process.env.ALINOOR_EMAIL
  const password = process.env.ALINOOR_PASSWORD
  if (!email || !password)
    throw new Error(
      'Set ALINOOR_EMAIL and ALINOOR_PASSWORD for the AliNoor MCP server.'
    )
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.user)
    throw new Error(`Sign-in to AliNoor failed: ${error?.message ?? 'no user'}`)
  userId = data.user.id
  return userId
}

createAliNoorServer(supabase, signIn)
  .connect(new StdioServerTransport())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
