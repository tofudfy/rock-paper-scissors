const { ethers } = require("hardhat");

async function main() {
    const [player1] = await ethers.getSigners();
    const contractAddress = "0xAD8dFA16521111872300654cDF020A1748C56037";

    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    const rps = await RockPaperScissors.attach(contractAddress);

    // Generate a random choice
    const choices = ["Rock", "Paper", "Scissors"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    const choice = choices[randomIndex];
    const secret = "player1_secret"; // A secret for generating the hash
    const choiceEnum = randomIndex + 1; // Rock: 1, Paper: 2, Scissors: 3

    // Generate expiration
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 3600;

    // Generate the commitment
    const commitment = ethers.solidityPackedKeccak256(["uint8", "string"], [choiceEnum, secret]);

    // Create a game
    // console.log(`Player 1 is creating a game with choice: ${choice}`);
    const createGameTx = await rps.connect(player1).createGame(commitment, expiration, { value: ethers.parseEther("0.005") });
    const receipt = await createGameTx.wait();

    const gameId = receipt.logs[0].args[0];
    console.log(`Player 1 has created the game with ID: ${gameId}`);

    // Listen for the GameJoined event
    rps.on("GameJoined", async (joinedGameId, player, timestamp, expiration) => {
        if (joinedGameId == gameId) {
            console.log(`Player 2 has joined the game with ID: ${gameId}`);

            // Reveal the choice
            console.log(`Player 1 is revealing the choice: ${choice}`);
            await rps.connect(player1).revealChoice(gameId, choiceEnum, secret);

            console.log("Choice revealed successfully!");

            // Unsubscribe from the event
            rps.off("GameJoined");
        }
    });

    console.log("Waiting for Player 2 to join...");
}

main()
.catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
