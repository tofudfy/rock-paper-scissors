const { ethers } = require("hardhat");

async function main() {
    const [_, player2] = await ethers.getSigners();
    const contractAddress = "0xAD8dFA16521111872300654cDF020A1748C56037";
    const choices = ["Rock", "Paper", "Scissors"];

    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    const rps = await RockPaperScissors.attach(contractAddress);

    const gameId = 1;
    const choiceIndex = 1; // Rock: 1, Paper: 2, Scissors: 3
    const joinGameTx = await rps.connect(player2).joinGame(gameId, choiceIndex, { value: ethers.parseEther("0.005") });
    await joinGameTx.wait(); 
    console.log(`Player 2 picks the choice: ${choices[choiceIndex-1]}`);
}


main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
