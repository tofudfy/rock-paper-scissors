// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract RockPaperScissorsV2 is ReentrancyGuardUpgradeable {
    enum Choice { None, Rock, Paper, Scissors }
    enum GameState { None, Created, Joined, Revealed, Expired, Settled }

    struct Player {
        address payable addr;
        uint256 stake;
        bytes32 commitment;
        Choice choice;
    }

    struct Game {
        Player player1;
        Player player2;
        GameState state;
        uint256   expiration;
    }

    event GameCreated(
        uint256 gameID,
        address creator,
        uint256 bet,
        uint256 createTime,
        uint256 expiration
    );

    event GameJoined(
        uint256 gameId,
        // address creator,
        address player,
        // uint256 bet,
        uint256 joinTime,
        uint256 expiration
    );

    event GameRevealed(
        uint256 gameId,
        address player,
        uint256 revealTime
    );

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;
    address admin;
    
    modifier onlyPlayer(uint256 gameId) {
        require(
            msg.sender == games[gameId].player1.addr || msg.sender == games[gameId].player2.addr,
            "Not a player"
        );
        _;
    }

    // Ensure that the initializer function exists,
    // specify an existing function with the 'initializer' option, 
    // or set the 'initializer' option to false to omit the initializer call.
    function initialize(address _admin) public initializer {
        admin = _admin;
    }

    function createGame(bytes32 _commitment, uint256 expiration) 
        external 
        payable 
    {
        require(msg.value > 0, "Stake must be greater than 0");
        require(expiration > block.timestamp, "Expiration must be greater than current block time");

        gameCounter++;
        games[gameCounter] = Game({
            player1: Player(payable(msg.sender), msg.value, _commitment, Choice.None),
            player2: Player(payable(address(0)), 0, 0, Choice.None),
            state: GameState.Created,
            expiration: expiration
        });

        emit GameCreated(
            gameCounter,
            msg.sender,
            msg.value,
            block.timestamp,
            expiration
        );
    }

    function cancelGame(uint256 gameId) 
        external
        onlyPlayer(gameId) 
        nonReentrant
    {
        Game storage game = games[gameId];
        require(game.state == GameState.Created, "Game not available to cancel");

        game.player1.addr.transfer(game.player1.stake);
        delete games[gameId];
    }

    function joinGame(uint256 gameId, bytes32 _commitment) 
        external
        payable
    {
        Game storage game = games[gameId];
        require(game.state == GameState.Created, "Game not available to join");
        require(msg.value == game.player1.stake, "Stake must match");
        require(block.timestamp <= game.expiration, "Game is expired");
        require(msg.sender != game.player1.addr, "Game should have different player");
        require(_commitment != game.player1.commitment, "Suspicious of copy, try other commitment");

        game.player2 = Player(payable(msg.sender), msg.value, _commitment, Choice.None);
        game.state = GameState.Joined;

        // extend the expiration for 1 hr
        if(block.timestamp + 3600 > game.expiration) {
            game.expiration = block.timestamp + 3600; 
        }

        emit GameJoined(
            gameId,
            msg.sender,
            block.timestamp,
            game.expiration
        );
    }

    function revealChoice(uint256 gameId, Choice _choice, string memory _secret) 
        external 
        onlyPlayer(gameId)
        nonReentrant 
    {
        Game storage game = games[gameId];
        require(
            game.state == GameState.Joined || game.state == GameState.Revealed, 
            "Game not in correct state"
        );

        bytes32 commitment = keccak256(abi.encodePacked(_choice, _secret));

        if (msg.sender == game.player1.addr) {
            require(commitment == game.player1.commitment, "Invalid reveal");
            game.player1.choice = _choice;
        } else {
            require(commitment == game.player2.commitment, "Invalid reveal");
            game.player2.choice = _choice;
        }

        if (game.player1.choice != Choice.None && game.player2.choice != Choice.None) {
            determineWinner(gameId);
        } else {
            game.state = GameState.Revealed;

            emit GameRevealed(
                gameId,
                msg.sender,
                block.timestamp
            );
        }
    }

    function determineWinner(uint256 gameId) private {
        Game storage game = games[gameId];

        if (game.player1.choice == game.player2.choice) {
            game.player1.addr.transfer(game.player1.stake);
            game.player2.addr.transfer(game.player2.stake);
        } else if (
            (game.player1.choice == Choice.Rock && game.player2.choice == Choice.Scissors) ||
            (game.player1.choice == Choice.Paper && game.player2.choice == Choice.Rock) ||
            (game.player1.choice == Choice.Scissors && game.player2.choice == Choice.Paper)
        ) {
            game.player1.addr.transfer(game.player1.stake + game.player2.stake);
        } else {
            game.player2.addr.transfer(game.player1.stake + game.player2.stake);
        }

        game.state = GameState.Settled;
    }

    function refundBet(uint256 gameId) 
        external
        onlyPlayer(gameId)
        nonReentrant
    {
        Game storage game = games[gameId];
        require(game.state == GameState.Revealed, "Game not in correct state");
        require(block.timestamp > game.expiration, "Game is not expired");

        if (game.player1.choice != Choice.None && game.player2.choice != Choice.None) {
            determineWinner(gameId);
        } else if (game.player1.choice != Choice.None) {
            game.player1.addr.transfer(game.player1.stake + game.player2.stake);
            game.state = GameState.Expired;
        } else {
            game.player2.addr.transfer(game.player1.stake + game.player2.stake);
            game.state = GameState.Expired;
        }
    }

}