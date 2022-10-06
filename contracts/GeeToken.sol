// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GeeToken is Ownable, ERC20Snapshot {
    constructor() ERC20("GeeToken", "GEE") {
        _mint(msg.sender, 5000 * 10**uint256(decimals()));
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    function snapshot() external {
        _snapshot();
    }
}
