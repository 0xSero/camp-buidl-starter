import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Toaster, toast } from 'react-hot-toast';

// Mock ABI for the Voting contract - replace with your actual ABI
const votingAbi = [
    {
      "type": "function",
      "name": "checkProposalStatus",
      "inputs": [{"type": "uint256"}],
      "outputs": [{"type": "bool"}],
      "stateMutability": "view",
      "selector": "0xa201fac9"
    },
    {
      "type": "function",
      "name": "createProposal",
      "inputs": [
        {"type": "uint256"},
        {"type": "address"},
        {"type": "uint256"}
      ],
      "outputs": [],
      "stateMutability": "nonpayable",
      "selector": "0xb95a9287"
    },
    {
      "type": "function",
      "name": "getProposal",
      "inputs": [{"type": "uint256"}],
      "outputs": [{
        "type": "tuple",
        "components": [
          {"type": "uint256", "name": "numberOfVotes"},
          {"type": "uint256", "name": "yesVotes"},
          {"type": "uint256", "name": "noVotes"},
          {"type": "uint256", "name": "abstainVotes"},
          {"type": "uint256", "name": "deadLine"},
          {"type": "bool", "name": "executed"},
          {"type": "address", "name": "target"},
          {"type": "uint256", "name": "value"}
        ]
      }],
      "stateMutability": "view",
      "selector": "0xc7f758a8"
    },
    {
      "type": "function",
      "name": "proposalCount",
      "inputs": [],
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "selector": "0xda35c664"
    },
    {
      "type": "function",
      "name": "proposals",
      "inputs": [{"type": "uint256"}],
      "outputs": [
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "bool"},
        {"type": "address"},
        {"type": "uint256"}
      ],
      "stateMutability": "view",
      "selector": "0x013cf08b"
    },
    {
      "type": "function",
      "name": "treasuryAddress",
      "inputs": [],
      "outputs": [{"type": "address"}],
      "stateMutability": "view",
      "selector": "0xc5f956af"
    },
    {
      "type": "function",
      "name": "updateExecuted",
      "inputs": [{"type": "uint256"}],
      "outputs": [],
      "stateMutability": "nonpayable",
      "selector": "0xe0bd0e09"
    },
    {
      "type": "function",
      "name": "updatePassingThreshold",
      "inputs": [{"type": "uint256"}],
      "outputs": [],
      "stateMutability": "nonpayable",
      "selector": "0xdc59e79a"
    },
    {
      "type": "function",
      "name": "updateQuorum",
      "inputs": [{"type": "uint256"}],
      "outputs": [],
      "stateMutability": "nonpayable",
      "selector": "0x35680dc2"
    },
    {
      "type": "function",
      "name": "vote",
      "inputs": [
        {"type": "uint256"},
        {"type": "uint256"}
      ],
      "outputs": [],
      "stateMutability": "nonpayable",
      "selector": "0xb384abef"
    },
    {
      "type": "constructor",
      "inputs": [{"type": "address"}],
      "stateMutability": "nonpayable"
    }
  ]



// Mock contract address - replace with your actual contract address
const contractAddress = "0x1578ddcFbAD450DCfE273D50916C6372C4e56718";

// Vote types
const VOTE_TYPES = {
  YES: 1,
  NO: 2,
  ABSTAIN: 3
};

// Proposal status types
const STATUS = {
  ACTIVE: "active",
  PASSED: "passed",
  FAILED: "failed",
  EXECUTED: "executed"
};

// Define the type for the proposal data returned from the contract
interface ProposalData {
  numberOfVotes: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  abstainVotes: bigint;
  deadLine: bigint;
  executed: boolean;
  target: `0x${string}`;
  value: bigint;
}

interface Proposal {
  id: number;
  target: string;
  value: string;
  deadline: string;
  deadlineTimestamp: number;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  executed: boolean;
  status: string;
}

