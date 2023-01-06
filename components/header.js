import React from "react";
import { useEffect } from "react";
import { shortenAddress } from "../utils/shortenAddress";
import {
  useDisconnect,
  useNetworkMismatch,
  useMetamask,
  useNetwork,
  useAddress,
  useBalance,
  ChainId,
} from "@thirdweb-dev/react";

const Header =({
    address,
    chain,
    setChain,
    explorer,
    setExplorer,
    setCurrency,
    setNativeContractThird,
}) => {
    const disconnect = useDisconnect();
    const isMismatched = useNetworkMismatch(); // switch to desired chain
    const [, switchNetwork] = useNetwork();
    console.log("chain", chain);
    
    useEffect(() => {
        networkCheck();
    }, [address, chain]);

     // network check
    async function networkCheck() {
        if(chain == "0x1" && chain == "0x38" && chain == "0x89") {
            if(chain == "0x1") {
                switchNetwork(ChainId.Mainnet)
                setExplorer(process.env.NEXT_PUBLIC_EXPLORER_ETH)
                setCurrency("ETH")
                const nativeContractThird = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // mainnet weth
                setNativeContractThird(nativeContractThird)
            } else if(chain == "0x38") {
                switchNetwork(ChainId.BinanceSmartChainMainnet)
                setExplorer(process.env.NEXT_PUBLIC_EXPLORER_BSC)
                setCurrency("BNB")
                const nativeContractThird = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // mainnet wbnb
                setNativeContractThird(nativeContractThird)
            } else if(chain == "0x89") {
                switchNetwork(ChainId.Polygon)
                setExplorer(process.env.NEXT_PUBLIC_EXPLORER_POLYGON)
                setCurrency("MATIC")
                const nativeContractThird = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" // mainnet wmatic
                setNativeContractThird(nativeContractThird)
            }
        } else {
            switchNetwork(ChainId.Mainnet)
        }
    }

    const handleNetworkChange = event => {
        setChain(event.target.value)
    }
    console.log("this is the connected chain ", chain)

    return(
        <div>
            <div>
            <label>Switch Network Header</label>
                <select
                value={chain}
                onChange={handleNetworkChange}
                >
                    <option value="0x1">ETH</option>
                    <option value="0x38">BSC</option>
                    <option value="0x89">POLYGON</option>
                </select>
            </div>
        </div>
    )
}

export default Header;