import React from 'react'
import { useEffect } from "react";
import { shortenAddress } from '../utils/shortenAddress';
import axios from 'axios';
import { ethers } from "ethers";

const Swap = ({
    address,
    currency,
    nativeBalance,
    nativeBalanceThird,
    nativeNameThird,
    nativeSymbolThird,
    nativePrice,
    fromToken,
    setFromToken,
    walletTokenBalance,
    value,
    setValue,
    newBalanceSwap,
    toToken,
    setToToken,
    valueExchanged,
    setValueExchanged,
    valueExchangedDecimals,
    setValueExchangedDecimals,
    swapMessage,
    setSwapMessage,
    sendTransaction,
    swapTransactionIsLoading,
    swapTransactionData,
    isSuccess,
    setERCLoading,
    setNewBalanceSwap,
    setSwapBalance,
    swapBalance,
    setNewDecimalsSwap,
    setNewNameSwap,
    setNewSymbolSwap
}) => {

    
  // to handle the swap function 
  const handleChangeTransferFromToken = event => {
        console.log('token swap from', event.target.selectedOptions[0].label)
        console.log("address contract swap from", event.target.value)
        setFromToken(event.target.value)
        setValueExchanged("")
        setERCLoading(true);
        try {
            for(let i = 0; i < walletTokenBalance.length; i++) {
                if (walletTokenBalance[i].address == event.target.value) {
                    const ercBalance = walletTokenBalance[i].bal
                    const ercSymbol = walletTokenBalance[i].symbol
                    const ercName = walletTokenBalance[i].name
                    const ercDecimals = walletTokenBalance[i].decimals
                    const ercThumbnail = walletTokenBalance[i].thumbnail

                    // const balance = walletTokenBalance[i].balance
                    // const balanceWITH = ethers.utils.formatEther(balance)

                    const test123 = ethers.utils.parseEther(ercBalance)

                    let string = ercBalance
                    let substring = "0.0"
                    console.log("checking something", string.includes(substring));

                    // if (string.includes(substring)) {
                    //   setNewBalanceSwap(balanceWITH);
                    //   setNewSymbolSwap(ercSymbol)
                    //   setNewNameSwap(ercName)
                    //   setNewDecimalsSwap(ercDecimals)
                    // } else {
                    //   setNewBalanceSwap(ercBalance);
                    //   setNewSymbolSwap(ercSymbol)
                    //   setNewNameSwap(ercName)
                    //   setNewDecimalsSwap(ercDecimals)
                    // }

                    setNewBalanceSwap(ercBalance);
                    setSwapBalance(test123.toString())
                    setNewSymbolSwap(ercSymbol)
                    setNewNameSwap(ercName)
                    setNewDecimalsSwap(ercDecimals)

                    console.log("newStuff transfer from", test123, ercBalance, ercSymbol, ercName, ercDecimals, ercThumbnail);      
                    console.log("newStuff2",test123.toString())    
                }
            }
            setERCLoading(false);
            } catch (error) {
            console.error("error", error);
            setERCLoading(false);
            }
  }

  const handleBalanceNumberFromToken = event => {
    // const limit = newBalance.length
    if(event.target.value > newBalanceSwap){
      setValue(newBalanceSwap)
    } else {
      setValue(event.target.value)
    }
  }

  const handleChangeTransferToToken = event => {
    setERCLoading(true);
    console.log('token swap to', event.target.selectedOptions[0].label)
    console.log("address contract swap to", event.target.value)
    setToToken(event.target.value)
    setValueExchanged("")
  }

  async function get1inchSwap() {
    try {
      const tx = await axios.get(`
        https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${swapBalance}&fromAddress=${address}&slippage=5
      `)
      console.log("swap data", tx.data)
      setTo(tx.data.tx.to) 
      setTxData(tx.data.tx.data);
      setValueExchangedDecimals(Number(`1E${tx.data.toToken.decimals}`))
      setValueExchanged(tx.data.toTokenAmount)
    } catch(error) {
      console.error("swap error", error)
      console.log("swap error", error.response.data.description)

      let string = error.response.data.description
      let substringLiquidity = "liquidity"
      let substringEstimate = "estimate"
      let substringEnough = "enough"
      let substringEquals = "equals"
      let substringMiner = "miner"
      let substringBalance = "balance"
      let substringAllowance = "allowance"

      if(string.toLowerCase().includes(substringLiquidity.toLowerCase())) {
        console.log("insufficient liquidity in the token you want to swap to")
        setSwapMessage("insufficient liquidity in the token you want to swap to")
      } else if(string.toLowerCase().includes(substringEstimate.toLowerCase())) {
        console.log("cannot estimate")
        setSwapMessage("cannot estimate")
      } else if(string.toLowerCase().includes(substringEnough.toLowerCase())) {
        console.log("you may not have enough ETH balance for gas fee")
        setSwapMessage("you may not have enough ETH balance for gas fee")
      } else if(string.toLowerCase().includes(substringEquals.toLowerCase())) {
        console.log("you are about to swap a token against itself, it can't work")
        setSwapMessage("you are about to swap a token against itself, it can't work")
      } else if(string.toLowerCase().includes(substringMiner.toLowerCase())) { 
        console.log("cannot estimate. don't forget about miner fee")
        setSwapMessage("cannot estimate. don't forget about miner fee")
      } else if(string.toLowerCase().includes(substringBalance.toLowerCase())) {
        console.log("not enough balance")
        setSwapMessage("not enough balance")
      } else if(string.toLowerCase().includes(substringAllowance.toLowerCase())) {
        console.log("not enough allowance")
        setSwapMessage("not enough allowance")
      }
    }
    setNewBalance("")          
    setSwapBalance("")
    setNewSymbol("")
    setNewName("")
    setNewDecimals("")
  }

  return (
    <div>
        <h1>Swap</h1>
         <div>
            <div>
                <div>User: {address}</div>
                <div>Your {currency} Balance {nativeBalance}{nativeSymbolThird} {""} ${nativePrice}</div>
                <select  
                    value={fromToken}
                    onChange={handleChangeTransferFromToken}
                >
                <option value="">Select Token</option>
                {/* <option value={nativeBalanceThird}>{nativeNameThird} <h6>{nativeSymbolThird}</h6></option> */}
                {
                    walletTokenBalance.map((e) => {
                    return (
                            <option
                                value={e.address}
                                key={e.symbol}
                                >
                                <>
                                    {e.name} <h6>{e.symbol}</h6>
                                </>
                            </option>
                        )
                    })
                }
                </select>
                <input
                    onChange={handleBalanceNumberFromToken}
                    value={value}
                    type="number"
                    min={0}
                    max={newBalanceSwap}
                    placeholder={newBalanceSwap}
                />
                <br/>
                <br/>
                <br/>            
                <select
                    name="toToken"
                    value={toToken}
                    onChange={handleChangeTransferToToken}
                >
                    <option value="">Select Token</option>
                    <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
                    <option value="0xB8c77482e45F1F44dE1745F52C74426C631bDD52">WBNB</option>
                    {
                    walletTokenBalance.map((e) => {
                        return (
                        <option
                            value={e.address}
                            key={e.symbol}
                        >
                            <>
                            {e.name}
                            </>
                        </option>
                        )
                    })
                    }
                </select>
                <input
                value={
                    !valueExchanged 
                    ? ""
                    : (valueExchanged / valueExchangedDecimals).toFixed(5)
                }
                disabled={true}
                />
                <br/>
                <br/>
                <br/>
                <button onClick={get1inchSwap}>Get Conversion</button>
                <button
                disabled={!valueExchanged}
                onClick={sendTransaction}
                >Swap Tokens</button>
                {swapTransactionIsLoading && <div>Loading</div>}
                {isSuccess && <div>View Transaction:
                <a
                    target={"_blank"}
                    href={`${explorer}/tx/${JSON.stringify(swapTransactionData.hash)}`}
                    rel="noreferrer"
                >
                    View Transaction
                </a>
                {JSON.stringify(swapTransactionData.hash)}
                
                </div>}
                <br/>
                <br/>

            </div>

            <div>
            <p><b>{swapMessage}</b></p>
            </div>
        </div>
    </div>
  )
}

export default Swap