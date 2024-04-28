import { Elysia, t, type Static } from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'
import { AuthLinkNotFoundError } from './errors/auth-link-not-found-error'
import { AuthLinkExpiredError } from './errors/auth-link-expired-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    AUTH_LINK_NOT_FOUND: AuthLinkNotFoundError,
    AUTH_LINK_EXPIRED: AuthLinkExpiredError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .derive({ as: 'global' }, ({ jwt, cookie: { authCookie } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        authCookie.set({
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      },

      signOutUser: () => {
        authCookie.remove()
      },

      getCurrentUser: async () => {
        const payload = await jwt.verify(authCookie.toString())

        if (!payload) {
          throw new UnauthorizedError()
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
