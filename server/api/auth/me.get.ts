export default defineEventHandler((event) => {
  const authUser = (event.context as any).authUser

  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  return { user: authUser }
})
