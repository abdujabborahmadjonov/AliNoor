// Serves /.well-known/oauth-authorization-server and
// /.well-known/oauth-protected-resource (rewritten here by vercel.json).
import { Req, Res, json, metadata, origin, queryOf, resourceMetadata } from '../../mcp/oauth'

export default function handler(req: Req, res: Res) {
  const base = origin(req)
  if (queryOf(req).kind === 'resource') return json(res, 200, resourceMetadata(base))
  return json(res, 200, metadata(base))
}
