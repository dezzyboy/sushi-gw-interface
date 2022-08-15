import { CHAIN_KEY, CurrencyAmount, JSBI, Percent } from '@dezzyboy/jiodex-core-sdk'
import { parseUnits } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import MISO from '@sushiswap/miso/exports/all.json'
import LoadingCircle from 'app/animation/loading-circle.json'
import HeadlessUIModal from 'app/components/Modal/HeadlessUIModal'
import Typography from 'app/components/Typography'
import AuctionCreationSubmittedModalContent from 'app/features/miso/AuctionCreationForm/AuctionCreationSubmittedModalContent'
import { AuctionCreationWizardInputFormatted } from 'app/features/miso/AuctionCreationWizard/index'
import useAuctionCreate from 'app/features/miso/context/hooks/useAuctionCreate'
import useAuctionTemplateMap from 'app/features/miso/context/hooks/useAuctionTemplateMap'
import useTokenTemplateMap from 'app/features/miso/context/hooks/useTokenTemplateMap'
import { AuctionTemplate, TokenSetup } from 'app/features/miso/context/types'
import { getExplorerLink, shortenAddress } from 'app/functions'
import { ApprovalState, useApproveCallback, useContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import Lottie from 'lottie-react'
import { useRouter } from 'next/router'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

interface AuctionCreationWizardReviewModalProps {
  open: boolean
  onDismiss(): void
  data?: AuctionCreationWizardInputFormatted
}

const AuctionCreationWizardReviewModal: FC<AuctionCreationWizardReviewModalProps> = ({
  open,
  onDismiss: _onDismiss,
  data,
}) => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const router = useRouter()
  const [txHash, setTxHash] = useState<string>()
  const [pending, setPending] = useState<boolean>(false)
  const [auctionAddress, setAuctionAddress] = useState<string>()
  const [error, setError] = useState<string>()
  const { templateIdToLabel: tokenTemplateIdToLabel } = useTokenTemplateMap()
  const { templateIdToLabel } = useAuctionTemplateMap()
  const { initWizard, subscribe, unsubscribe } = useAuctionCreate()
  const recipeContract = useContract(
    // @ts-ignore TYPE NEEDS FIXING
    chainId ? MISO[chainId]?.[CHAIN_KEY[chainId]]?.contracts.AuctionCreation.address : undefined,
    // @ts-ignore TYPE NEEDS FIXING
    chainId ? MISO[chainId]?.[CHAIN_KEY[chainId]]?.contracts.AuctionCreation.abi : undefined
  )

  const approveAmount = useMemo(
    () => (data ? data.tokenAmount.add(data.tokenAmount.multiply(new Percent(data.liqPercentage, 10000))) : undefined),
    [data]
  )
  const [approvalState, approve] = useApproveCallback(approveAmount, recipeContract?.address)

  const reset = useCallback(() => {
    if (!pending) {
      setAuctionAddress(undefined)
      setTxHash(undefined)
      setError(undefined)
    }
  }, [pending])

  const onDismiss = useCallback(() => {
    reset()
    _onDismiss()
  }, [_onDismiss, reset])

  const execute = useCallback(
    async (data: AuctionCreationWizardInputFormatted) => {
      if (!data) return

      setPending(true)

      try {
        const tx = await initWizard(data)

        if (tx?.hash) {
          setTxHash(tx.hash)
          await tx.wait()
        }
      } catch (e) {
        console.log(e)
        // @ts-ignore TYPE NEEDS FIXING
        setError(e.error?.message)
      } finally {
        setPending(false)
      }
    },
    [initWizard]
  )

  // Subscribe to creation event to get created token ID
  useEffect(() => {
    // @ts-ignore TYPE NEEDS FIXING
    subscribe('MarketCreated', (owner, address, marketTemplate, { transactionHash }) => {
      if (transactionHash?.toLowerCase() === txHash?.toLowerCase()) {
        setAuctionAddress(address)
        router.push(`/miso/${address}`)
      }
    })

    return () => {
      unsubscribe('MarketCreated', () => console.log('unsubscribed'))
    }
  }, [router, subscribe, txHash, unsubscribe])

  if (!data) return <></>

  const paymentCurrencyLink = !data.paymentCurrency.isNative ? (
    <a
      className="text-purple font-normal text-xs"
      target="_blank"
      rel="noreferrer"
      href={data.paymentCurrency ? getExplorerLink(chainId, data.paymentCurrency.wrapped.address, 'address') : ''}
    >
      {data.paymentCurrency.symbol}
    </a>
  ) : (
    data.paymentCurrency.symbol
  )

  return (
    <HeadlessUIModal.Controlled isOpen={open} onDismiss={onDismiss} afterLeave={() => setTxHash(undefined)}>
      {!txHash ? (
        <HeadlessUIModal.Body className="lg:max-w-lg lg:min-w-lg">
          <HeadlessUIModal.Header
            onClose={onDismiss}
            header={i18n._(t`Create Auction`)}
            subheader={i18n._(t`Please review your entered details thoroughly.`)}
          />
          <HeadlessUIModal.Content>
            <div className="grid grid-cols-2 items-center">
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`Token Type`)}
              </Typography>
              <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                {tokenTemplateIdToLabel(data.tokenType)}
              </Typography>
              {data.tokenSetupType === TokenSetup.CREATE ? (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Token Name`)}
                  </Typography>
                  <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                    {data.tokenName}
                  </Typography>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Token Symbol`)}
                  </Typography>
                  <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                    {data.tokenSymbol}
                  </Typography>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Auction Type`)}
                  </Typography>
                  <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                    {templateIdToLabel(data.auctionType)}
                  </Typography>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Total Supply`)}
                  </Typography>
                  <Typography
                    weight={700}
                    variant="sm"
                    className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
                  >
                    {data.tokenSupply?.toSignificant(6)} {data.tokenSupply?.currency.symbol}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Token Address`)}
                  </Typography>
                  <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                    {data.tokenAddress && shortenAddress(data.tokenAddress)}
                  </Typography>
                </>
              )}
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`Tokens for sale`)}
              </Typography>
              <Typography
                weight={700}
                variant="sm"
                className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
              >
                {data.tokenAmount.toSignificant(6)} {data.tokenAmount.currency.symbol}
              </Typography>
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`Liquidity percentage`)}
              </Typography>
              <Typography
                weight={700}
                variant="sm"
                className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
              >
                {data.liqPercentage / 100}%
              </Typography>
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`Liquidity lockup`)}
              </Typography>
              <Typography
                weight={700}
                variant="sm"
                className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
              >
                {Number(data.liqLockTime) / (24 * 60 * 60)} days
              </Typography>

              {data.auctionType === AuctionTemplate.DUTCH_AUCTION && (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Starting Price`)}
                  </Typography>
                  <Typography
                    weight={700}
                    variant="sm"
                    className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
                  >
                    {data.startPrice
                      ?.quote(
                        CurrencyAmount.fromRawAmount(
                          data.auctionToken,
                          JSBI.BigInt(parseUnits('1', data.auctionToken.decimals))
                        )
                      )
                      .toSignificant(6)}{' '}
                    {paymentCurrencyLink}
                  </Typography>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Ending Price`)}
                  </Typography>
                  <Typography
                    weight={700}
                    variant="sm"
                    className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
                  >
                    {data.endPrice
                      ?.quote(
                        CurrencyAmount.fromRawAmount(
                          data.auctionToken,
                          JSBI.BigInt(parseUnits('1', data.auctionToken.decimals))
                        )
                      )
                      .toSignificant(6)}{' '}
                    {paymentCurrencyLink}
                  </Typography>
                </>
              )}
              {data.auctionType === AuctionTemplate.BATCH_AUCTION && (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Minimum Raised`)}
                  </Typography>
                  <Typography
                    weight={700}
                    variant="sm"
                    className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
                  >
                    {data.minimumRaised?.toSignificant(6)} {paymentCurrencyLink}
                  </Typography>
                </>
              )}
              {data.auctionType === AuctionTemplate.CROWDSALE && (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Fixed Price`)}
                  </Typography>
                  <Typography
                    weight={700}
                    variant="sm"
                    className="flex items-end gap-1.5 text-high-emphesis py-2 border-b border-dark-700"
                  >
                    {data.fixedPrice
                      ?.quote(
                        CurrencyAmount.fromRawAmount(
                          data.auctionToken,
                          JSBI.BigInt(parseUnits('1', data.auctionToken.decimals))
                        )
                      )
                      .toSignificant(6)}{' '}
                    {paymentCurrencyLink}
                  </Typography>
                </>
              )}
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`Start Date`)}
              </Typography>
              <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                {data.startDate.toLocaleString('en-uS', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  timeZone: 'UTC',
                })}{' '}
                UTC
              </Typography>
              <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                {i18n._(t`End Date`)}
              </Typography>
              <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                {data.endDate.toLocaleString('en-uS', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  timeZone: 'UTC',
                })}{' '}
                UTC
              </Typography>
              {data.whitelistEnabled && (
                <>
                  <Typography variant="sm" className="text-secondary py-2 border-b border-dark-700">
                    {i18n._(t`Whitelisted Addresses`)}
                  </Typography>
                  <Typography weight={700} variant="sm" className="text-high-emphesis py-2 border-b border-dark-700">
                    {data.accounts.length}
                  </Typography>
                </>
              )}
            </div>
          </HeadlessUIModal.Content>
          <HeadlessUIModal.Actions>
            <HeadlessUIModal.Action onClick={onDismiss}>{i18n._(t`Cancel`)}</HeadlessUIModal.Action>
            {approvalState !== ApprovalState.APPROVED && data.tokenSetupType === TokenSetup.PROVIDE && (
              <HeadlessUIModal.Action
                main={true}
                disabled={approvalState === ApprovalState.PENDING || pending}
                {...((approvalState === ApprovalState.PENDING || pending) && {
                  startIcon: (
                    <div className="w-4 h-4 mr-1">
                      <Lottie animationData={LoadingCircle} autoplay loop />
                    </div>
                  ),
                })}
                onClick={approve}
              >
                {i18n._(t`Approve`)}
              </HeadlessUIModal.Action>
            )}
            <HeadlessUIModal.Action
              main={true}
              disabled={
                (data.tokenSetupType === TokenSetup.PROVIDE && approvalState !== ApprovalState.APPROVED) || pending
              }
              {...(pending && {
                startIcon: (
                  <div className="w-4 h-4 mr-1">
                    <Lottie animationData={LoadingCircle} autoplay loop />
                  </div>
                ),
              })}
              onClick={() => execute(data)}
            >
              {i18n._(t`Create Auction`)}
            </HeadlessUIModal.Action>
          </HeadlessUIModal.Actions>
          <HeadlessUIModal.Error>{error}</HeadlessUIModal.Error>
        </HeadlessUIModal.Body>
      ) : (
        <AuctionCreationSubmittedModalContent txHash={txHash} auctionAddress={auctionAddress} onDismiss={onDismiss} />
      )}
    </HeadlessUIModal.Controlled>
  )
}

export default AuctionCreationWizardReviewModal
