export interface User {
  id: number
  name: string
  username: string
  email: string
  phone?: string
  website?: string
}

export type CreateUserInput = Omit<User, 'id'>
export type UpdateUserInput = Partial<CreateUserInput>
