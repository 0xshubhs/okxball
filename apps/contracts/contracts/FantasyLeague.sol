// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPlayerNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IScoringOracle {
    function pointsOf(uint256 gw, uint256 tokenId) external view returns (int256);
}

interface IPayoutVault {
    function allocate(address[] calldata managers, uint256[] calldata amounts) external;
}

/**
 * @title FantasyLeague
 * @notice The on-chain fantasy league. Managers join (paying an OKB entry fee
 *         into the PayoutVault), submit a lineup of Player NFTs they own with a
 *         captain, then the league settles using ScoringOracle data and
 *         allocates the prize pool to the winner.
 */
contract FantasyLeague is Ownable {
    struct League {
        uint256 entryFee;
        uint256 gameweek;
        uint256 prizePool;
        bool locked;
        bool settled;
        address[] managers;
    }

    struct Lineup {
        uint256[] tokenIds;
        uint256 captain;
        bool submitted;
    }

    IPlayerNFT public playerNFT;
    IScoringOracle public oracle;
    IPayoutVault public vault;

    uint256 public nextLeagueId = 1;
    mapping(uint256 => League) public leagues;
    mapping(uint256 => mapping(address => Lineup)) public lineups;
    mapping(uint256 => mapping(address => bool)) public joined;
    mapping(uint256 => mapping(address => uint256)) public scores;

    event LeagueCreated(uint256 indexed leagueId, uint256 entryFee, uint256 gameweek);
    event Joined(uint256 indexed leagueId, address indexed manager);
    event LineupSubmitted(uint256 indexed leagueId, address indexed manager, uint256 captain);
    event Settled(uint256 indexed leagueId, address winner, uint256 topScore);

    constructor(address _nft, address _oracle, address _vault) Ownable(msg.sender) {
        playerNFT = IPlayerNFT(_nft);
        oracle = IScoringOracle(_oracle);
        vault = IPayoutVault(_vault);
    }

    function createLeague(uint256 entryFee, uint256 gameweek)
        external
        onlyOwner
        returns (uint256 leagueId)
    {
        require(gameweek != 0, "gw 0 reserved");
        leagueId = nextLeagueId++;
        League storage l = leagues[leagueId];
        l.entryFee = entryFee;
        l.gameweek = gameweek;
        emit LeagueCreated(leagueId, entryFee, gameweek);
    }

    function joinLeague(uint256 leagueId) external payable {
        League storage l = leagues[leagueId];
        require(l.gameweek != 0, "no league");
        require(!l.locked, "locked");
        require(!joined[leagueId][msg.sender], "already joined");
        require(msg.value >= l.entryFee, "fee too low");

        joined[leagueId][msg.sender] = true;
        l.managers.push(msg.sender);
        l.prizePool += msg.value;

        // Forward entry fee into the prize vault.
        (bool ok, ) = payable(address(vault)).call{value: msg.value}("");
        require(ok, "fund vault failed");

        emit Joined(leagueId, msg.sender);
    }

    function submitLineup(
        uint256 leagueId,
        uint256[] calldata tokenIds,
        uint256 captain
    ) external {
        require(joined[leagueId][msg.sender], "not joined");
        require(!leagues[leagueId].locked, "locked");

        bool capIncluded = false;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(playerNFT.ownerOf(tokenIds[i]) == msg.sender, "not owner of token");
            if (tokenIds[i] == captain) capIncluded = true;
        }
        require(capIncluded, "captain not in lineup");

        lineups[leagueId][msg.sender] = Lineup(tokenIds, captain, true);
        emit LineupSubmitted(leagueId, msg.sender, captain);
    }

    function lock(uint256 leagueId) external onlyOwner {
        leagues[leagueId].locked = true;
    }

    /// @notice Tally scores from the oracle and split the pool 50/30/20 to the
    ///         top three managers. Normalised over the filled places so the
    ///         whole pool is always distributed (1 manager -> 100%, etc.).
    function settle(uint256 leagueId) external onlyOwner {
        League storage l = leagues[leagueId];
        require(l.locked, "not locked");
        require(!l.settled, "settled");
        l.settled = true;

        // 1) tally every manager's score (captain counts double)
        for (uint256 m = 0; m < l.managers.length; m++) {
            address mgr = l.managers[m];
            Lineup storage lu = lineups[leagueId][mgr];
            uint256 total;
            for (uint256 i = 0; i < lu.tokenIds.length; i++) {
                int256 p = oracle.pointsOf(l.gameweek, lu.tokenIds[i]);
                if (p > 0) {
                    uint256 up = uint256(p);
                    if (lu.tokenIds[i] == lu.captain) up *= 2;
                    total += up;
                }
            }
            scores[leagueId][mgr] = total;
        }

        // 2) find the top 3 managers by score (positive scores only)
        address[3] memory top;
        uint256[3] memory topScore;
        for (uint256 m = 0; m < l.managers.length; m++) {
            address mgr = l.managers[m];
            uint256 s = scores[leagueId][mgr];
            if (s == 0) continue;
            if (s > topScore[0]) {
                top[2] = top[1];
                topScore[2] = topScore[1];
                top[1] = top[0];
                topScore[1] = topScore[0];
                top[0] = mgr;
                topScore[0] = s;
            } else if (s > topScore[1]) {
                top[2] = top[1];
                topScore[2] = topScore[1];
                top[1] = mgr;
                topScore[1] = s;
            } else if (s > topScore[2]) {
                top[2] = mgr;
                topScore[2] = s;
            }
        }

        // 3) split 50/30/20 normalised over filled places
        uint16[3] memory bps = [uint16(5000), 3000, 2000];
        uint256 places;
        uint256 sumBps;
        for (uint256 i = 0; i < 3; i++) {
            if (top[i] != address(0)) {
                places++;
                sumBps += bps[i];
            }
        }

        if (places > 0 && l.prizePool > 0) {
            address[] memory ms = new address[](places);
            uint256[] memory amts = new uint256[](places);
            uint256 distributed;
            uint256 idx;
            for (uint256 i = 0; i < 3; i++) {
                if (top[i] == address(0)) continue;
                ms[idx] = top[i];
                uint256 amt = (l.prizePool * bps[i]) / sumBps;
                amts[idx] = amt;
                distributed += amt;
                idx++;
            }
            // integer-division dust goes to 1st place
            if (distributed < l.prizePool) {
                amts[0] += l.prizePool - distributed;
            }
            vault.allocate(ms, amts);
        }

        emit Settled(leagueId, top[0], topScore[0]);
    }

    function scoreOf(uint256 leagueId, address manager) external view returns (uint256) {
        return scores[leagueId][manager];
    }

    function managersOf(uint256 leagueId) external view returns (address[] memory) {
        return leagues[leagueId].managers;
    }

    /// @notice Read a manager's submitted lineup (the auto-getter omits the
    ///         dynamic tokenIds array, so this exposes it explicitly).
    function getLineup(uint256 leagueId, address manager)
        external
        view
        returns (uint256[] memory tokenIds, uint256 captain, bool submitted)
    {
        Lineup storage lu = lineups[leagueId][manager];
        return (lu.tokenIds, lu.captain, lu.submitted);
    }
}
