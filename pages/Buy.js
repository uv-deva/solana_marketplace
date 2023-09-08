import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const BuyNft = ({ onClusterChange }) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const auctionAddress = new PublicKey(
        process.env.NEXT_PUBLIC_AUCTION_ADDRESS
    );

    const mintAccount = new PublicKey(
        process.env.NEXT_PUBLIC_MINT_ADDRESS
    );

    const [nft, setNft] = useState(null);

    const onClick = async () => {
        try {
            metaplex.use(walletAdapterIdentity(wallet));

            const auctionHouse = await metaplex
                .auctionHouse()
                .findByAddress({ address: auctionAddress});
            const seller = new PublicKey("6iXFNpnBfrZT3ZFPgZnnPwhSKe84FirAGSVoAo7PHaGq")
            const listing = await metaplex
                .auctionHouse()
                .findListings({ auctionHouse, seller, mintAccount });

            var listbyReceipt = [];

            for(let i = 0; i < listing.length; i++) {
                const receipt = await metaplex
                    .auctionHouse()
                    .findListingByReceipt({auctionHouse: auctionHouse, receiptAddress: listing[i].receiptAddress})
        
                listbyReceipt.push(receipt);
                console.log("receipt", receipt.asset.mint.address.toBase58());
            }
            console.log("listingbyReceipt", listbyReceipt);


            for(let i = 0; i < listbyReceipt.length; i++) {
                if (listbyReceipt[i].asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS ) {
                    const buy = await metaplex.auctionHouse().buy({
                        auctionHouse: auctionHouse,
                        buyer: metaplex.identity(),
                        listing: listbyReceipt[i],
                    });
                    console.log("Direct Buy", buy);
                    break;
                }
            }
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
            <h1 className={styles.title}>Direct BUY</h1>
            <div className={styles.nftForm}>
                <button onClick={onClick}>Direct BUY</button>
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
