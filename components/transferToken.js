import React from 'react'
import { useEffect } from "react";
import { shortenAddress } from '../utils/shortenAddress';
import axios from 'axios';

const TransferToken = ({
    ercTokenAddress,
    walletTokenBalance,
    setRecipientAddress,
    recipientAddress,
    newBalance,
    isLoading,
    message,
    amount,
    setAmount,
    setERCLoading,
    setERCTokenAddress,
    setNewBalance,
    setNewSymbol,
    setNewName,
    setNewDecimals,
    setNewThumbnail,
    transferTokens,
    setRecentTx,
    setShowRecentTx,
    setMessage,
    nativeContractThird,
    nativeNameThird,
    nativeSymbolThird,
    txLoading,
}) => {

    const handleBalanceNumber = event => {
        // const limit = newBalance.length
        if(event.target.value > newBalance){
            setAmount(newBalance)
        } else {
            setAmount(event.target.value)
        }
    }

    // to handle token picked for transfer
  const handleChange = evemt => {
    console.log('tokenAddress', event.target.selectedOptions[0].label)
    console.log("address contract ee", event.target.value)
    setERCTokenAddress(event.target.value)
    setERCLoading(true);
    try {
      for(let i = 0; i < walletTokenBalance.length; i++) {
        if (walletTokenBalance[i].address == event.target.value) {
          const ercBalance = walletTokenBalance[i].bal
          const ercSymbol = walletTokenBalance[i].symbol
          const ercName = walletTokenBalance[i].name
          const ercDecimals = walletTokenBalance[i].decimals
          const ercThumbnail = walletTokenBalance[i].thumbnail

          setNewBalance(ercBalance);
          setNewSymbol(ercSymbol)
          setNewName(ercName)
          setNewDecimals(ercDecimals)
          setNewThumbnail(ercThumbnail)

          console.log("newStuff", ercBalance, ercSymbol, ercName, ercDecimals, ercThumbnail);          
        }
      }
      setERCLoading(false);
    } catch (error) {
      console.error("error", error);
      setERCLoading(false);
    }
  }

  const transferAmount = async () => {
    const transferDetails = await transferTokens({ to: recipientAddress, amount: amount })
    await transferDetails.wait()
    setRecentTx({
      txhash: transferDetails.hash,
      from: address,
      to: recipientAddress,
      amount: amount,
      symbol: newSymbol,
    });
    setShowRecentTx(true)
    console.log("transfer details", transferDetails)
    console.log(
      `${amount} ${newSymbol} token successfully sent to ${recipientAddress}`
    );
    setMessage(
      `${amount} ${newSymbol} token successfully sent to ${recipientAddress}`
    );
    setAmount("")
    setRecipientAddress("")
  }

  return (
    <div>
        <h1>TransferToken</h1>
        <div>
          {/* token select */}
          <div>
            <select  
              value={ercTokenAddress}
              onChange={handleChange}
            >
            <option value="">Select Address</option>
            <option value={nativeContractThird}>{nativeNameThird} {nativeSymbolThird}</option>
            {
              walletTokenBalance.map((e) => {
                return (
                  <option
                    value={e.address}
                    key={e.symbol}
                  >
                    {/* {e.thumbnail != 0 ? (
                      <>
                        {e.thumbnail && (<img src={e.thumbnail} alt="logo" width="20" heigth="20"></img>) }{e.name} <h6>{e.symbol}</h6>
                      </>
                      ) : ( */}
                        <>
                          {e.name} {e.symbol}
                        </>
                    {/* )} */}
                  </option>
                )
              })
            }
            </select>
          </div>
          <div>
            <div>
            {/* transfer */}
            <input
              onChange={(e) => setRecipientAddress(e.target.value)}
              value={recipientAddress}
              placeholder="Transfer To"
            />
            <input
              onChange={handleBalanceNumber}
              value={amount}
              type={"number"}
              min={0}
              max={newBalance}
              placeholder={newBalance}
            />
            {
                txLoading ? (
                  <div>
                    Loading....
                  </div>
                ) : (
                  <button
                    disabled={isLoading}
                    // onClick={() => transferTokens({ to: recipientAddress, amount: amount })}
                    onClick={transferAmount}
                  >
                    Transfer
                  </button>
                )
              }
            </div>
            <div

            >

            </div>
            <div>
              <p>{message}</p>
            </div>
          </div>

          
        </div>
    </div>
  )
}

export default TransferToken