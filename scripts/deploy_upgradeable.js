// The Open Zeppelin upgrades plugin adds the `upgrades` property
// to the Hardhat Runtime Environment.
const { ethers, network, upgrades } = require("hardhat");

async function main() {
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    console.log("Deploying contract to:", network.name);

    // Get the first account from the list of 20 created for you by Hardhat
    const [account1] = await ethers.getSigners();

    // Deploy logic contract using the proxy pattern.
    const rps = await upgrades.deployProxy(
        RockPaperScissors,
        //Since the logic contract has an initialize() function
        // we need to pass in the arguments to the initialize()
        // function here.
        [account1.address],
        // We don't need to expressly specify this
        // as the Hardhat runtime will default to the name 'initialize'
        { initializer: "initialize" }
    );
    await rps.waitForDeployment();
    console.log("Proxy deployed to:", rps.target);
    // console.log("RockPaperScissors deployed to:", rps);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
