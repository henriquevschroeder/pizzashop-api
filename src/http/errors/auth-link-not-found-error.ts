export class AuthLinkNotFoundError extends Error {
  constructor() {
    super('Auth link not found')
  }
}