export default function VotingApp() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [quorum, setQuorum] = useState('10');
  const [targetAddress, setTargetAddress] = useState('');
  const [value, setValue] = useState('0.1');

  // Contract read for proposal count
  const { data: proposalCount, isLoading: countLoading, refetch: refetchCount } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: votingAbi,
    functionName: 'proposalCount',
  });

  // Contract read for treasury address
  const { data: treasuryAddress } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: votingAbi,
    functionName: 'treasuryAddress',
  });

  // Contract write for creating a proposal
  const { writeContract: createProposal, data: createTxData, isPending: createLoading } = useContractWrite();

  // Contract write for voting
  const { writeContract: castVote, data: voteTxData, isPending: voteLoading } = useContractWrite();

  // Contract write for executing a proposal
  const { writeContract: executeProposal, data: executeTxData, isPending: executeLoading } = useContractWrite();

  // Wait for transaction confirmations
  const { isSuccess: isCreateSuccess, isError: isCreateError } = useWaitForTransactionReceipt({
    hash: createTxData,
  });

  const { isSuccess: isVoteSuccess, isError: isVoteError } = useWaitForTransactionReceipt({
    hash: voteTxData,
  });

  const { isSuccess: isExecuteSuccess, isError: isExecuteError } = useWaitForTransactionReceipt({
    hash: executeTxData,
  });

  // Handle transaction success/error with useEffect
  useEffect(() => {
    if (isCreateSuccess) {
      toast.success('Proposal created successfully!');
      setCreateModalOpen(false);
      resetCreateForm();
      refetchCount();
    } else if (isCreateError) {
      toast.error('Failed to create proposal');
    }
  }, [isCreateSuccess, isCreateError]);

  useEffect(() => {
    if (isVoteSuccess) {
      toast.success('Vote cast successfully!');
      fetchProposals();
    } else if (isVoteError) {
      toast.error('Failed to cast vote');
    }
  }, [isVoteSuccess, isVoteError]);

  useEffect(() => {
    if (isExecuteSuccess) {
      toast.success('Proposal executed successfully!');
      fetchProposals();
    } else if (isExecuteError) {
      toast.error('Failed to execute proposal');
    }
  }, [isExecuteSuccess, isExecuteError]);

  const resetCreateForm = () => {
    setQuorum('10');
    setTargetAddress('');
    setValue('0.1');
  };

  // Fetch all proposals
  const fetchProposals = async () => {
    console.log("fetching proposals", proposalCount, isConnected, publicClient);
    if (!proposalCount || !isConnected || !publicClient) return;

    setLoading(true);
    try {
      const fetchedProposals = [];

      for (let i = 0; i <= Number(proposalCount); i++) {
        try {
          // Use direct contract read for each proposal
          const result = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: votingAbi,
            functionName: 'getProposal',
            args: [BigInt(i)]
          }) as ProposalData;

          if (result) {
            const isPassed = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: votingAbi,
              functionName: 'checkProposalStatus',
              args: [BigInt(i)]
            }) as boolean;

            const now = Math.floor(Date.now() / 1000);
            const deadlineTimestamp = Number(result.deadLine);
            const isActive = deadlineTimestamp > now && !result.executed;

            let status;
            if (result.executed) {
              status = STATUS.EXECUTED;
            } else if (deadlineTimestamp <= now) {
              status = isPassed ? STATUS.PASSED : STATUS.FAILED;
            } else {
              status = STATUS.ACTIVE;
            }

            fetchedProposals.push({
              id: Number(i),
              target: result.target,
              value: formatEther(result.value),
              deadline: new Date(deadlineTimestamp * 1000).toLocaleString(),
              deadlineTimestamp,
              yesVotes: result.yesVotes.toString(),
              noVotes: result.noVotes.toString(),
              abstainVotes: result.abstainVotes.toString(),
              executed: result.executed,
              status
            });
          }
        } catch (error) {
          console.error(`Error fetching proposal ${i}:`, error);
        }
      }

      setProposals(fetchedProposals.reverse()); // Show newest first
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  // Load proposals when connected and proposal count changes
  useEffect(() => {
    if (isConnected && proposalCount) {
      fetchProposals();
    }
  }, [isConnected, proposalCount, address]);

  // Handle proposal creation
  const handleCreateProposal = () => {
    if (!targetAddress || !targetAddress.startsWith('0x')) {
      toast.error("Invalid target address");
      return;
    }

    try {
      createProposal({
        address: contractAddress as `0x${string}`,
        abi: votingAbi,
        functionName: 'createProposal',
        args: [BigInt(quorum), targetAddress as `0x${string}`, parseEther(value)]
      });
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal");
    }
  };

  // Handle voting
  const handleVote = (proposalId: number, voteType: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    castVote({
      address: contractAddress as `0x${string}`,
      abi: votingAbi,
      functionName: 'vote',
      args: [BigInt(proposalId), BigInt(voteType)],
    });
  };

  // Handle proposal execution
  const handleExecute = (proposalId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    executeProposal({
      address: contractAddress as `0x${string}`,
      abi: votingAbi,
      functionName: 'updateExecuted',
      args: [BigInt(proposalId)],
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case STATUS.ACTIVE:
        return "text-blue-500";
      case STATUS.PASSED:
        return "text-green-500";
      case STATUS.FAILED:
        return "text-red-500";
      case STATUS.EXECUTED:
        return "text-purple-500";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Head>
        <title>Voting Dashboard | Contracts UI</title>
        <meta content="Decentralized voting application" name="description" />
      </Head>
      <Toaster position="top-right" />

      <Layout>
        <div className="container mx-auto p-8 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Voting Dashboard</h1>
            <p className="text-muted-foreground">Create and vote on proposals in a decentralized manner</p>
          </div>

          <div className="flex justify-end mb-6 gap-4">
            <Button
              onClick={() => setCreateModalOpen(true)}
              disabled={!isConnected}
            >
              Create Proposal
            </Button>
          </div>

          {!isConnected ? (
            <Card>
              <CardContent className="pt-6">
                <p>Please connect your wallet to use the voting application.</p>
              </CardContent>
            </Card>
          ) : loading || countLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading proposals...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Proposals</CardTitle>
                    <CardDescription>Total count: {proposalCount?.toString() || '0'}</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Treasury</CardTitle>
                    <CardDescription>Address: {treasuryAddress ? String(treasuryAddress) : 'Loading...'}</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Proposals</CardTitle>
                  <CardDescription>Vote, execute, or view details of proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Value (ETH)</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Votes (Yes/No/Abstain)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell>{proposal.id}</TableCell>
                          <TableCell className="font-mono">{proposal.target.substring(0, 10)}...</TableCell>
                          <TableCell>{proposal.value}</TableCell>
                          <TableCell>{proposal.deadline}</TableCell>
                          <TableCell>
                            <span className={getStatusColor(proposal.status)}>
                              {proposal.status.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>{`${proposal.yesVotes}/${proposal.noVotes}/${proposal.abstainVotes}`}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {proposal.status === STATUS.ACTIVE && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleVote(proposal.id, VOTE_TYPES.YES)}
                                    disabled={voteLoading}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleVote(proposal.id, VOTE_TYPES.NO)}
                                    disabled={voteLoading}
                                  >
                                    No
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVote(proposal.id, VOTE_TYPES.ABSTAIN)}
                                    disabled={voteLoading}
                                  >
                                    Abstain
                                  </Button>
                                </>
                              )}

                              {proposal.status === STATUS.PASSED && !proposal.executed && (
                                <Button
                                  size="sm"
                                  onClick={() => handleExecute(proposal.id)}
                                  disabled={executeLoading}
                                >
                                  Execute
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedProposal(proposal)}
                              >
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Proposal Details Dialog */}
          <Dialog
            open={!!selectedProposal}
            onClose={() => setSelectedProposal(null)}
          >
            {selectedProposal && (
              <>
                <DialogHeader>
                  <DialogTitle>Proposal #{selectedProposal.id} Details</DialogTitle>
                </DialogHeader>
                <DialogContent>
                  <div className="space-y-4 mt-4">
                    <div>
                      <p className="font-semibold">Target Address:</p>
                      <p className="font-mono text-sm">{selectedProposal.target}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Value:</p>
                      <p>{selectedProposal.value} ETH</p>
                    </div>
                    <div>
                      <p className="font-semibold">Deadline:</p>
                      <p>{selectedProposal.deadline}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status:</p>
                      <p className={getStatusColor(selectedProposal.status)}>
                        {selectedProposal.status.toUpperCase()}
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-3">Votes</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-green-500 text-2xl">{selectedProposal.yesVotes}</p>
                          <p className="text-sm">Yes Votes</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-red-500 text-2xl">{selectedProposal.noVotes}</p>
                          <p className="text-sm">No Votes</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-gray-500 text-2xl">{selectedProposal.abstainVotes}</p>
                          <p className="text-sm">Abstain</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {selectedProposal.status === STATUS.ACTIVE && (
                        <>
                          <Button
                            onClick={() => handleVote(selectedProposal.id, VOTE_TYPES.YES)}
                            disabled={voteLoading}
                          >
                            Vote Yes
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleVote(selectedProposal.id, VOTE_TYPES.NO)}
                            disabled={voteLoading}
                          >
                            Vote No
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleVote(selectedProposal.id, VOTE_TYPES.ABSTAIN)}
                            disabled={voteLoading}
                          >
                            Abstain
                          </Button>
                        </>
                      )}

                      {selectedProposal.status === STATUS.PASSED && !selectedProposal.executed && (
                        <Button
                          className="mt-4"
                          onClick={() => handleExecute(selectedProposal.id)}
                          disabled={executeLoading}
                        >
                          Execute Proposal
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Create Proposal Dialog */}
          <Dialog
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
          >
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <Form>
                <div className="space-y-4 mt-4">
                  <FormItem>
                    <FormLabel>Quorum Required</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Minimum votes required"
                        value={quorum}
                        onChange={(e) => setQuorum(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Target Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Value (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount in ETH"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>

                  <Button
                    className="w-full mt-4"
                    onClick={handleCreateProposal}
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create Proposal'}
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </div>
  );
}
