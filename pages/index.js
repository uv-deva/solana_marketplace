import styles from '../styles/Home.module.css';
import { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { MetaplexProvider } from './MetaplexProvider';
import { MintNFTs } from './MintNFTs';
import { CreateAuctionHouse } from './CreateAuctionHouse';
import { CreateNFTCollection } from './CreateNFTCollection';
import { ListNFT } from './ListNFT';
import { BidNFT } from './Bid';
import { BuyNft } from './Buy';
import { ExecuteBid } from './executeBid'; 
import { CancelBidNFT } from './CancelBid';
import { CancelListNFT } from './cancelList';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function Home() {

  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const handleChange = (event) => {
    switch (event.target.value) {
      case "devnet":
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
      case "mainnet":
        setNetwork(WalletAdapterNetwork.Mainnet);
        break;
      case "testnet":
        setNetwork(WalletAdapterNetwork.Testnet);
        break;
      default:
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
    }
  };


  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.App}>
                <WalletMultiButton />
                <MintNFTs onClusterChange={handleChange} />
                <CreateAuctionHouse onClusterChange={handleChange} />
                <CreateNFTCollection onClusterChange={handleChange} />
                <ListNFT onClusterChange={handleChange} />
                <BidNFT onClusterChange={handleChange} />
                <BuyNft onClusterChange={handleChange} />
                <ExecuteBid onClusterChange={handleChange} />
                <CancelBidNFT onClusterChange={handleChange} />
                <CancelListNFT onClusterChange={handleChange} />
              </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );


}

