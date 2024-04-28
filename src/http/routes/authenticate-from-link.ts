import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { AuthLinkNotFoundError } from '../errors/auth-link-not-found-error'
import { AuthLinkExpiredError } from '../errors/auth-link-expired-error'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, set, signUser }) => {
    const { code, redirect } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new AuthLinkNotFoundError()
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new AuthLinkExpiredError()
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    // set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
