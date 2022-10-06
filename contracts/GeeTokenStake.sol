// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error GeeTokenStake__ProductsNotFound();
error GeeTokenStake__NotAssetCreater();
error GeeTokenStake__AlreadyWithdrawed();
error GeeTokenStake__CallFailed();

/** @title ERC20 geeToken Staking
 *  @author Euisin Gee
 *  @notice Stake geeToken and get Eth as interest
 *  @dev ownab
 */
contract GeeTokenStake is Ownable {
    address public geeTokenAddress;

    struct Asset {
        uint256 assetId;
        address walletAddress;
        uint256 createdDate;
        uint256 unlockDate;
        uint256 percentInterest;
        uint256 geeTokenStaked;
        uint256 weiInterest; // Interest ether amount
        bool locked; //staking ongoing or not
    }

    uint256 public totalStakedAmount;
    uint256 public currentAssetId;
    mapping(uint256 => Asset) public assets; //AssetId => Asset
    mapping(address => uint256[]) public assetIdsByAddress; //Address => AssetIds
    mapping(uint256 => uint256) public stakeProducts; //lockPeriods => percentInterest
    uint256[] public lockPeriods;

    constructor(address tokenAddress) payable {
        geeTokenAddress = tokenAddress;
        currentAssetId = 0;
        stakeProducts[30] = 700; //30days => 7% (700basis point == 0.7%)
        stakeProducts[90] = 1000; //90days => 10%
        stakeProducts[180] = 1200; //180days => 12%
        lockPeriods.push(30);
        lockPeriods.push(90);
        lockPeriods.push(180);
    }

    function version() public pure returns (uint256) {
        return 1;
    }

    function stakeGeeToken(uint256 numDays, uint256 tokenQuantity) external {
        if (stakeProducts[numDays] <= 0) {
            revert GeeTokenStake__ProductsNotFound();
        }
        IERC20(geeTokenAddress).transferFrom(
            msg.sender,
            address(this),
            tokenQuantity
        );

        assets[currentAssetId] = Asset(
            currentAssetId,
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            stakeProducts[numDays],
            tokenQuantity,
            calculateInterest(stakeProducts[numDays], tokenQuantity),
            true
        );
        assetIdsByAddress[msg.sender].push(currentAssetId);
        currentAssetId += 1;
        totalStakedAmount += tokenQuantity;
    }

    function withdrawAsset(uint256 assetId) external {
        if (assets[assetId].walletAddress != msg.sender) {
            revert GeeTokenStake__NotAssetCreater();
        }
        if (assets[assetId].locked == false) {
            revert GeeTokenStake__AlreadyWithdrawed();
        }
        assets[assetId].locked = false;
        IERC20(geeTokenAddress).transfer(
            msg.sender,
            assets[assetId].geeTokenStaked
        );
        totalStakedAmount -= assets[assetId].geeTokenStaked;
        if (block.timestamp > assets[assetId].unlockDate) {
            uint256 amount = assets[assetId].weiInterest;
            (bool callSuccess, ) = payable(msg.sender).call{value: amount}("");
            if (!callSuccess) {
                revert GeeTokenStake__CallFailed();
            }
        }
    }

    function modifyLockPeriods(uint256 numDays, uint256 basisPoints)
        external
        onlyOwner
    {
        stakeProducts[numDays] = basisPoints;
        lockPeriods.push(numDays);
    }

    function getLockPeriods() external view returns (uint256[] memory) {
        return lockPeriods;
    }

    function getInterestRate(uint256 numDays) external view returns (uint256) {
        return stakeProducts[numDays];
    }

    function getAssetById(uint256 assetId)
        external
        view
        returns (Asset memory)
    {
        return assets[assetId];
    }

    function getAssetIdsByAddress(address walletAddress)
        external
        view
        returns (uint256[] memory)
    {
        return assetIdsByAddress[walletAddress];
    }

    function changeUnlockDate(uint256 assetId, uint256 newUnlockDate)
        external
        onlyOwner
    {
        assets[assetId].unlockDate = newUnlockDate;
    }

    function calculateInterest(uint256 basisPoints, uint256 geeTokenAmount)
        private
        pure
        returns (uint256)
    {
        return (basisPoints * geeTokenAmount) / 10000; //700 * geeToken / 10000
    }
}
