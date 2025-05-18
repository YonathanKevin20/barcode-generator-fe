const dayjs = useDayjs()

const dateFormatted = (datetime: string) => {
  if (!datetime) return ''
  return dayjs(datetime).format('D MMM YYYY HH:mm:ss')
}

export default dateFormatted
