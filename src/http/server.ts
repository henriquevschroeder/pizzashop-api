import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getOrderDetails } from './routes/get-order-details'
import { approveOrder } from './routes/approve-order'
import { cancelOrder } from './routes/cancel-order'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getOrders } from './routes/get-orders'
import { getMonthRevenue } from './routes/get-month-revenue'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getMonthOrdersAmount } from './routes/get-month-orders-amount'
import { getMonthCanceledOrdersAmount } from './routes/get-month-canceled-orders-amount'
import { getPopularProducts } from './routes/get-popular-products'
import { getDailyRevenueInPeriod } from './routes/get-daily-revenue-in-period'

const app = new Elysia()
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: {
          title: 'PizzaShop API Documentation',
          version: '1.0.0',
        },
      },
    }),
  )
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(deliverOrder)
  .use(dispatchOrder)
  .use(getOrders)
  .use(getMonthRevenue)
  .use(getDayOrdersAmount)
  .use(getMonthOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getPopularProducts)
  .use(getDailyRevenueInPeriod)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = error.status
        return error.toResponse()
      case 'NOT_FOUND':
        return new Response(null, { status: 404 })
      default: {
        console.error(error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }
  })

app.listen(3333, () => {
  console.log('🚀 HTTP Server is running on port 3333')
})
