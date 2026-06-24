import { createAuth0 } from '@auth0/auth0-vue'

// Exported as a singleton (not just installed via app.use) so plain modules like
// services/api.ts can call getAccessTokenSilently() outside of component setup.
const authDomain = import.meta.env.VITE_AUTH0_DOMAIN?.trim() ?? ''
const authClientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim() ?? ''
const authAudience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim() ?? ''

export const AUTH_UNAVAILABLE_MESSAGE =
  'Anmeldung ist derzeit nicht verfügbar. Bitte die Deployment-Konfiguration prüfen.'
export const isAuthConfigured = authDomain.length > 0 && authClientId.length > 0

if (!isAuthConfigured) {
  console.error('[Auth0] Missing VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID.')
}

const auth0Config = {
  domain: authDomain || 'invalid.auth0.local',
  clientId: authClientId || 'missing-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    audience: authAudience || undefined,
  },
}

export const auth0 = createAuth0(auth0Config)

export async function loginWithRedirectSafe(
  options?: Parameters<typeof auth0.loginWithRedirect>[0],
) {
  if (!isAuthConfigured) {
    throw new Error(AUTH_UNAVAILABLE_MESSAGE)
  }
  await auth0.loginWithRedirect(options)
}
