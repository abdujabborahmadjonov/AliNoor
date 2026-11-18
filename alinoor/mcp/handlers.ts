// Entry point for the hosted MCP server's Vercel functions. esbuild bundles
// this into api/_handlers.cjs (npm run build:api): the functions run as
// CommonJS, and bundling pulls in adhan's ES build, whose CommonJS build
// doesn't load under Node.
export { default as mcp } from './http/mcp'
export { default as oauthMetadata } from './http/metadata'
export { default as oauthRegister } from './http/register'
export { default as oauthAuthorize } from './http/authorize'
export { default as oauthToken } from './http/token'
