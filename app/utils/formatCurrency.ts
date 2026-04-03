export const formatCurrency = (
  amount: number,
  currLocale: string,
  currency: 'USD' | 'EUR' = 'USD',
  options: Intl.NumberFormatOptions = {},
) => {
  const defaultMinimumFractionDigits =
    options.maximumFractionDigits !== undefined && options.maximumFractionDigits <= 2
      ? { minimumFractionDigits: options.maximumFractionDigits }
      : {}

  return new Intl.NumberFormat(currLocale, {
    style: 'currency',
    currency,
    ...defaultMinimumFractionDigits,
    ...options,
  })
    .format(amount)
    .toString()
}