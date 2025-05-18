import { z } from 'zod'

export const SupplierCreateSchema = z.object({
  code: z.string().length(4, 'Please enter a 4 character code'),
  name: z.string().min(1, 'Please enter a name of supplier'),
})

export type SupplierCreate = z.output<typeof SupplierCreateSchema>
