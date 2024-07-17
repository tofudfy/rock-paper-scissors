const { ethers } = require("hardhat");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const [_, player2] = await ethers.getSigners();
    const contractAddress = "0xad8dfa16521111872300654cdf020a1748c56037";
    const choices = ["Rock", "Paper", "Scissors"];

    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissorsV2");
    const rps = await RockPaperScissors.attach(contractAddress);

    const gameId = 2;
    const choiceEnum = 1; // Rock: 1, Paper: 2, Scissors: 3
    const secret = "player2_secret";
    const commitment = ethers.solidityPackedKeccak256(["uint8", "string"], [choiceEnum, secret]);

    const joinGameTx = await rps.connect(player2).joinGame(gameId, commitment, { value: ethers.parseEther("0.001") });
    await joinGameTx.wait();
   
    console.log(`Player 2 has submitted the commiment, wait for finalization.`);
    await sleep(12 * 1000);  // await for finalization

    await rps.connect(player2).revealChoice(gameId, choiceEnum, secret);
    console.log(`Player 2 reveals the choice: ${choices[choiceEnum-1]}`);
}


main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
