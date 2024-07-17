# Rock Paper Scissors Smart Contract

This project implements a Rock Paper Scissors full onchain game using Solidity smart contracts. Players can create and join games, commit their choices, and reveal them to determine the winner. The contract is designed for learning purposes and is deployed to the Sepolia testnet.

## Features

- **Create Game**: Player 1 can create a game with a choice commitment.
- **Cancle Game**: Player 1 can cancle a game before anyone join the game.
- **Join Game**: Player 2 can join the game with a matching stake and choice.
- **Reveal Choice**: Player1 reveals his choice to determine the winner.
- **Exception**: Player2 win the game if the game is expired.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 is better)
- [Hardhat](https://hardhat.org/)

## Getting Started

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/tofudfy/rock-paper-scissors.git
   cd rock-paper-scissors
   ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Configuration
    Create a .env file in the root directory and add your Ethereum testnet provider and private key:

    ```env
    SEPOLIA_RPC_URL=your_infura_rpc_url
    PRIVATE_KEYS=your_private_keys // multiple keys split with ','
    ETHERSCAN_API_KEY=your_etherscan_api
    ```

4. Compilation
    Compile the smart contract:

    ```sh
    npx hardhat compile
    ```

5. Testing
    To run the tests, use the following command:

    ```sh
    npx hardhat test
    ```

6. Deployment & Verify
    Deploy the contract to the Ethereum testnet:

    ```sh
    npx hardhat run scripts/deploy.js --network sepolia
    npx hardhat run scripts/deploy_upgradeable.js --network sepolia
    ```

    (Optional) Verify the contract deployed to the Ethereum testnet:

    ```sh
    npx hardhat verify --network sepolia <PROXY_ADDRESS>
    ```

7. Interaction
    Create a game with Player 1:

    ```sh
    npx hardhat run scripts/player1.js --network sepolia
    ```

    Join the game with Player 2:

    ```sh
    npx hardhat run scripts/player2.js --network sepolia
    ```

    The player1.js will wait and reveal the choice once the choice of player2 is submitted.

### Contract Details

`RockPaperScissors.sol`: The main smart contract implementing the Rock Paper Scissors game logic.

Deployment example:
| Network | Address                                   |
|---------|-------------------------------------------|
| Sepolia | 0xad8dfa16521111872300654cdf020a1748c56037|

### Event Handling

The contract emits several events for interaction:

- **GameCreated**: Emitted when a game is created.
- **GameJoined**: Emitted when a game is joined.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
