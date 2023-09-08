# Connect with wallets in the browser

1. **Install the wallet adapter libraries.**

   ```sh
   npm install @solana/wallet-adapter-base \
      @solana/wallet-adapter-react \
      @solana/wallet-adapter-react-ui \
      @solana/wallet-adapter-wallets
   ```

2. **Create the `pages/useMetaplex.js` file.**

   The `useMetaplex.js` file is responsible for creating and exposing a new Metaplex Context which will be used within our components to access the Metaplex SDK.

   ```js
   const DEFAULT_CONTEXT = {
     metaplex: null,
   };

   export const MetaplexContext = createContext(DEFAULT_CONTEXT);

   export function useMetaplex() {
     return useContext(MetaplexContext);
   }
   ```

3. **Create the `pages/MetaplexProvider.js` file.**

   The `MetaplexProvider` component uses the wallet provided by the `WalletProvider` component to define the Metaplex Context previously created.

   ```js
   export const MetaplexProvider = ({ children }) => {
     const { connection } = useConnection();
     const wallet = useWallet();

     const metaplex = useMemo(
       () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
       [connection, wallet]
     );

     return (
       <MetaplexContext.Provider value={{ metaplex }}>
         {children}
       </MetaplexContext.Provider>
     );
   };
   ```



