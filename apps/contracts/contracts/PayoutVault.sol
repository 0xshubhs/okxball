// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayoutVault
 * @notice Holds league prize funds (OKB) and lets winners claim instantly.
 *         Authorized distributors (the FantasyLeague contract) allocate
 *         winnings; managers pull them with `claim`. Mirrors the "instant
 *         payout via OKX DEX liquidity" flow.
 */
contract PayoutVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) public claimable;
    mapping(address => bool) public distributors;

    event Funded(address indexed from, uint256 amount);
    event Allocated(address indexed manager, uint256 amount);
    event Claimed(address indexed manager, uint256 amount);
    event DistributorSet(address indexed distributor, bool allowed);

    modifier onlyDistributor() {
        require(distributors[msg.sender] || msg.sender == owner(), "not distributor");
        _;
    }

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function fund() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function setDistributor(address d, bool allowed) external onlyOwner {
        distributors[d] = allowed;
        emit DistributorSet(d, allowed);
    }

    /// @notice Credit winnings to managers. Called by the league at settlement.
    function allocate(
        address[] calldata managers,
        uint256[] calldata amounts
    ) external onlyDistributor {
        require(managers.length == amounts.length, "len mismatch");
        for (uint256 i = 0; i < managers.length; i++) {
            claimable[managers[i]] += amounts[i];
            emit Allocated(managers[i], amounts[i]);
        }
    }

    /// @notice Pull all winnings to the caller. `leagueId` kept for the dApp ABI.
    function claim(uint256 /* leagueId */) external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "nothing to claim");
        claimable[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "payout failed");
        emit Claimed(msg.sender, amount);
    }
}
