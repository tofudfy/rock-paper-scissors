const { ethers, network } = require("hardhat");

async function main() {
    console.log("Deploying contract to:", network.name);
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissorsV2");
    const rps = await RockPaperScissors.deploy();
    await rps.waitForDeployment();

    console.log("RockPaperScissors deployed to:", rps.target);
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
