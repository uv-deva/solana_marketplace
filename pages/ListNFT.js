import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from "@solana/web3.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const ListNFT = ({ onClusterChange }) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const [nft, setNft] = useState(null);

    const auctionAddress = new PublicKey(
        process.env.NEXT_PUBLIC_AUCTION_ADDRESS
    );
    const mintAccount = new PublicKey(
        process.env.NEXT_PUBLIC_MINT_ADDRESS
    );


    const onClick = async () => {
        console.log(onClusterChange);
        try {
            metaplex.use(walletAdapterIdentity(wallet));

            const auctionHouse = await metaplex
            .auctionHouse()
            .findByAddress({ address: auctionAddress });
            
            const listing = await metaplex.auctionHouse().list({
                auctionHouse: auctionHouse,
                seller: metaplex.identity(),
                mintAccount: mintAccount,
                price: {
                    basisPoints: 100000000,
                    currency: { decimals: 9, symbol: "SOL" },
                },
            });
            console.log(`listing : ${listing}`);z


        } catch (error) {
            console.error(error);
        }
    };

    if (!wallet.connected) {
        return null;
    }

    return (
        <div>
        <select onChange={onClusterChange} className={styles.dropdown}>
            <option value="devnet">Devnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
        </select>
        <div>
            <div className={styles.container}>
            <h1 className={styles.title}>List The NFT</h1>
            <div className={styles.nftForm}>
                <input
                type="text"
                value={nft ? nft.mint.address.toBase58() : ""}
                readOnly
                />
                <button onClick={onClick}>List NFT</button>
            </div>
            {nft && (
                <div className={styles.nftPreview}>
                <h1>{nft.name}</h1>
                <img
                    src={nft?.json?.image || '/fallbackImage.jpg'}
                    alt="The downloaded illustration of the provided NFT address."
                />
                </div>
            )}
            </div>
        </div>
        </div>
    );
};
