const { developmentChains } = require("../helper-hardhat-config")
const { network, deployments, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

async function main() {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6

    log("----------------------------------------------------")

    const geeTokenStake = await ethers.getContract("GeeTokenStake")
    const transparentProxy = await ethers.getContract("GeeTokenStake_Proxy")
    const proxyGeeTokenStake = await ethers.getContractAt(
        "GeeTokenStake",
        transparentProxy.address
    )
    let version = await proxyGeeTokenStake.version()
    console.log("version1's version() :", version.toString())

    log("----------------------V1----------------------------")

    // Upgrade!
    // Not "the hardhat-deploy way"
    const geeTokenStakeProxyAdmin = await ethers.getContract(
        "GeeTokenStakeProxyAdmin"
    )
    const geeTokenStakeV2 = await ethers.getContract("GeeTokenStakeV2")
    const upgradeTx = await geeTokenStakeProxyAdmin.upgrade(
        transparentProxy.address,
        geeTokenStakeV2.address
    )
    await upgradeTx.wait(1)
    const proxyGeeTokenStakeV2 = await ethers.getContractAt(
        "GeeTokenStakeV2",
        transparentProxy.address
    )
    version = await proxyGeeTokenStakeV2.version()
    console.log("version2's version() :", version.toString())

    log("---------------------V2------------------------------")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
//yarn hardhat run scripts/deploy-upgradeable_geeTokenStake.js --network localhost
