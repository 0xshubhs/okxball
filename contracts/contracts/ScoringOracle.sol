// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScoringOracle
 * @notice Trusted reporters push per-player fantasy points for each gameweek.
 *         In production this is fed by a sports-data oracle; FantasyLeague reads
 *         from it at settlement. Points are signed (red cards etc. can be < 0).
 */
contract ScoringOracle is Ownable {
    // gameweek => tokenId => points
    mapping(uint256 => mapping(uint256 => int256)) private _points;
    mapping(address => bool) public reporters;
    uint256 public currentGameweek = 1;

    event PointsReported(uint256 indexed gw, uint256 indexed tokenId, int256 points);
    event GameweekSet(uint256 gw);
    event ReporterSet(address indexed reporter, bool allowed);

    modifier onlyReporter() {
        require(reporters[msg.sender] || msg.sender == owner(), "not reporter");
        _;
    }

    constructor() Ownable(msg.sender) {
        reporters[msg.sender] = true;
    }

    function setReporter(address r, bool allowed) external onlyOwner {
        reporters[r] = allowed;
        emit ReporterSet(r, allowed);
    }

    function setGameweek(uint256 gw) external onlyOwner {
        currentGameweek = gw;
        emit GameweekSet(gw);
    }

    /// @notice Batch-report points for many players in one tx (matchday efficient).
    function reportPoints(
        uint256 gw,
        uint256[] calldata tokenIds,
        int256[] calldata pts
    ) external onlyReporter {
        require(tokenIds.length == pts.length, "len mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _points[gw][tokenIds[i]] = pts[i];
            emit PointsReported(gw, tokenIds[i], pts[i]);
        }
    }

    function pointsOf(uint256 gw, uint256 tokenId) external view returns (int256) {
        return _points[gw][tokenId];
    }
}
