import { z } from 'zod'

export const BarcodeCreateSchema = z.object({
  status_id: z.number().int().positive('Please select a status'),
  category_id: z.number().int().positive('Please select a category'),
  supplier_id: z.number().int().positive('Please select a supplier'),
  product_name: z.string().min(1, 'Please enter a name of product'),
})

export type BarcodeCreate = z.output<typeof BarcodeCreateSchema>
