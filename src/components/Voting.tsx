import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi } from "./VotingABI"; // Replace with the actual ABI file or object

interface Topic {
  id: number;
  description: string;
  endTime: number;
  options: string[];
  votes: number[];
  finalized: boolean;
}

const MemeVoting = ({ contractAddress, rpcUrl }: { contractAddress: string; rpcUrl: string }) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize provider and contract
  useEffect(() => {
    const initialize = async () => {
      try {
        // Connect to the blockchain (read-only provider)
        const providerInstance = new ethers.JsonRpcProvider(rpcUrl);
        setProvider(providerInstance);

        // Create contract instance (read-only)
        const contractInstance = new ethers.Contract(contractAddress, abi, providerInstance);
        setContract(contractInstance);

        // Fetch topics
        await fetchTopics(contractInstance);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    initialize();
  }, [contractAddress, rpcUrl]);

  // Fetch topics from the contract
  const fetchTopics = async (contractInstance: ethers.Contract) => {
    try {
      const topicCount = await contractInstance.topicCount();
      const fetchedTopics: Topic[] = [];

      for (let i = 0; i < topicCount; i++) {
        try {
          await contractInstance.getTopicDetails(i);

          const [description, endTime, optionDescriptions, optionVoteCounts] = await contractInstance.getTopicDetails(i);

          const finalized = Date.now() / 1000 > endTime; // Determine if voting has ended
          const votes: number[] = [];
          for (let j = 0; j < optionDescriptions.length; j++) {
            const voteCount = optionVoteCounts[j];
            votes.push(Number(voteCount));
          }

          fetchedTopics.push({
            id: i,
            description,
            endTime: Number(endTime),
            options: optionDescriptions,
            votes,
            finalized,
          });
        } catch (err) {
          console.error(`Error fetching details for topic ${i}:`, err);
        }
      }

      setTopics(fetchedTopics);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setLoading(false);
    }
  };

  // Handle voting
  const handleVote = async (topicId: number, option: string) => {
    if (!contract) {
      alert("Contract is not initialized.");
      return;
    }

    try {
      if (typeof (window as any).ethereum === "undefined") {
        alert("MetaMask is not installed. Please install MetaMask.");
        return;
      }

      // Request MetaMask connection
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();

      // Create a signer-enabled contract
      const signerContract = contract.connect(signer);

      // Submit vote
      const tx = await signerContract.vote(topicId, option);
      await tx.wait();

      alert("Vote submitted successfully!");
      await fetchTopics(contract); // Refresh topics
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to submit vote. Check the console for details.");
    }
  };

  if (loading) {
    return <div>Loading topics...</div>;
  }

  return (
    <div>
      <h1>Meme Voting</h1>
      {topics.length === 0 && <p>No topics available for voting.</p>}
      {topics.map((topic) => (
        <div
          key={topic.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <h2>{topic.description}</h2>
          <p>
            Ends: {new Date(topic.endTime * 1000).toLocaleString()}
            <br />
            {topic.finalized ? (
              <span style={{ color: "red" }}>Voting has ended (readonly).</span>
            ) : (
              <span style={{ color: "green" }}>Voting is ongoing.</span>
            )}
          </p>
          <ul>
            {topic.options.map((option, index) => (
              <li key={index}>
                {option} - Votes: {topic.votes[index]}
                {!topic.finalized && (
                  <button
                    onClick={() => handleVote(topic.id, option)}
                    style={{
                      marginLeft: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Vote
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MemeVoting;
