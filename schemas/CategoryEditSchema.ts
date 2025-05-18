import { z } from 'zod'

export const CategoryEditSchema = z.object({
  name: z.string().min(1, 'Please enter a name of category'),
})

export type CategoryEdit = z.output<typeof CategoryEditSchema>
