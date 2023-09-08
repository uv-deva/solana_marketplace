import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const CancelBidNFT = ({ onClusterChange }) => {
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

        const bids = await metaplex
            .auctionHouse()
            .findBids({ auctionHouse, seller, mintAccount  });
        console.log("bids:", bids)

        var bidbyReceipt = [];

        for(let i = 0; i < bids.length; i++) {

        const receipt = await metaplex
            .auctionHouse()
            .findBidByReceipt({auctionHouse: auctionHouse, receiptAddress: bids[i].receiptAddress});
        bidbyReceipt.push(receipt);
        console.log("receipt", receipt.asset.mint.address.toBase58());
        }

        console.log("bidbyReceipt", bidbyReceipt);
        for(let i = 0; i < bids.length; i++) {
            console.log(bidbyReceipt[i].asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS);
            if (bidbyReceipt[i].asset.mint.address.toBase58() === process.env.NEXT_PUBLIC_MINT_ADDRESS ) {
                const cancelBidResponse = await metaplex               
                    .auctionHouse()
                    .cancelBid({
                        auctionHouse,
                        bid: bidbyReceipt[i],
                    });

                console.log("Cancel bid", cancelBidResponse);
                break;

            }
        }

        bids = await metaplex
            .auctionHouse()
            .findBids({ auctionHouse, seller, mintAccount  });
        console.log("bids:", bids)

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
            <h1 className={styles.title}>Cancel The Bid</h1>
            <div className={styles.nftForm}>
                <button onClick={onClick}>Cancel The Bid</button>
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
