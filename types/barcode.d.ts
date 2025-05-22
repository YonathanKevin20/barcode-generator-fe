export interface Barcode {
  id: number
  created_at: string
  created_by_user: string | null
  status_name: string
  category_name: string
  supplier_name: string
  product_name: string
  barcode: string
}
