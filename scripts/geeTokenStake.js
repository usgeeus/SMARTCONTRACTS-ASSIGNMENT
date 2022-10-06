const { ethers } = require("hardhat")

async function main() {
    ;[owner] = await ethers.getSigners()
    const GeeTokenStake = await ethers.getContractFactory(
        "GeeTokenStake",
        owner
    )
    const GeeToken = await ethers.getContractFactory("GeeToken", owner)
    geeToken = await GeeToken.deploy()

    const geeTokenStake = await GeeTokenStake.deploy(geeToken.address, {
        value: ethers.utils.parseEther("100"),
    })

    console.log("GeeTokenStake:", geeTokenStake.address)
    console.log("GeeToken:", geeToken.address)

    const provider = geeTokenStake.provider
    let data
    let transaction
    let receipt
    let block
    let newUnlockDate

    await geeToken
        .connect(owner)
        .approve(geeTokenStake.address, ethers.utils.parseEther("35"))
    await geeTokenStake
        .connect(owner)
        .stakeGeeToken(30, ethers.utils.parseEther("35"))

    await geeToken
        .connect(owner)
        .approve(geeTokenStake.address, ethers.utils.parseEther("10"))
    await geeTokenStake
        .connect(owner)
        .stakeGeeToken(90, ethers.utils.parseEther("10"))

    await geeToken
        .connect(owner)
        .approve(geeTokenStake.address, ethers.utils.parseEther("5"))
    transaction = await geeTokenStake
        .connect(owner)
        .stakeGeeToken(180, ethers.utils.parseEther("5"))
    receipt = await transaction.wait()
    block = await provider.getBlock(receipt.blockNumber)
    newUnlockDate = block.timestamp - 60 * 60 * 24 * 100
    await geeTokenStake.connect(owner).changeUnlockDate(2, newUnlockDate)
}

// yarn hardhat run --network localhost scripts/geeTokenStake.js

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
