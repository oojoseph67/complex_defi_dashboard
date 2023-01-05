import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import transferABI from "../transfer/transferAbi.json";
import defaultABI from "../transfer/defaultAbi.json";
import {
  useContract,
  useMetamask,
  useAddress,
  useTransferToken,
  useBalance,
} from "@thirdweb-dev/react";

import Loading from "../components/loading"
import Login from "../components/login";
import { shortenAddress } from "../utils/shortenAddress"

const { default: Moralis } = require("moralis");

// export default function Home() {
//   return (
//     <div>
//       <h1>Juice WRLD</h1>
//     </div>
//   );
// }

const IndexPage = ({ marketData }) => {
  const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY

  const [chain, setChain] = useState("0x1");
  const [nativeBalance, setNativeBalance] = useState(0)
  const [nativePrice, setNativePrice] = useState(0)
  const [walletTokenBalance, setWalletTokenBalance] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [transfers, setTransfers] = useState([])
  const [transferContractAddress, setTransferContractAddress] = useState("");
  const [explorer, setExplorer] = useState("")
  const [currency, setCurrency] = useState("")
  const [newBalance, setNewBalance] = useState();
  const [newSymbol, setNewSymbol] = useState();
  const [newName, setNewName] = useState();
  const [newDecimals, setNewDecimals] = useState();
  const [newThumbnail, setNewThumbnail] = useState()
  const [amount, setAmount] = useState("")

  const [showERC, setShowERC] = useState(false);
  const [ercLoading, setERCLoading] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [ercTokenAddress, setERCTokenAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("")

  const { data: transferContract } = useContract(
    ercTokenAddress, 
    defaultABI
  )
  const address = useAddress();
  console.log("Address", address)

  const [ercContract, setERCContract] = useState("")
  // const [transferContract, setTransferContract] = useState("")
  const [customTokenDetails,setCustomTokenDetails] = useState("")
  const [message, setMessage] = useState("");
  const [messageError, setError] = useState("")
  const [showRecentTx, setShowRecentTx] = useState(false);
  const [recentTx, setRecentTx] = useState({
    txhash: "",
    from: "",
    to: "",
    amount: "",
    symbol: "",
  });
  
  const nativeToken = useBalance();
  const nativeBalanceThird = nativeToken.data?.displayValue;
  const nativeSymbolThird = nativeToken.data?.symbol;
  const nativeNameThird = nativeToken.data?.name;
  const nativeDecimalsThird = nativeToken.data?.decimals;
  const [nativeContractThird, setNativeContractThird] = useState("")

  console.info("nativeToken", nativeToken);
  // console.log("marketData", marketData)
  // console.log("address", address) 
  console.log("program", transferContract)
  console.log("wallet token balance", walletTokenBalance)
  console.log("newBalance",newBalance)
  console.log("newSymbol",newSymbol)
  console.log("newName",newName)
  console.log("newDecimals",newDecimals)
  console.log("newThumbnail",newThumbnail)

  console.log("recipientAddress", recipientAddress)
  // console.log("nativePrice", nativePrice)
  // console.log("nativeBalance", nativeBalance)
  // console.log("total value", totalValue)
  // console.log("transfers", transfers)
  // const [provider, setProvider] = useState({})

  // useEffect(() => {
  //   if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     // setProvider(provider);
  //     const signer = provider.getSigner(); 
  //     const ercABI = [
  //       "function balanceOf(address) view returns (uint256)",
  //       "function transfer(address to, uint256) returns (bool)",
  //       "function symbol() external view returns (string memory)",
  //       "function name() external view returns (string memory)",
  //       "function decimals() external view returns (uint8)",
  //     ];

  //     const ercContract = new ethers.Contract(ercTokenAddress, ercABI, signer);
  //     const transferContract = new ethers.Contract(
  //       transferContractAddress,
  //       transferABI,
  //       signer
  //     );
  //     setERCContract(ercContract)
  //     setTransferContract(transferContract)
  //   }
  // }, []);


  useEffect(() => {
    if (address) {
      getTokenBalances()
      getNativeBalance()
      getTokenTransfers()
      networkCheck()
    }
  }, [address])

  // transfer contract
  const {
    mutate: transferTokens,
    isLoading,
    error,
  } = useTransferToken(transferContract)

  if (error) {
    console.error("failed to transfer tokens", error);
  }

  const transferAmount = async () => {
    const transferDetails = await transferTokens({ to: recipientAddress, amount: amount })
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


  // network check
  async function networkCheck() {
    if (chain == "0x1") {
      setTransferContractAddress(process.env.NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS_GOERLI)
      setExplorer(process.env.NEXT_PUBLIC_EXPLORER_ETH)
      setCurrency("ETH")
      const nativeContractThird = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // mainnet weth
      setNativeContractThird(nativeContractThird)
    } else if(chain == "0x5") {
      setTransferContractAddress(process.env.NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS_GOERLI)
      setExplorer(process.env.NEXT_PUBLIC_EXPLORER_GOERLI)
      setCurrency("ETH")
    } else if(chain == "0x38") {
      const nativeContractThird = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // mainnet wbnb
      setNativeContractThird(nativeContractThird)
    }
  }

  // get wallet tokens and value
  async function getTokenBalances() {
    try {
      await Moralis.start({ apiKey: apiKey })

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
      }
    }catch(error) {
      console.log(error);
    }
  }

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

  // get portfolio value
  useEffect(() => {
    let val = 0;
    for (let i = 0; i < walletTokenBalance.length; i++) {
      val = val + Number(walletTokenBalance[i].usd);
    }
    val = val + Number(nativePrice);
    setTotalValue(val.toFixed(2));
  }, [nativePrice, walletTokenBalance]);

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
      }
    } catch(error) {
        console.error("something is wrong", error)
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
        } else {
          setNewBalance(nativeBalanceThird)
          setNewSymbol(nativeSymbolThird)
          setNewName(nativeNameThird)
          setNewDecimals(nativeDecimalsThird)
        }
      }
      setTokenChanged(true);
      setERCLoading(false);
    } catch (error) {
      console.error("error", error);
      setERCLoading(false);
    }
  }

  const handleBalanceNumber = event => {
    // const limit = newBalance.length
    if(event.target.value > newBalance){
      setAmount(newBalance)
    } else {
      setAmount(event.target.value)
    }
  }

  // if(isLoading) return <Loading></Loading>
  if(!address) return <Login></Login>

  return(
    <div>
      <h1>
       Dashboard
      </h1>

      <div>
        Market Summary
        {/* <div>
        {
          marketData.length > 0 ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>24h High</th>
                    <th>24 Low</th>
                    <th>Market Cap</th>
                    <th>Market Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((e) => {
                    return (
                      <tr key={e.market_cap_rank}>
                        <td>{e.market_cap_rank}</td>
                        <td>{e.image && (<img src={e.image} alt="logo" width="20" heigth="20"></img>)} {e.name} <h6>{e.symbol}</h6></td>
                        <td>$ {e.current_price}</td>
                        <td>$ {e.high_24h}</td>
                        <td>$ {e.low_24h}</td>
                        <td>$ {e.market_cap}</td>
                        <td></td>
                      </tr>
                    )
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <h5>
                Nothing to see here
              </h5>
            </div>
          )
        }
        </div> */}
      </div>

      <div>
        Token List
        {/* <div>
          <p>
            <span>Total Balance: ${totalValue}</span>
          </p>
          <div>
            native token
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
            token List
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
          <div>
            transfer history
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
                            <tr key={e.symbol}>
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
        </div> */}
      </div>

      <div>
        Simple Transfer 
        <div>
          {/* token select */}
          <div>
            <select  
              value={ercTokenAddress}
              onChange={handleChange}
            >
            <option value="">Select Address</option>
            <option value={nativeContractThird}>{nativeNameThird} <h6>{nativeSymbolThird}</h6></option>
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
                          {e.name} <h6>{e.symbol}</h6>
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
              <p>{messageError}</p>
              <p>{message}</p>
            </div>
          </div>

          
        </div>
      </div>

      <div>
        Simple Swap
        <div>
          
        </div>
      </div>

    </div>
  )
}

export const getServerSideProps = async() => {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')

  const marketData = await res.json()

  // const options = {
  //   method: 'GET', 
  //   headers: {
  //     accept: 'application/json', 
  //     'X-API-KEY': 
  //     'cqHhtltaU6GF4MVFpkTdAm2aibChMQNyVhKLrprbx5qDJvHGV51f3LxDSvhII4AE'
  //   }
  // };

  // const res2 = await fetch('https://deep-index.moralis.io/api/v2/0x348Df9bd14475C780A78BF48492B9A29a2032B96/balance?chain=eth', options)
  // const data = await res2.json()


  return {
    props: {
      marketData,
      // data,
    }
  }
}

export default IndexPage;
