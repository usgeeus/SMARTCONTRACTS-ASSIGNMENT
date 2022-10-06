const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

describe("GeeTokenStake", () => {
    beforeEach(async () => {
        ;[owner, signer2] = await ethers.getSigners()

        const GeeToken = await ethers.getContractFactory("GeeToken", signer2)
        geeToken = await GeeToken.deploy()

        GeeTokenStake = await ethers.getContractFactory("GeeTokenStake", owner)
        geeTokenStake = await GeeTokenStake.deploy(geeToken.address, {
            value: ethers.utils.parseEther("10"),
        })

        await geeToken
            .connect(signer2)
            .approve(geeTokenStake.address, ethers.utils.parseEther("10"))
        const transaction = await geeTokenStake
            .connect(signer2)
            .stakeGeeToken(30, ethers.utils.parseEther("10"))
        const receipt = await transaction.wait()
        block = await geeTokenStake.provider.getBlock(receipt.blockNumber)
    })
    describe("deploy", function () {
        it("should set owner", async function () {
            expect(await geeTokenStake.owner()).to.equal(owner.address)
        })
        it("sets up stakeProducts and lockPeriod", async function () {
            expect(await geeTokenStake.lockPeriods(0)).to.equal(30)
            expect(await geeTokenStake.lockPeriods(1)).to.equal(90)
            expect(await geeTokenStake.lockPeriods(2)).to.equal(180)

            expect(await geeTokenStake.stakeProducts(30)).to.equal(700)
            expect(await geeTokenStake.stakeProducts(90)).to.equal(1000)
            expect(await geeTokenStake.stakeProducts(180)).to.equal(1200)
        })
    })
    describe("stakeGeeToken", () => {
        it("transfers tokens", async () => {
            const signerBalance = await geeToken.balanceOf(signer2.address)
            expect(signerBalance).to.equal(ethers.utils.parseEther("4990"))
            const contractBalance = await geeToken.balanceOf(
                geeTokenStake.address
            )
            expect(contractBalance).to.equal(ethers.utils.parseEther("10"))
        })

        it("creates an asset", async () => {
            const assetIds = await geeTokenStake
                .connect(signer2)
                .getAssetIdsByAddress(signer2.address)
            expect(assetIds.length).to.equal(1)

            const asset = await geeTokenStake
                .connect(signer2)
                .getAssetById(assetIds[0])

            expect(asset.assetId).to.equal(0)
            expect(asset.walletAddress).to.equal(signer2.address)
            expect(asset.createdDate).to.equal(block.timestamp)
            expect(asset.unlockDate).to.equal(block.timestamp + 86400 * 30)
            expect(asset.geeTokenStaked).to.equal(ethers.utils.parseEther("10"))
            const weiInterestAmount = (10 * 700) / 10000
            expect(asset.weiInterest).to.equal(
                ethers.utils.parseEther(weiInterestAmount.toString())
            )
            expect(asset.percentInterest).to.equal(700)
            expect(asset.locked).to.equal(true)
        })
        it("adds address and assetId to assetIdsByAddress", async () => {
            expect(
                await geeTokenStake.assetIdsByAddress(signer2.address, 0)
            ).to.equal(0)
        })
        it("increments positionId", async () => {
            expect(await geeTokenStake.currentAssetId()).to.equal(1)
        })
        it("increases total amount of staked token", async () => {
            expect(await geeTokenStake.totalStakedAmount()).to.equal(
                ethers.utils.parseEther("10")
            )
        })
    })
    describe("withdrawAsset", () => {
        beforeEach(async () => {
            provider = geeTokenStake.provider
            contractEthbalanceBefore = await provider.getBalance(
                geeTokenStake.address
            )
            signerEthBalanceBefore = await provider.getBalance(signer2.address)
        })
        it("withdraw after unlock date, returns tokens+weiInterest", async () => {
            const block = await provider.getBlock()
            const newUnlockDate = block.timestamp - 86400 * 100
            await geeTokenStake
                .connect(owner)
                .changeUnlockDate(0, newUnlockDate)
            const transaction = await geeTokenStake
                .connect(signer2)
                .withdrawAsset(0)
            const receipt = await transaction.wait()
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)

            expect(contractEthbalanceBefore).to.equal(
                ethers.utils.parseEther("10")
            )
            const contractEthBalanceAfter = await provider.getBalance(
                geeTokenStake.address
            )
            const signerEthBalanceAfter = await provider.getBalance(
                signer2.address
            )

            const assetIds = await geeTokenStake
                .connect(signer2)
                .getAssetIdsByAddress(signer2.address)
            const asset = await geeTokenStake
                .connect(signer2)
                .getAssetById(assetIds[0])
            expect(signerEthBalanceAfter).to.equal(
                signerEthBalanceBefore.add(asset.weiInterest).sub(gasUsed)
            )
            expect(contractEthBalanceAfter).to.equal(
                contractEthbalanceBefore.sub(asset.weiInterest)
            )

            const signerBalance = await geeToken.balanceOf(signer2.address)
            expect(signerBalance).to.equal(ethers.utils.parseEther("5000"))
            const contractBalance = await geeToken.balanceOf(
                geeTokenStake.address
            )
            expect(contractBalance).to.equal(ethers.utils.parseEther("0"))
            expect(asset.locked).to.equal(false)
        })
        it("withdraw before unlock date, returns tokens only", async () => {
            const transaction = await geeTokenStake
                .connect(signer2)
                .withdrawAsset(0)
            const receipt = await transaction.wait()
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice)

            expect(contractEthbalanceBefore).to.equal(
                ethers.utils.parseEther("10")
            )
            const contractEthBalanceAfter = await provider.getBalance(
                geeTokenStake.address
            )
            const signerEthBalanceAfter = await provider.getBalance(
                signer2.address
            )

            const assetIds = await geeTokenStake
                .connect(signer2)
                .getAssetIdsByAddress(signer2.address)
            const asset = await geeTokenStake
                .connect(signer2)
                .getAssetById(assetIds[0])
            expect(signerEthBalanceAfter).to.equal(
                signerEthBalanceBefore.sub(gasUsed)
            )
            expect(contractEthBalanceAfter).to.equal(contractEthbalanceBefore)

            const signerBalance = await geeToken.balanceOf(signer2.address)
            expect(signerBalance).to.equal(ethers.utils.parseEther("5000"))
            const contractBalance = await geeToken.balanceOf(
                geeTokenStake.address
            )
            expect(contractBalance).to.equal(ethers.utils.parseEther("0"))
            expect(asset.locked).to.equal(false)
        })
    })
    describe("modifyLockPeriods", function () {
        describe("owner", function () {
            it("should create a new lock period", async function () {
                await geeTokenStake.connect(owner).modifyLockPeriods(100, 999)

                expect(await geeTokenStake.stakeProducts(100)).to.equal(999)
                expect(await geeTokenStake.lockPeriods(3)).to.equal(100)
            })
            it("should modify an existing lock period", async function () {
                await geeTokenStake.connect(owner).modifyLockPeriods(30, 150)
                expect(await geeTokenStake.stakeProducts(30)).to.equal(150)
            })
        })
        describe("non-owner", function () {
            it("reverts", async function () {
                expect(
                    geeTokenStake.connect(signer2).modifyLockPeriods(100, 999)
                ).to.be.revertedWith("Ownable: caller is not the owner")
            })
        })
    })
    describe("getLockPeriods", function () {
        it("returns all lock periods", async () => {
            const lockPeriods = await geeTokenStake.getLockPeriods()
            expect(lockPeriods.map((v) => Number(v._hex))).to.eql([30, 90, 180])
        })
    })
    describe("getInterestRate", function () {
        it("returns the interest rate for a specific lockPeriod", async () => {
            const interestRate = await geeTokenStake.getInterestRate(30)
            expect(interestRate).to.equal(700)
        })
    })
    describe("changeUnlockDate", function () {
        describe("owner", function () {
            it("changes the unlockDate", async () => {
                const assetOld = await geeTokenStake.getAssetById(0)
                const newUnlockDate = assetOld.unlockDate - 86400 * 500
                await geeTokenStake
                    .connect(owner)
                    .changeUnlockDate(0, newUnlockDate)
                const assetNew = await geeTokenStake.getAssetById(0)

                expect(assetNew.unlockDate).to.be.equal(
                    assetOld.unlockDate - 86400 * 500
                )
            })
        })
        describe("non-owner", function () {
            it("reverts", async () => {
                const assetOld = await geeTokenStake.getAssetById(0)
                const newUnlockDate = assetOld.unlockDate - 86400 * 500
                expect(
                    geeTokenStake
                        .connect(signer2)
                        .changeUnlockDate(0, newUnlockDate)
                ).to.be.revertedWith("Ownable: caller is not the owner")
            })
        })
    })
})
