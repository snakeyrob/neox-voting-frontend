import './App.css'
import Voting from './components/Voting'

function App() {
  const contractAddress = "0x675649b32511a3Cc0e664f27f98740a8fb5f6fE0"; // Replace with your deployed contract address
  
  return (
      <Voting contractAddress={contractAddress} rpcUrl='https://neoxt4seed1.ngd.network'></Voting>
  )
}

export default App
