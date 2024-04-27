import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'

const app = new Elysia().use(registerRestaurant)

app.listen(3333, () => {
  console.log('🚀 HTTP Server is running on port 3333')
})
