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
  useDisconnect,
  useNetwork,
  useNetworkMismatch,
  ChainId,
} from "@thirdweb-dev/react";

import Loading from "../components/loading"
import Login from "../components/login";
import Header from "../components/header"
import TokenList from "../components/tokenList"
import TransferList from "../components/transferList";
import TransferToken from "../components/transferToken";
import Swap from "../components/swap"
import { shortenAddress } from "../utils/shortenAddress"
import { useSendTransaction } from 'wagmi'
import { usePrepareSendTransaction } from 'wagmi'


const { default: Moralis } = require("moralis");

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
  const disconnect = useDisconnect()
  const [, switchNetwork] = useNetwork()
  console.log("Address", address)

  const [ercContract, setERCContract] = useState("")
  const [customTokenDetails,setCustomTokenDetails] = useState("")
  const [message, setMessage] = useState("")
  const [showRecentTx, setShowRecentTx] = useState(false);
  const [recentTx, setRecentTx] = useState({
    txhash: "",
    from: "",
    to: "",
    amount: "",
    symbol: "",
  });

  const [swapMessage, setSwapMessage] = useState("")
  const [fromToken, setFromToken] = useState("")
  const [toToken, setToToken] = useState("")
  const [value, setValue] = useState("")
  const [valueExchanged, setValueExchanged] = useState("")
  const [valueExchangedDecimals, setValueExchangedDecimals] = useState("")
  const [to, setTo] = useState("") // the 1inch aggregator
  const [txData, setTxData] = useState("")

  const [newBalanceSwap, setNewBalanceSwap] = useState();
  const [newSymbolSwap, setNewSymbolSwap] = useState();
  const [newNameSwap, setNewNameSwap] = useState();
  const [newDecimalsSwap, setNewDecimalsSwap] = useState();
  const [swapBalance, setSwapBalance] = useState("")

  console.log("this is swap balance", swapBalance)

  const { config } = usePrepareSendTransaction({
     request: {
      from: address,
      to: String(to),
      data: String(txData),
      value: String(swapBalance),
    },
  })

  const { swapTransactionData, swapTransactionIsLoading, isSuccess, sendTransaction } = useSendTransaction(config)

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

  console.log("swap error message: ", swapMessage)
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

  // transfer contract
  const {
    mutate: transferTokens,
    isLoading,
    error,
  } = useTransferToken(transferContract)

  if (error) {
    console.error("failed to transfer tokens", error);
  }

  // if(isLoading) return <Loading></Loading>
  if(!address) return <Login></Login>

  return(
    <div>
      <Header
        address={address}
        chain={chain}
        setChain={setChain}
        explorer={explorer}
        setExplorer={setExplorer}
        setCurrency={setCurrency}
        setNativeContractThird={setNativeContractThird}
      ></Header>
      <h1>
       Dashboard
      </h1>

      <div>
        <h1>Market Summary</h1>
        <div>
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
        </div>
      </div>

      <TokenList
        address={address}
        chain={chain}
        setNativeBalance={setNativeBalance}
        setNativePrice={setNativePrice}
        nativeBalance={nativeBalance}
        nativePrice={nativePrice}
        nativeSymbolThird={nativeSymbolThird}
        totalValue={totalValue}
        setTotalValue={setTotalValue}
        walletTokenBalance={walletTokenBalance}
        setWalletTokenBalance={setWalletTokenBalance}     
      ></TokenList>

      <TransferList
        address={address}
        chain={chain}
        explorer={explorer}
        transfers={transfers}   
        setTransfers={setTransfers}
      ></TransferList>

      <TransferToken
        ercTokenAddress={ercTokenAddress}
        walletTokenBalance={walletTokenBalance}
        setRecipientAddress={setRecipientAddress}
        recipientAddress={recipientAddress}
        newBalance={newBalance}
        isLoading={isLoading}
        message={message}
        amount={amount}
        setAmount={setAmount}
        setERCLoading={setERCLoading}
        setERCTokenAddress={setERCTokenAddress}
        setNewBalance={setNewBalance}
        setNewName={setNewName}
        setNewDecimals={setNewDecimals}
        setNewSymbol={setNewSymbol}
        setNewThumbnail={setNewDecimals}
        transferTokens={transferTokens}
        setRecentTx={setRecentTx}
        setShowRecentTx={setShowRecentTx}
        setMessage={setMessage}
        nativeContractThird={nativeContractThird}
        nativeNameThird={nativeNameThird}
        nativeSymbolThird={nativeSymbolThird}
        txLoading={txLoading}
      ></TransferToken>

      <Swap
        address={address}
        currency={currency}
        nativeBalance={nativeBalance}
        nativeBalanceThird={nativeBalanceThird}
        nativeNameThird={nativeNameThird}
        nativeSymbolThird={nativeSymbolThird}
        nativePrice={nativePrice}
        fromToken={fromToken}
        setFromToken={setFromToken}
        walletTokenBalance={walletTokenBalance}
        value={value}
        setValue={setValue}
        newBalanceSwap={newBalanceSwap}
        toToken={toToken}
        setToToken={setToToken}
        valueExchanged={valueExchanged}
        setValueExchanged={setValueExchanged}
        valueExchangedDecimals={valueExchangedDecimals}
        setValueExchangedDecimals={setValueExchangedDecimals}
        swapMessage={swapMessage}
        setSwapMessage={setSwapMessage}
        sendTransaction={sendTransaction}
        swapTransactionIsLoading={swapTransactionIsLoading}
        swapTransactionData={swapTransactionData}
        isSuccess={isSuccess}
        setERCLoading={setERCLoading}
        setNewBalanceSwap={setNewBalanceSwap}
        setSwapBalance={setSwapBalance}
        swapBalance={swapBalance}
        setNewDecimalsSwap={setNewDecimalsSwap}
        setNewNameSwap={setNewNameSwap}
        setNewSymbolSwap={setNewSymbolSwap}
      ></Swap>

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
