import { http } from '@/lib/api/http'
import type { CreateUserInput, UpdateUserInput, User } from './users.types'

/** @deprecated The generic /users endpoint is not part of TutorConnect v2. */
export const usersApi = {
  list: () => http.get<User[]>('/users').then((r) => r.data),
  get: (id: number) => http.get<User>(`/users/${id}`).then((r) => r.data),
  create: (input: CreateUserInput) =>
    http.post<User>('/users', input).then((r) => r.data),
  update: (id: number, input: UpdateUserInput) =>
    http.patch<User>(`/users/${id}`, input).then((r) => r.data),
  remove: (id: number) => http.delete(`/users/${id}`).then(() => id),
}
