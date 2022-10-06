// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract GeeTokenStakeProxyAdmin is ProxyAdmin {
    constructor(
        address /*owner*/
    ) ProxyAdmin() {}
}
