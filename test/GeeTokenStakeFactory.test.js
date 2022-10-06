const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
describe("GeeTokenStakeFactory", () => {
    beforeEach(async () => {
        ;[owner] = await ethers.getSigners()
        const GeeToken = await ethers.getContractFactory("GeeToken", owner)
        geeToken = await GeeToken.deploy()

        const GeeTokenStakeFactory = await ethers.getContractFactory(
            "GeeTokenStakeFactory",
            owner
        )
        geeTokenStakeFactory = await GeeTokenStakeFactory.deploy()
        console.log(geeTokenStakeFactory.address)
    })
    it("create GeeTokenStakeV2 contract", async function () {
        const array = await geeTokenStakeFactory.getGeeTokenStakeV2Array()
        console.log(array)
        expect(await geeTokenStakeFactory.getGeeTokenStakeV2Array()).to.eql([])
        await geeTokenStakeFactory.createGeeTokenStakeV2Contract(
            geeToken.address
        )
        const geeTokenStakeV2Array =
            await geeTokenStakeFactory.getGeeTokenStakeV2Array()
        expect(geeTokenStakeV2Array.length).to.equal(1)
    })
    it("changed logic of calculateInterest", async function () {
        await geeTokenStakeFactory.createGeeTokenStakeV2Contract(
            geeToken.address
        )
        const lastArray = await geeTokenStakeFactory.getGeeTokenStakeV2Array()
        console.log("lastArray length : ", lastArray.length)
        expect(
            await geeTokenStakeFactory.fcalculateInterest(
                lastArray.length - 1,
                700,
                100
            )
        ).to.equal(8)
    })
})
