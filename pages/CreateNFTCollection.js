import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";


export const CreateNFTCollection = ({ onClusterChange }) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const [nft, setNft] = useState(null);

    const onClick = async () => {

    const NFT_METADATA = 'https://mfp2m2qzszjbowdjl2vofmto5aq6rtlfilkcqdtx2nskls2gnnsa.arweave.net/YV-mahmWUhdYaV6q4rJu6CHozWVC1CgOd9NkpctGa2Q'; 


// Creating NFT Collection

    const { nft: collectionNft } = await metaplex.nfts().create({
        name: " NFT Collection",
        uri: NFT_METADATA,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: wallet,
    },{commitment:'finalized'});

    let COLLECTION_NFT_MINT = collectionNft.address.toString();
    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);



    // Creating Candy machine

    const candyMachineSettings = {
        itemsAvailable: 3, // Collection Size: 3
        sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
        symbol: "DEMO",
        maxEditionSupply: 0, // 0 reproductions of each NFT allowed
        isMutable: true,
        creators: [
            { 
                address: wallet.publicKey,
                share: 100 
            },
        ],
        collection: {
            address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
            updateAuthority: wallet,
        },
    };

    let { candyMachine } = await metaplex.candyMachines().create(candyMachineSettings,{commitment:'finalized'});
    console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);



    let CANDY_MACHINE_ID = candyMachine.address.toString();
    candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) }); 
    const items = [];
    for (let i = 0; i < 3; i++ ) { // Add 3 NFTs (the size of our collection)
        items.push({
            name: `Demo NFT # ${i+1}`,
            uri: NFT_METADATA
        })
    }

    let tx = await metaplex.candyMachines().insertItems({
        candyMachine,
        items: items,
    },{commitment:'finalized'});
    console.log(`✅ - Items added to Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${tx.response.signature}?cluster=devnet`);


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
            <button onClick={onClick}>Create NFT Collection</button>
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
