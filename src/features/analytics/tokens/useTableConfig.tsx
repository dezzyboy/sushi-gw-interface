import { Token } from '@dezzyboy/jiodex-core-sdk'
import { getAddress } from '@ethersproject/address'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import { formatNumber, formatPercent } from 'app/functions'
import React, { useMemo } from 'react'

import useTokensAnalytics from '../hooks/useTokensAnalytics'
import { filterForSearchQuery } from './tokenTableFilters'

export const useTableConfig = (chainId: number) => {
  // const { data, error, isValidating } = useTokensAnalytics({ chainId })
  const data = useTokensAnalytics({ chainId })
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'token',
        maxWidth: 100,
        // @ts-ignore
        Cell: (props) => {
          const currency = useMemo(
            () =>
              new Token(
                chainId,
                getAddress(props.value.id),
                Number(props.value.decimals),
                props.value.symbol,
                props.value.name
              ),
            [props]
          )
          return (
            <div className="flex items-center gap-2">
              <CurrencyLogo currency={currency ?? undefined} className="!rounded-full" size={36} />
              {props.value.symbol}
            </div>
          )
        },
        filter: filterForSearchQuery,
      },
      {
        Header: 'Price',
        accessor: 'price',
        minWidth: 150,
        // @ts-ignore
        Cell: (props) => formatNumber(props.value, true, undefined, 2),
        align: 'right',
      },
      {
        Header: 'Liquidity',
        accessor: 'liquidity',
        minWidth: 150,
        // @ts-ignore
        Cell: (props) => formatNumber(props.value, true, false),
        align: 'right',
      },
      {
        Header: 'Volume',
        accessor: 'volume1d',
        minWidth: 150,
        // @ts-ignore
        Cell: (props) => formatNumber(props.value, true, false),
        align: 'right',
      },
      {
        Header: 'Strategy APY',
        accessor: 'strategy.apy',
        minWidth: 150,
        // @ts-ignore
        Cell: (props) => formatPercent(props.value),
      },
    ],
    [chainId]
  )

  return useMemo(
    () => ({
      config: {
        columns,
        data: data ?? [],
        initialState: {
          sortBy: [
            { id: 'liquidity', desc: true },
            { id: 'volume', desc: true },
            { id: 'apy', desc: true },
          ],
        },
        autoResetFilters: false,
      },
      // loading: isValidating,
      // error,
    }),
    [columns, data]
  )
}
