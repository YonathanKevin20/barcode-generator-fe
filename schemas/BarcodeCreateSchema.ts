import { z } from 'zod'

export const BarcodeCreateSchema = z.object({
  status_id: z.preprocess(
    (val) => (val === '' || val === 0 ? undefined : val),
    z.number({ message: 'Please select a status' }).int().positive(),
  ),
  category_id: z.preprocess(
    (val) => (val === '' || val === 0 ? undefined : val),
    z.number({ message: 'Please select a category' }).int().positive(),
  ),
  supplier_id: z.preprocess(
    (val) => (val === '' || val === 0 ? undefined : val),
    z.number({ message: 'Please select a supplier' }).int().positive(),
  ),
  product_name: z.string().min(1, 'Please enter a name of product'),
})

export type BarcodeCreate = z.output<typeof BarcodeCreateSchema>
