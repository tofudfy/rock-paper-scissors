
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Check this address is right before deploying.
    const deployedProxyAddress = "0xad8dfa16521111872300654cdf020a1748c56037";
        const RockPaperScissorsV2 = await ethers.getContractFactory(
        "RockPaperScissorsV2"
    );

    console.log("Upgrading RockPaperScissors...");
    await upgrades.upgradeProxy(deployedProxyAddress, RockPaperScissorsV2);
    console.log("RockPaperScissors upgraded");
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
