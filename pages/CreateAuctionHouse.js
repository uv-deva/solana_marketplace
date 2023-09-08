import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";


export const CreateAuctionHouse = ({ onClusterChange }) => {
  const { metaplex } = useMetaplex();
  const wallet = useWallet();

  const [nft, setNft] = useState(null);

  const onClick = async () => {

    const {auctionHouse} = await metaplex
        .auctionHouse()
        .create({sellerFeeBasisPoints: 200});
    setNft(auctionHouse.address.toBase58());
    console.log("auctionHouse",auctionHouse.address.toBase58());
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
          <h1 className={styles.title}>Auction Address</h1>
          <div className={styles.nftForm}>
            <input
              type="text"
              value={nft ? nft : ""}
              readOnly
            />
            <button onClick={onClick}>Create Auction House</button>
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
