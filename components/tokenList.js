import React from 'react'
import { useEffect } from "react";
import { shortenAddress } from '../utils/shortenAddress';
import axios from 'axios';

const { default: Moralis } = require("moralis");

const TokenList = ({
    address,
    chain,
    setNativeBalance,
    setNativePrice,
    nativeBalance,
    nativePrice,
    totalValue,
    setTotalValue,
    nativeSymbolThird,
    walletTokenBalance,
    setWalletTokenBalance,
    explorer,
    transfers,
}) => {
    useEffect(() => {
        if (address) {
            getNativeBalance();
            getTokenBalances()
        }
        getNativeBalance() 
        getTokenBalances()
    }, [address, chain, setNativeBalance, setNativePrice, nativeBalance, nativePrice])

 // get portfolio value
  useEffect(() => {
    let val = 0;
    for (let i = 0; i < walletTokenBalance.length; i++) {
      val = val + Number(walletTokenBalance[i].usd);
    }
    val = val + Number(nativePrice);
    setTotalValue(val.toFixed(2));
  }, [nativePrice, walletTokenBalance]);

  // get native token and value
  async function getNativeBalance() {

    const response = await axios.get("https://web-production-e7a4.up.railway.app/nativeBalance", {
      params: {
        address: address,
        chain: chain,
      }
    })
    // console.log("response", response)
    if (response.data.balance && response.data.usd) {
      setNativeBalance((Number(response.data.balance) / 10 ** 18).toFixed(4))
      setNativePrice(
        (
          (Number(response.data.balance) / 10 ** 18) * Number(response.data.usd)
        ).toFixed(2)
      )
    }
  }

  // get wallet tokens and value
  async function getTokenBalances() {
      console.log("chain id", chain)
      if(chain == "0x1") {
        console.log("chain id inside token balance mainnet", chain)
      } else if(chain == "0x38") {
        console.log("chain id inside token balance BSC mainnet", chain)
      }

      const response = await axios.get("https://web-production-e7a4.up.railway.app/tokenBalance", {
        params: {
          address: address,
          chain: chain,
        }
      })

      if (response.data) {
        let t = response.data;

        for (let i = 0; i < t.length; i++) {
          t[i].bal = (
            Number(t[i].balance) / Number(`1E${t[i].decimals}`)
          ).toFixed(4);
          t[i].usd = (t[i].bal * Number(t[i].usd)).toFixed(2);
          t[i].address = t[i].token_address;
        }
        setWalletTokenBalance(t);
        console.log("response",t)
      }
  }


  return (
    <div>
       <div>
        <h1>Token List</h1>
        <div>
          <p>
            <span>Total Balance: ${totalValue}</span>
          </p>
          <div>
            Native token
            {
              nativeBalance === "0.0000" && nativeValue === "0.0000" ? (
                <span>
                  No ETH or BNB balance found. Please input a wallet and chain.
                </span>
              ): (
               <>
                {nativeBalance}{nativeSymbolThird} {""} ${nativePrice}
               </>
            )}
          </div>
          <div>
            list of tokens
            {
              walletTokenBalance.length > 0 ? ( 
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contract Address</th>
                        <th>Balance</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        walletTokenBalance.map((e) => {
                          return(
                            <tr key={e.symbol}>
                              <td>
                                {e.thumbnail != 0 ? (
                                  <>
                                  {e.thumbnail && (<img src={e.thumbnail} alt="logo" width="20" heigth="20"></img>) }{e.name} <h6>{e.symbol}</h6>
                                  </>
                                ) : (
                                  <>
                                  {e.name} <h6>{e.symbol}</h6>
                                  </>
                                )}
                              </td>
                              <td> 
                                <a
                                  target={"_blank"}
                                  href={`${explorer}/address/${e.address}`}
                                  rel="noreferrer"
                                >
                                  <div>
                                    {shortenAddress(e.address)}
                                  </div>
                                </a>
                              </td>
                              <td><h6>{e.bal}{e.symbol}</h6></td>
                              <td>${e.usd}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  No Token Found
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenList