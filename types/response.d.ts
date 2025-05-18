export interface PaginatedResponse<T> {
  data: T[]
  limit: number
  page: number
  total: number
  total_page: number
}
