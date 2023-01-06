import React from 'react'
import { useEffect } from "react";
import { shortenAddress } from '../utils/shortenAddress';
import axios from 'axios';

const TransferList = ({
    address,
    chain,
    explorer,
    transfers,
    setTransfers,
}) => {

    useEffect(() => {
        if (address) {
            getTokenTransfers();
        }
        getTokenTransfers()
    }, [address, chain])

    //get wallet transfer history
  async function getTokenTransfers() {
    try {
      const response = await axios.get("https://web-production-e7a4.up.railway.app/tokenTransfers", {
        params: {
          address: address,
          chain: chain,
        }
      })
      if(response.data){
        setTransfers(response.data)
        console.log("response transfer list", response.data)
      }
    } catch(error) {
        console.error("something is wrong", error)
    }
  }
  return (
    <div>
        <div>
            <h1>Transfer History</h1>
            {
              transfers.length > 0 ? ( 
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Token Address</th>
                        <th>Amount</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Date</th>
                        <th>Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        transfers.map((e) => {
                          return(
                            <tr key={e.transaction_hash}>
                              <td>                            
                                {e.name} <h6>{e.symbol}</h6>
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
                              <td><h6>{((Number(e.value) / Number(`1E${e.decimals}`)).toFixed(4)).slice(0,10)}</h6></td>
                              <td>{shortenAddress(e.from_address)}</td>
                              <td>{shortenAddress(e.to_address)}</td>
                              <td>{e.block_timestamp.slice(0, 10)}</td>
                              <td>
                                <a
                                  target={"_blank"}
                                  href={`${explorer}/tx/${e.transaction_hash}`}
                                  rel="noreferrer"
                                >
                                  <div>
                                    View Transaction
                                  </div>
                                </a>
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  No Transfer History Found
                </div>
              )
            }
          </div>
    </div>
  )
}

export default TransferList