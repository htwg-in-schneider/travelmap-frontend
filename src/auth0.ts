import { createAuth0 } from '@auth0/auth0-vue'

// Exported as a singleton (not just installed via app.use) so plain modules like
// services/api.ts can call getAccessTokenSilently() outside of component setup.
export const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
})
