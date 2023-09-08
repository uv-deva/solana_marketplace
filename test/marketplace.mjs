import { Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, PublicKey, LAMPORTS_PER_SOL, Connection, clusterApiUrl } from '@solana/web3.js';

import test from 'tape';
import bs58 from "bs58";

// import spok from 'spok';
import { Metaplex, keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js";

function quickKeypair() {
  const kp = Keypair.generate();
  return kp;
}

test('Marketplace', async (t) => {

    const connection = new Connection(clusterApiUrl("devnet"));

  
    const feePayer = Keypair.fromSecretKey(
        bs58.decode("5BXTjrV9uegudv1QCk1D8k7Hm6djz35oHrLsBqZsc7uhD9pCmqPzxouFS3dnAj1CPibuzXP1CJZbfhBZzf3mvqSh")
    );

    const buyer = Keypair.fromSecretKey(
        bs58.decode("43NBx7yrgZeD7LyQGPy46BikEzwtYZcqBUrrTLSi8D7rHvn3Q3R2BQxNLjiUPrS1cbAoGJtzDVBEHtG8jFeteNLN")
    );

    var metaplex = Metaplex.make(connection)
        .use(keypairIdentity(feePayer));

    
    const NFT_METADATA = 'https://mfp2m2qzszjbowdjl2vofmto5aq6rtlfilkcqdtx2nskls2gnnsa.arweave.net/YV-mahmWUhdYaV6q4rJu6CHozWVC1CgOd9NkpctGa2Q'; 


// Creating NFT Collection

    const { nft: collectionNft } = await metaplex.nfts().create({
        name: " NFT Collection",
        uri: NFT_METADATA,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: feePayer,
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
        { address: feePayer.publicKey, share: 100 },
        ],
        collection: {
        address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
        updateAuthority: feePayer,
        },
    };

    let { candyMachine } = await metaplex.candyMachines().create(candyMachineSettings,{commitment:'finalized'});
    console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);


// Inserting the NFT Metadata items on Candymachine

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


// Minting the NFT

    let { nft, response } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: feePayer.publicKey,
    },{commitment:'finalized'})

    console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);

    let mintAccount= nft.address.toString();


// Attaching the Auction House contract address

    const auctionHouse = await metaplex
        .auctionHouse()
        .findByAddress({ address: new PublicKey("UHdZTTYukiDk7wfMJZrtxPaQm5M5WP7dDRv4HeTebuf")});


// Listing the NFT

    await metaplex.auctionHouse().list({
        auctionHouse: auctionHouse,
        seller: feePayer,
        mintAccount: new PublicKey(mintAccount),
        price: {
        basisPoints: 100000000,
        currency: { decimals: 9, symbol: "SOL" },
        },
    },{commitment:'finalized'});


// Fetching the Listed NFTs using AuctionHouse

    let listing = await metaplex
        .auctionHouse()
        .findListings({ auctionHouse, feePayer, mintAccount });

    var listbyReceipt = [];


// Fetching the Listed NFTs receipt using AuctionHouse

    for(let i = 0; i < listing.length; i++) {
        const receipt = await metaplex
        .auctionHouse()
        .findListingByReceipt({auctionHouse: auctionHouse, receiptAddress: listing[i].receiptAddress})       
        listbyReceipt.push(receipt);
    }

// Buyer Buy the NFT

    for(let i = 0; i < listbyReceipt.length; i++) {
        if (listbyReceipt[i].asset.mint.address.toBase58() === mintAccount ) {
        const buy = await metaplex.auctionHouse().buy({
            auctionHouse: auctionHouse,
            buyer: buyer,
            listing: listbyReceipt[i],
        });
        
        break;
        }
    }


// Second NFTs minted

    let data = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: feePayer.publicKey,
    },{commitment:'finalized'})

    mintAccount= data.nft.address.toString();

    await metaplex.auctionHouse().list({
        auctionHouse: auctionHouse,
        seller: feePayer,
        mintAccount: new PublicKey(mintAccount),
        price: {
            basisPoints: 100000000,
            currency: { decimals: 9, symbol: "SOL" },
        },
    },{commitment:'finalized'});


    metaplex = Metaplex.make(connection)
        .use(keypairIdentity(buyer));

// Make a Bid for an a NFT

    await metaplex.auctionHouse().bid({
        auctionHouse: auctionHouse,
        mintAccount: new PublicKey(mintAccount),
        seller: feePayer.publicKey,
        price: {
            basisPoints: 100000000,
            currency: { decimals: 9, symbol: "SOL" },
        },
    },{commitment:'finalized'});


    metaplex = Metaplex.make(connection)
        .use(keypairIdentity(feePayer));

    listing = await metaplex
        .auctionHouse()
        .findListings({ auctionHouse, feePayer, mintAccount });

    const bids = await metaplex
        .auctionHouse()
        .findBids({ auctionHouse, feePayer, mintAccount  });

    var listbyReceipt;
    for(let i = 0; i < listing.length; i++) {
        const receipt = await metaplex
            .auctionHouse()
            .findListingByReceipt({auctionHouse: auctionHouse, receiptAddress: listing[i].receiptAddress})
        if(receipt.asset.mint.address.toBase58() === mintAccount ) {
            listbyReceipt = receipt;
        }
    }

    var bidbyReceipt;
    for(let i = 0; i < bids.length; i++) {
        const receipt = await metaplex
            .auctionHouse()
            .findBidByReceipt({auctionHouse: auctionHouse, receiptAddress: bids[i].receiptAddress});
        if(receipt.asset.mint.address.toBase58() === mintAccount ) {
            bidbyReceipt = receipt;
        }
    }

// Execute the sale of an a NFT

    const acceptOffer = await metaplex.auctionHouse().executeSale({
        auctionHouse: auctionHouse,
        listing: listbyReceipt,
        bid: bidbyReceipt
    },{commitment:'finalized'});
});