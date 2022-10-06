const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    log("----------------------------------------")

    const geeToken = await get("GeeToken")
    const geeTokenAddress = geeToken.address

    const geeTokenStake = await deploy("GeeTokenStake", {
        from: deployer,
        args: [geeTokenAddress],
        log: true,
        waitConfirmations: waitBlockConfirmations,
        value: ethers.utils.parseEther("100"),
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            viaAdminContract: {
                name: "GeeTokenStakeProxyAdmin",
                artifact: "GeeTokenStakeProxyAdmin",
            },
        },
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(geeTokenStake.address, [geeTokenAddress])
    }
}
