import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const CancelListNFT = ({ onClusterChange }) => {
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
    try {
        metaplex.use(walletAdapterIdentity(wallet));

        const auctionHouse = await metaplex
        .auctionHouse()
        .findByAddress({ address: auctionAddress });

        const seller = new PublicKey("6iXFNpnBfrZT3ZFPgZnnPwhSKe84FirAGSVoAo7PHaGq")

        const listing = await metaplex
            .auctionHouse()
            .findListings({ auctionHouse, seller, mintAccount });
        console.log("listing:", listing)

        var listbyReceipt = [];

        for(let i = 0; i < listing.length; i++) {

            const receipt = await metaplex
                .auctionHouse()
                .findListingByReceipt({auctionHouse: auctionHouse, receiptAddress: listing[i].receiptAddress})
            listbyReceipt.push(receipt);
            console.log("receipt", receipt.asset.mint.address.toBase58());
        }

        console.log("listbyReceipt", listbyReceipt);
        for(let i = 0; i < listing.length; i++) {
            if (listbyReceipt[i].asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS ) {
                const cancelListResponse = await metaplex               
                    .auctionHouse()
                    .cancelListing({
                        auctionHouse,
                        listing: listbyReceipt[i],
                    });
                console.log("Cancel List", cancelListResponse);
                break;
            }
        }

        listing = await metaplex
                .auctionHouse()
                .findListings({ auctionHouse, seller, mintAccount });
        console.log("listing:", listing)

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
            <h1 className={styles.title}>Cancel The List</h1>
            <div className={styles.nftForm}>
                <button onClick={onClick}>Cancel The List</button>
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
