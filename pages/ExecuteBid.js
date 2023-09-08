import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const ExecuteBid = ({ onClusterChange }) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const candyMachineAddress = new PublicKey(
        process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
    );

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

            const bids = await metaplex
                .auctionHouse()
                .findBids({ auctionHouse, seller, mintAccount  });

            var listbyReceipt;
            for(let i = 0; i < listing.length; i++) {
                const receipt = await metaplex
                    .auctionHouse()
                    .findListingByReceipt({auctionHouse: auctionHouse, receiptAddress: listing[i].receiptAddress})
                if(receipt.asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS ) {
                    listbyReceipt = receipt;
                    console.log("listbyReceipt", listbyReceipt.asset.mint.address.toBase58());
                }
            }
            console.log("listingbyReceipt", listbyReceipt);

            var bidbyReceipt;
            for(let i = 0; i < bids.length; i++) {
                const receipt = await metaplex
                    .auctionHouse()
                    .findBidByReceipt({auctionHouse: auctionHouse, receiptAddress: bids[i].receiptAddress});
                if(receipt.asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS ) {
                    bidbyReceipt = receipt;
                    console.log("bidbyReceipt", bidbyReceipt.asset.mint.address.toBase58());
                }
            }
            const acceptOffer = await metaplex.auctionHouse().executeSale({
                auctionHouse: auctionHouse,
                listing: listbyReceipt,
                bid: bidbyReceipt
            });
            console.log("acceptOffer", acceptOffer);
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
            <h1 className={styles.title}>Execute Bide</h1>
            <div className={styles.nftForm}>
                <input
                type="text"
                value={nft ? nft.mint.address.toBase58() : ""}
                readOnly
                />
                <button onClick={onClick}>Execute Bid</button>
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
