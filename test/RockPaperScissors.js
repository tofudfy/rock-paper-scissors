const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RockPaperScissors", function () {
  let RockPaperScissors;
  let rps;
  let owner;
  let addr1;
  let addr2;
  let currentTime;
  const GameState = {
    None: 0,
    Created: 1,
    Joined: 2,
    Revealed: 3,
    Expired: 4,
    Settled: 5
  }; 
  const Choice = {
    None: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3
  }; 

  beforeEach(async function () {
    RockPaperScissors = await ethers.getContractFactory("RockPaperScissorsV2");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    rps = await RockPaperScissors.deploy();
    currentTime = Math.floor(Date.now() / 1000);
  });

  it("Should create a game and join", async function () {
    const expiration = currentTime + 60;
    const choice1 = Choice.Rock;
    const commitment1 = ethers.solidityPackedKeccak256(["uint8", "string"], [choice1, "secret1"]);
    await rps.connect(addr1).createGame(commitment1, expiration, { value: ethers.parseEther("1.0") });

    const gameId = 1
    const choice2 = Choice.Scissors;
    const commitment2 = ethers.solidityPackedKeccak256(["uint8", "string"], [choice2, "secret2"]);
    await rps.connect(addr2).joinGame(gameId, commitment2, { value: ethers.parseEther("1.0") });
    /*
    await expect(
        rps.connect(addr2).joinGame(gameId, choice2, { value: ethers.parseEther("1.0") })
    ).to.be.revertedWith('Game not available to join');*/

    const game = await rps.games(gameId);
    expect(game.player1.addr).to.equal(addr1.address);
    expect(game.player2.addr).to.equal(addr2.address);
    expect(game.state).to.equal(GameState.Joined);
  });

  it("Should submit choices and reveal", async function () {
    const expiration = currentTime + 60;
    const bet = "0.2";
    const choice1 = Choice.Rock;
    const commitment1 = ethers.solidityPackedKeccak256(["uint8", "string"], [choice1, "secret1"]);
    await rps.connect(addr1).createGame(commitment1, expiration, { value: ethers.parseEther(bet) });

    const gameId = 1
    const choice2 = Choice.Paper;
    const commitment2 = ethers.solidityPackedKeccak256(["uint8", "string"], [choice2, "secret2"]);
    await rps.connect(addr2).joinGame(gameId, commitment2, { value: ethers.parseEther(bet) });

    await rps.connect(addr2).revealChoice(gameId, choice2, "secret2");
    const balance2Before = await ethers.provider.getBalance(addr2.address);

    let game = await rps.games(gameId);
    expect(game.state).to.equal(GameState.Revealed);

    await rps.connect(addr1).revealChoice(gameId, choice1, "secret1");
    const balance2After = await ethers.provider.getBalance(addr2.address);
    const balance2Delta = balance2After - (balance2Before + ethers.parseEther(bet));

    game = await rps.games(gameId);
    expect(game.state).to.equal(GameState.Settled);

    if (game.player1.choice === game.player2.choice) {
      // expect(balance1Delta).to.equal(ethers.parseEther("0"));
      expect(balance2Delta).to.equal(ethers.parseEther("0"));
    } else if (
      (game.player1.choice == Choice.Rock && game.player2.choice == Choice.Scissors) ||
      (game.player1.choice == Choice.Paper && game.player2.choice == Choice.Rock) ||
      (game.player1.choice == Choice.Scissors && game.player2.choice == Choice.Paper)
    ) {
      // expect(balance1Delta).to.equal(ethers.parseEther("1.0"));
      expect(balance2Delta).to.equal(ethers.parseEther("-" + bet));
    } else {
      // expect(balance1Delta).to.equal(ethers.parseEther("-1.0"));
      expect(balance2Delta).to.equal(ethers.parseEther(bet));
    }
  });
});