export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  merge: {
    apiKey: process.env.MERGE_API_KEY || "",
    accountToken: process.env.MERGE_ACCOUNT_TOKEN || "",
  },
  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID || "",
    clientSecret: process.env.ZOHO_CLIENT_SECRET || "",
    refreshToken: process.env.ZOHO_REFRESH_TOKEN || "",
    organizationId: process.env.ZOHO_ORGANIZATION_ID || "",
  },
  mcp: {
    gmailEndpoint: process.env.GMAIL_MCP_ENDPOINT || "",
    indeedEndpoint: process.env.INDEED_MCP_ENDPOINT || "",
    gcalEndpoint: process.env.GCAL_MCP_ENDPOINT || "",
    authToken: process.env.MCP_AUTH_TOKEN || "",
  },
};

export default env;

