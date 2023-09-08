import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { AuctionHouseProgram } from '@metaplex-foundation/mpl-auction-house'
import { walletAdapterIdentity } from '@metaplex-foundation/js';


export const BidNFT = ({ onClusterChange }) => {
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
        console.log("listings:", listing)
        const bids = await metaplex
            .auctionHouse()
            .findBids({ auctionHouse, seller, mintAccount  });
        console.log("BeforeBids:", bids)

        const bidding = await metaplex.use(walletAdapterIdentity(wallet)).auctionHouse().bid({
            auctionHouse: auctionHouse,
            mintAccount: mintAccount,
            seller: seller,
            price: 100000000,
        });

        console.log("bid", bidding);
        bids = await metaplex
            .auctionHouse()
            .findBids({ auctionHouse, seller, mintAccount  });
        console.log("AfterBids:", bids)

        for(let i = 0; i < bids.length; i++) {

            const receipt = await metaplex
                .auctionHouse()
                .findBidByReceipt({auctionHouse: auctionHouse, receiptAddress: bids[i].receiptAddress});
                console.log("receipt", receipt.asset.mint.address.toBase58());
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
            <h1 className={styles.title}>Bid THE NFT</h1>
            <div className={styles.nftForm}>
                <input
                type="text"
                value={nft ? nft.mint.address.toBase58() : ""}
                readOnly
                />
                <button onClick={onClick}>Bid THE NFT</button>
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
