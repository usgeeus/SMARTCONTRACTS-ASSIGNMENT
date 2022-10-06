// We are going to skimp a bit on these tests...
const { assert } = require("chai")
const { network, deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

describe("Upgrading tests", function () {
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    let geeTokenStake,
        transparentProxy,
        proxyGeeTokenStake,
        geeTokenStakeProxyAdmin,
        deployer
    const { deploy } = deployments

    beforeEach(async () => {
        const { deployer: deployerTemp } = await getNamedAccounts()
        deployer = deployerTemp
        await deployments.fixture(["geeToken"])
        geeToken = await deploy("GeeToken", {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: waitBlockConfirmations,
        })

        //geeToken = await ethers.getContract("GeeToken")
        geeTokenAddress = geeToken.address
        await deployments.fixture(["geeTokenStake"])
        geeTokenStake = await deploy("GeeTokenStake", {
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

        //   geeTokenStake = await ethers.getContract("GeeTokenStake")
        transparentProxy = await ethers.getContract("GeeTokenStake_Proxy")
        proxyGeeTokenStake = await ethers.getContractAt(
            "GeeTokenStake",
            transparentProxy.address
        )
        geeTokenStakeProxyAdmin = await ethers.getContract(
            "GeeTokenStakeProxyAdmin"
        )
    })
    it("can deploy and upgrade a contract", async function () {
        const startingVersion = await proxyGeeTokenStake.version()
        assert.equal(startingVersion.toString(), "1")
        await deployments.fixture(["geeTokenStakeV2"])
        geeTokenStakeV2 = await deploy("GeeTokenStakeV2", {
            from: deployer,
            args: [geeTokenAddress],
            log: true,
            waitConfirmations: waitBlockConfirmations,
            value: ethers.utils.parseEther("100"),
        })

        //   const geeTokenStakeV2 = await ethers.getContract(
        //       "GeeTokenStakeV2"
        //   )
        const upgradeTx = await geeTokenStakeProxyAdmin.upgrade(
            transparentProxy.address,
            geeTokenStakeV2.address
        )
        await upgradeTx.wait(1)
        const endingVersion = await proxyGeeTokenStake.version()
        assert.equal(endingVersion.toString(), "2")
    })
})
