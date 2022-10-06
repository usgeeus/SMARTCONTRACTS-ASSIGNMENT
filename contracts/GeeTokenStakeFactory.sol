// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./GeeTokenStakeV2.sol";

contract GeeTokenStakeFactory {
    GeeTokenStakeV2[] public geeTokenStakeV2Array;

    function createGeeTokenStakeV2Contract(address tokenAddress) public {
        GeeTokenStakeV2 geeTokenStakeV2 = new GeeTokenStakeV2(tokenAddress);
        geeTokenStakeV2Array.push(geeTokenStakeV2);
    }

    // f factory
    function fcalculateInterest(
        uint256 _index,
        uint256 basisPoints,
        uint256 geeTokenAmount
    ) public view returns (uint256) {
        //Address
        //ABI - Application Binary Interface
        uint256 newBasisPoints = basisPoints + 100;
        return
            geeTokenStakeV2Array[_index].calculateInterest(
                newBasisPoints,
                geeTokenAmount
            );

        //return (basisPoints * geeTokenAmount) / 10000;
    }

    function getGeeTokenStakeV2Array()
        external
        view
        returns (GeeTokenStakeV2[] memory)
    {
        return geeTokenStakeV2Array;
    }
}
