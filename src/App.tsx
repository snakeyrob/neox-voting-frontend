import './App.css'
import { WalletProvider } from '~/hooks/WalletProvider'
import { SelectedWallet } from './components/SelectedWallet'
import { WalletList } from './components/WalletList'
import { WalletError } from './components/WalletError'
import MemeVoting from './components/Voting'

function App() {
  const contractAddress = "0x675649b32511a3Cc0e664f27f98740a8fb5f6fE0"; // Replace with your deployed contract address
  
  return (
    <WalletProvider>
      <WalletList />
      <hr />
      <SelectedWallet />
      <WalletError />

      <MemeVoting contractAddress={contractAddress} rpcUrl='https://neoxt4seed1.ngd.network'></MemeVoting>
    </WalletProvider>
  )
}

export default App
