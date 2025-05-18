import { z } from 'zod'

export const UserEditSchema = z.object({
  username: z.string().min(1, 'Please enter a username').regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain whitespaces'),
  role: z.string().min(1, 'Please select a role'),
  new_password: z.union([z.string().min(8, 'Password must be at least 8 characters long'), z.literal('')]),
})

export type UserEdit = z.output<typeof UserEditSchema>
