import styles from "../styles/Home.module.css";
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export const MintNFTs = ({ onClusterChange }) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const [nft, setNft] = useState(null);

    const [disableMint, setDisableMint] = useState(true);

    const candyMachineAddress = new PublicKey(
        process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
    );
    let candyMachine;
    let walletBalance;

    const checkEligibility = async () => {
        //wallet not connected?
        if (!wallet.connected) {
            setDisableMint(true);
            return;
        }
        
        // read candy machine state from chain
        candyMachine = await metaplex
            .candyMachine()
            .findByAddress({ address: candyMachineAddress });

        // enough items available?
        if (
            candyMachine.itemsMinted.toString(10) - candyMachine.itemsAvailable.toString(10) > 0
        ) {
            console.error("not enough items available");
            setDisableMint(true);
            return;
        }

        //good to go! Allow them to mint
        setDisableMint(false);
    };

    // show and do nothing if no wallet is connected
    if (!wallet.connected) {
        return null;
    }

    // if it's the first time we are processing this function with a connected wallet we read the CM data and add Listeners
    if (candyMachine === undefined) {
        (async () => {
            // read candy machine data to get the candy guards address
            await checkEligibility();
            // Add listeners to refresh CM data to reevaluate if minting is allowed after the candy guard updates or startDate is reached
        })();
    }

    const onClick = async () => {
        // Here the actual mint happens. Depending on the guards that you are using you have to run some pre validation beforehand 
        // Read more: https://docs.metaplex.com/programs/candy-machine/minting#minting-with-pre-validation
        const { nft } = await metaplex.candyMachines().mint({
            candyMachine,
            collectionUpdateAuthority: candyMachine.authorityAddress,
        });


        setNft(nft);
    };

    return (
        <div>
        <select onChange={onClusterChange} className={styles.dropdown}>
            <option value="devnet">Devnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
        </select>
        <div>
            <div className={styles.container}>
            <h1 className={styles.title}>NFT Mint Address</h1>
            <div className={styles.nftForm}>
                <input
                type="text"
                value={nft ? nft.mint.address.toBase58() : ""}
                readOnly
                />
                <button onClick={onClick} disabled={disableMint}>
                mint NFT
                </button>
            </div>
            {nft && (
                <div className={styles.nftPreview}>
                <h1>{nft.name}</h1>
                <img
                    src={nft?.json?.image || "/fallbackImage.jpg"}
                    alt="The downloaded illustration of the provided NFT address."
                />
                </div>
            )}
            </div>
        </div>
        </div>
    );
};