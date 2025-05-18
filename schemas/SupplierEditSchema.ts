import { z } from 'zod'

export const SupplierEditSchema = z.object({
  name: z.string().min(1, 'Please enter a name of supplier'),
})

export type SupplierEdit = z.output<typeof SupplierEditSchema>
