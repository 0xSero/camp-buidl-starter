import { useState } from 'react'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { parseAbi } from 'viem'
import Head from 'next/head'
import { Navbar } from '@/components/Navbar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NFTExample() {
  const [skill, setSkill] = useState<string>('0')
  const [patience, setPatience] = useState<string>('100')
  const [isFrustrated, setIsFrustrated] = useState<boolean>(true)
  const { address } = useAccount()

  // Example NFT contract - replace with your contract address
  const CONTRACT_ADDRESS = '0x7134f141170D48E7BC5Cd1048ab9712D6bb32510'
  const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "id2",
          "type": "uint256"
        }
      ],
      "name": "breed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_skill",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_patience",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_isFrustrated",
          "type": "bool"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "choice",
          "type": "bool"
        }
      ],
      "name": "updateFrustrated",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getPeople",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "skill",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "patience",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isFrustrated",
              "type": "bool"
            }
          ],
          "internalType": "struct BuidlMons.People",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  })

  const { writeContract, isPending: isLoading, isSuccess } = useContractWrite()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Head>
        <title>NFT Example | CampBuidl</title>
        <meta content="Example of NFT contract interactions" name="description" />
      </Head>

      <Navbar />

      <main className="container mx-auto p-8 max-w-4xl">
        <div className="text-center mb-16 py-12 px-4">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            NFT Contract Example
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how to interact with NFT contracts, including minting and checking balances.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your NFT Balance</CardTitle>
              <CardDescription>View your current NFT holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl">{balance?.toString() || '0'} NFTs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mint NFT</CardTitle>
              <CardDescription>Create a new NFT by specifying a token ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Skill</label>
                <input
                  type="number"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="border rounded px-3 py-2 w-full max-w-xs"
                  placeholder="Enter skill here"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Patience</label>
                <input
                  type="number"
                  value={patience}
                  onChange={(e) => setPatience(e.target.value)}
                  className="border rounded px-3 py-2 w-full max-w-xs"
                  placeholder="Enter Patience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IsFrustrated</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="frustrated-true"
                      name="isFrustrated"
                      value="true"
                      checked={isFrustrated === true}
                      onChange={(e) => setIsFrustrated(e.target.value === "true")}
                      className="mr-2"
                    />
                    <label htmlFor="frustrated-true">Yes</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="frustrated-false"
                      name="isFrustrated"
                      value="false"
                      checked={isFrustrated === false}
                      onChange={(e) => setIsFrustrated(e.target.value === "true" ? true : false)}
                      className="mr-2"
                    />
                    <label htmlFor="frustrated-false">No</label>
                  </div>
                </div>
              </div>
              <button
                onClick={() => writeContract({
                  address: CONTRACT_ADDRESS as `0x${string}`,
                  abi: CONTRACT_ABI,
                  functionName: 'mint',
                  args: [BigInt(skill || '0'), BigInt(patience || '0'), isFrustrated]
                })}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </button>
              {isSuccess && (
                <div className="text-green-500">
                  Successfully minted NFT!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Example</CardTitle>
              <CardDescription>Learn how to interact with NFT contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-black p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-blue-50">{`// Mint NFT Example
const { writeContract } = useContractWrite();

writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'mint',
  args: [address, tokenId]
});`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
