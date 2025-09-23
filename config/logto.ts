export const logtoConfig = {
  endpoint: process.env.NUXT_LOGTO_ENDPOINT!,
  appId: process.env.NUXT_LOGTO_APP_ID!,
  appSecret: process.env.NUXT_LOGTO_APP_SECRET!,
  cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY!,
  pathnames: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    callback: "/auth/callback",
  },
  resources: [],
  scopes: ["profile", "email"],
  cookieSecure: process.env.NODE_ENV === "production",
};
