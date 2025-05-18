import { z } from 'zod'

export const CategoryCreateSchema = z.object({
  code: z.string().length(4, 'Please enter a 4 character code'),
  name: z.string().min(1, 'Please enter a name of category'),
})

export type CategoryCreate = z.output<typeof CategoryCreateSchema>
