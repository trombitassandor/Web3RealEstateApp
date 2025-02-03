const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;
    let firstTokenId = 1;
    let purchasePrice = tokens(10);
    let escrowAmount = tokens(2);
    let isConsoleLogEnabled = false;

    beforeEach(async () => {
        // get signers
        const signers = await ethers.getSigners();
        // log signers (for debugging)
        // console.log("Signers");
        // console.log(signers);

        // setup accounts
        [buyer, seller, inspector, lender] = signers;
        consoleLog("Buyer = " + buyer.address +
            "\n" + "Seller = " + seller.address +
            "\n" + "Inspector = " + inspector.address +
            "\n" + "Lender = " + lender.address);

        // deploy real estate contract
        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstate.deploy();
        consoleLog("Real estate contract address = " + realEstate.address);

        // mint token
        // https://bafybeignot2h6boaci4eqer6irzibmv3xn6qcfzmeyszddnyus5fowbtgu.ipfs.w3s.link/RealEstate00.json
        // the ipfs format
        const tokenURI = "https://ipfs.io/ipfs/bafybeignot2h6boaci4eqer6irzibmv3xn6qcfzmeyszddnyus5fowbtgu/RealEstate00.json";
        const mintTransaction = await realEstate.connect(seller).mint(tokenURI);
        await mintTransaction.wait();
        consoleLog("Minted token with URI = " + tokenURI);

        // deploy escrow contract
        const Escrow = await ethers.getContractFactory('Escrow');
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address);
        consoleLog("Escrow contract address = " + escrow.address);

        // approve to transfer token721/real estate from seller to escrow
        approveTransaction = await realEstate.connect(seller).approve(escrow.address, firstTokenId);
        await approveTransaction.wait();
    })

    describe('Deployment', () => {
        it("Check NFT address", async () => {
            const resultNftAddress = await escrow.nftAddress();
            consoleLog("Escrow NFT address = " + resultNftAddress);
            expect(resultNftAddress).to.equal(realEstate.address);
        })

        it("Check seller address", async () => {
            const resultSeller = await escrow.seller();
            consoleLog("Escrow seller address = " + resultSeller);
            expect(resultSeller).to.equal(seller.address);
        })

        it("Check inspector address", async () => {
            const resultInspector = await escrow.inspector();
            consoleLog("Escrow inspector address = " + resultInspector);
            expect(resultInspector).to.equal(inspector.address);
        })

        it("Check lender address", async () => {
            const resultLender = await escrow.lender();
            consoleLog("Escrow lender address = " + resultLender);
            expect(resultLender).to.equal(lender.address);
        })
    })

    describe('Listing', () => {
        beforeEach(async () => await escrowListToken(seller, firstTokenId));

        it('Check ownership', async () => {
            const resultOwner = await realEstate.ownerOf(firstTokenId);
            expect(resultOwner).to.equal(escrow.address);
            consoleLog("Ownership updated to escrow contract. Escrow contract owns first token.");
            consoleLog("Escrow contract owns first token");
        });

        it('Check listing status', async () => {
            const resultIsListed = await escrow.isListed(firstTokenId);
            expect(resultIsListed).to.equal(true);
            consoleLog("First token / real estate is listed for sale.");
        });

        it('Check escrow buyer', async () => {
            const resultBuyer = await escrow.buyer(firstTokenId);
            expect(resultBuyer).to.equal(buyer.address);
            consoleLog("Check escrow buyer = " + resultBuyer);
        });

        it('Check escrow purchase price', async () => {
            const resultPurchasePrice = await escrow.purchasePrice(firstTokenId);
            expect(resultPurchasePrice).to.equal(purchasePrice);
            consoleLog("Check escrow purchase price = " + resultPurchasePrice);
        });

        it('Check escrow amount', async () => {
            const resultEscrowAmount = await escrow.escrowAmount(firstTokenId);
            expect(resultEscrowAmount).to.equal(escrowAmount);
            consoleLog("Check escrow amount = " + resultEscrowAmount);
        });
    });

    describe('Listing invalid cases', () => {
        it('Check non-seller listing', async () => {
            await expect(escrowListToken(buyer, firstTokenId))
                .to.be.revertedWith("Only seller can call this function");
        });

        it('Check re-listing', async () => {
            await escrowListToken(seller, firstTokenId);
            await expect(escrowListToken(seller, firstTokenId))
                .to.be.revertedWith("Already listed");
        });
    });

    describe('Deposit Earnest Money', () => {
        beforeEach(async () => await escrowListToken(seller, firstTokenId));

        it('Check deposit earnest money', async () => {
            await escrowDepositEarnestMoney(buyer, escrowAmount);
        });

        it('check deposit earnest money revert by non-buyer', async () => {
            const buyerBalanceBeforeDeposit = await buyer.getBalance();
            await expect(escrowDepositEarnestMoney(seller, escrowAmount))
                .to.be.revertedWith("Only buyer can call this function");
            const buyerBalanceAfterDeposit = await buyer.getBalance();
            const expectedBuyerBalanceAfterDeposit =
                buyerBalanceBeforeDeposit.sub(escrowAmount);
            expect(buyerBalanceAfterDeposit)
                .to.greaterThan(expectedBuyerBalanceAfterDeposit);
        });

        it('Check deposit earnest money revert on invalid escrow amount', async () => {
            const buyerBalanceBeforeDeposit = await buyer.getBalance();
            const invalidEscrowAmount = escrowAmount.sub(1);
            await expect(escrowDepositEarnestMoney(buyer, invalidEscrowAmount))
                .to.be.revertedWith("Invalid escrow amount");
            const buyerBalanceAfterDeposit = await buyer.getBalance();
            const expectedBuyerBalanceAfterDeposit =
                buyerBalanceBeforeDeposit.sub(invalidEscrowAmount);
            expect(buyerBalanceAfterDeposit)
                .to.greaterThan(expectedBuyerBalanceAfterDeposit);
        });

        it('Check escrow balance after deposit earnest money', async () => {
            await escrowDepositEarnestMoney(buyer, escrowAmount);
            const resultEscrowBalance = await escrow.getBalance();
            expect(resultEscrowBalance).to.equal(escrowAmount);
        });

        it('Check buyer balance after deposit earnest money', async () => {
            const buyerBalanceBeforeDeposit = await buyer.getBalance();
            const tx = await escrowDepositEarnestMoney(buyer, escrowAmount);
            const buyerBalanceAfterDeposit = await buyer.getBalance();
            const txGasCost = await getTxGasCost(tx);
            const expectedBuyerBalanceAfterDeposit =
                buyerBalanceBeforeDeposit.sub(escrowAmount).sub(txGasCost);
            expect(buyerBalanceAfterDeposit)
                .to.equal(expectedBuyerBalanceAfterDeposit);
        });
    });

    describe('Inspection', () => {
        it('Check inspection status update passed by inspector', async () => {
            let resultIsInspectionPassed;

            await escrowListToken(seller, firstTokenId);

            await escrowPassInspection(inspector, firstTokenId);
            resultIsInspectionPassed =
                await escrow.isInspectionPassed(firstTokenId);

            expect(resultIsInspectionPassed).to.equal(true);

            await escrowFailInspection(inspector, firstTokenId);
            resultIsInspectionPassed =
                await escrow.isInspectionPassed(firstTokenId);

            expect(resultIsInspectionPassed).to.equal(false);
        });

        it('Check inspection status of unlisted token', async () => {
            await expect(escrowPassInspection(inspector, firstTokenId))
                .to.be.revertedWith("Not listed");
        });

        it('Check inspection status update revert by non-inspector', async () => {
            await escrowListToken(seller, firstTokenId);
            await expect(escrowPassInspection(seller, firstTokenId))
                .to.be.revertedWith("Only inspector can call this function");
            const resultIsInspectionPassed =
                await escrow.isInspectionPassed(firstTokenId);
            expect(resultIsInspectionPassed).to.equal(false);
        });
    });

    describe('Approval', () => {
        it('Check approvals (buyer, seller, lender)', async () => {
            escrowListToken(seller, firstTokenId);
            checkEscrowApproval();
        });

        it('Check approval on unlisted token', async () => {
            checkEscrowApproval();
        });

        it('Check approval revert of non-buyer, non-seller, non-lender', async () => {
            escrowListToken(seller, firstTokenId);
            await expect(escrowApproveSale(inspector, firstTokenId))
                .to.be.revertedWith("Only buyer, seller, or lender can call this function");
        });

        it('Check redundant approval revert', async () => {
            escrowListToken(seller, firstTokenId);
            await escrowApproveSale(buyer, firstTokenId);
            await expect(escrowApproveSale(buyer, firstTokenId))
                .to.be.revertedWith("Already approved by sender");
        });

        async function checkEscrowApproval() {
            await escrowApproveSale(buyer, firstTokenId);
            await escrowApproveSale(seller, firstTokenId);
            await escrowApproveSale(lender, firstTokenId);

            const resultIsApprovedByBuyer =
                await escrow.approval(firstTokenId, buyer.address);
            const resultIsApprovedBySeller =
                await escrow.approval(firstTokenId, seller.address);
            const resultIsApprovedByLender =
                await escrow.approval(firstTokenId, lender.address);

            expect(resultIsApprovedByBuyer).to.equal(true);
            expect(resultIsApprovedBySeller).to.equal(true);
            expect(resultIsApprovedByLender).to.equal(true);
        }
    });

    describe('Sale', () => {
        it('Check finalize sale', async () => {
            await setupEscrowAndFinalizeSale();
        });

        it('Check escrow balance after sale', async () => {
            await setupEscrowAndFinalizeSale();
            const resultEscrowBalance = await escrow.getBalance();
            expect(resultEscrowBalance).to.equal(0);
        });

        it('Check seller balance after sale', async () => {
            const sellerBalanceBeforeSale = await seller.getBalance();
            await setupEscrowAndFinalizeSale();
            const sellerBalanceAfterSale = await seller.getBalance();
            expect(sellerBalanceAfterSale)
                .to.greaterThan(sellerBalanceBeforeSale);
        });

        it('Check buyer balance after sale', async () => {
            const buyerBalanceBeforeSale = await buyer.getBalance();
            await setupEscrowAndFinalizeSale();
            const buyerBalanceAfterSale = await buyer.getBalance();
            expect(buyerBalanceAfterSale)
                .to.lessThanOrEqual(
                    buyerBalanceBeforeSale.sub(escrowAmount));
        });

        it('Check lender balance after sale', async () => {
            const lenderBalanceBeforeSale = await lender.getBalance();
            await setupEscrowAndFinalizeSale();
            const lenderBalanceAfterSale = await lender.getBalance();
            expect(lenderBalanceAfterSale)
                .to.lessThanOrEqual(
                    lenderBalanceBeforeSale.sub(
                        purchasePrice.sub(escrowAmount)));
        });

        it('Check finalize sale revert', async () => {
            const sellerBalanceBeforeSale = await seller.getBalance();
            const buyerBalanceBeforeSale = await buyer.getBalance();
            const lenderBalanceBeforeSale = await lender.getBalance();

            await setupEscrow();
            await escrowFailInspection(inspector, firstTokenId);
            await expect(finalizeSale(firstTokenId)).to.be.reverted;

            const sellerBalanceAfterSale = await seller.getBalance();
            const buyerBalanceAfterSale = await buyer.getBalance();
            const lenderBalanceAfterSale = await lender.getBalance();

            expect(sellerBalanceAfterSale)
                .to.lessThanOrEqual(sellerBalanceBeforeSale);
                
            expect(buyerBalanceAfterSale)
                .to.lessThanOrEqual(
                    buyerBalanceBeforeSale.sub(escrowAmount));

            expect(lenderBalanceAfterSale)
                .to.lessThanOrEqual(
                    lenderBalanceBeforeSale.sub(
                        purchasePrice.sub(escrowAmount)));
        });

        it('Check change of ownership to buyer after sale', async () => {
            await setupEscrowAndFinalizeSale();
            const resultOwner = await realEstate.ownerOf(firstTokenId);
            expect(resultOwner).to.equal(buyer.address);
        });

        it('Check listed status is false/unlisted after sale', async () => {
            await setupEscrowAndFinalizeSale();
            const resultIsListed = await escrow.isListed(firstTokenId);
            expect(resultIsListed).to.equal(false);
        });
    });

    describe('Cancel Sale', () => {
        it('Check unlisting', async () => {
            await setupEscrow(seller, firstTokenId);
            await escrowCancelSale(seller);
            const resultIsListed = await escrow.isListed(firstTokenId);
            expect(resultIsListed).to.equal(false);
        });

        it('Check unlisting revert by non-party', async () => {
            await setupEscrow(seller, firstTokenId);
            await expect(escrow.connect(inspector).cancelSale(firstTokenId))
                .to.be.revertedWith("Only buyer, seller, or lender can call this function");
            expect(await escrow.isListed(firstTokenId)).to.equal(true);
        });

        it('Check unlisting revert on unlisted token', async () => {
            await expect(escrow.connect(seller).cancelSale(firstTokenId))
                .to.be.revertedWith("Not listed");
        });

        it('Check cancel sale by seller', async () => {
            await setupEscrow(seller, firstTokenId);
            const buyerBalanceBeforeCancelSale = await buyer.getBalance();
            const lenderBalanceBeforeCancelSale = await lender.getBalance();
            await escrowCancelSale(seller);
            const buyerBalanceAfterCancelSale = await buyer.getBalance();
            const lenderBalanceAfterCancelSale = await lender.getBalance();
            const escrowBalanceAfterCancelSale = await escrow.getBalance();
            expect(buyerBalanceAfterCancelSale)
                .to.greaterThanOrEqual(buyerBalanceBeforeCancelSale);
            expect(lenderBalanceAfterCancelSale)
                .to.greaterThanOrEqual(lenderBalanceBeforeCancelSale);
            expect(escrowBalanceAfterCancelSale)
                .to.equal(0);
        });

        it('Check cancel sale by buyer', async () => {
            await setupEscrow(seller, firstTokenId);
            const sellerBalanceBeforeCancelSale = await seller.getBalance();
            const lenderBalanceBeforeCancelSale = await lender.getBalance();
            await escrowCancelSale(buyer);
            const sellerBalanceAfterCancelSale = await seller.getBalance();
            const lenderBalanceAfterCancelSale = await lender.getBalance();
            const escrowBalanceAfterCancelSale = await escrow.getBalance();
            expect(sellerBalanceAfterCancelSale)
                .to.greaterThanOrEqual(sellerBalanceBeforeCancelSale);
            expect(lenderBalanceAfterCancelSale)
                .to.greaterThanOrEqual(lenderBalanceBeforeCancelSale);
            expect(escrowBalanceAfterCancelSale)
                .to.equal(0);
        });

        it('Check cancel sale by lender', async () => {
            await setupEscrow(seller, firstTokenId);
            const sellerBalanceBeforeCancelSale = await seller.getBalance();
            const lenderBalanceBeforeCancelSale = await lender.getBalance();
            await escrowCancelSale(lender);
            const sellerBalanceAfterCancelSale = await seller.getBalance();
            const lenderBalanceAfterCancelSale = await lender.getBalance();
            const escrowBalanceAfterCancelSale = await escrow.getBalance();
            expect(sellerBalanceAfterCancelSale)
                .to.greaterThanOrEqual(sellerBalanceBeforeCancelSale);
            expect(lenderBalanceAfterCancelSale)
                .to.greaterThanOrEqual(lenderBalanceBeforeCancelSale);
            expect(escrowBalanceAfterCancelSale)
                .to.equal(0);
        });

        it('Check cancel sale by buyer but failed inspection', async () => {
            await setupEscrow(seller, firstTokenId);
            await escrowFailInspection(inspector, firstTokenId);
            const buyerBalanceBeforeCancelSale = await buyer.getBalance();
            const lenderBalanceBeforeCancelSale = await lender.getBalance();
            await escrowCancelSale(buyer);
            const buyerBalanceAfterCancelSale = await buyer.getBalance();
            const lenderBalanceAfterCancelSale = await lender.getBalance();
            const escrowBalanceAfterCancelSale = await escrow.getBalance();
            expect(buyerBalanceAfterCancelSale)
                .to.greaterThanOrEqual(buyerBalanceBeforeCancelSale);
            expect(lenderBalanceAfterCancelSale)
                .to.greaterThanOrEqual(lenderBalanceBeforeCancelSale);
            expect(escrowBalanceAfterCancelSale)
                .to.equal(0);
        });

        it('Check cancel sale by lender but failed inspection', async () => {
            await setupEscrow(seller, firstTokenId);
            await escrowFailInspection(inspector, firstTokenId);
            const buyerBalanceBeforeCancelSale = await buyer.getBalance();
            const lenderBalanceBeforeCancelSale = await lender.getBalance();
            await escrowCancelSale(lender);
            const buyerBalanceAfterCancelSale = await buyer.getBalance();
            const lenderBalanceAfterCancelSale = await lender.getBalance();
            const escrowBalanceAfterCancelSale = await escrow.getBalance();
            expect(buyerBalanceAfterCancelSale)
                .to.greaterThanOrEqual(buyerBalanceBeforeCancelSale);
            expect(lenderBalanceAfterCancelSale)
                .to.greaterThanOrEqual(lenderBalanceBeforeCancelSale);
            expect(escrowBalanceAfterCancelSale)
                .to.equal(0);
        });
    });

    async function getTxGasCost(tx) {
        const txReceipt = await tx.wait();
        const gasUsed = txReceipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const gasCost = gasUsed.mul(gasPrice);
        return gasCost;
    }

    async function escrowDepositEarnestMoney(signer, amount) {
        const tx = await escrow.connect(signer)
            .depositEarnestMoney(firstTokenId, { value: amount });
        await tx.wait();
        return tx;
    }

    async function escrowListToken(_seller, _tokenId) {
        // transfer token721/real estate from seller to escrow
        // list token712/real estate for sale
        const listTransaction = await escrow.connect(_seller).list(
            _tokenId, buyer.address, purchasePrice, escrowAmount);
        await listTransaction.wait();
    }

    async function escrowPassInspection(signer, tokenId) {
        const inspectionTransaction = await escrow.connect(signer)
            .updateInspectionStatus(tokenId, true);
        await inspectionTransaction.wait();
    }

    async function escrowFailInspection(signer, tokenId) {
        const inspectionTransaction = await escrow.connect(signer)
            .updateInspectionStatus(tokenId, false);
        await inspectionTransaction.wait();
    }

    async function escrowApproveSale(signer, tokenId) {
        const approvalTransaction = await escrow.connect(signer).approveSale(tokenId);
        await approvalTransaction.wait();
    }

    async function escrowLenderSendTransaction() {
        const escrowBalance = await escrow.getBalance();
        const missingBalance = purchasePrice.sub(escrowBalance);
        const transaction = await lender.sendTransaction(
            { to: escrow.address, value: missingBalance });
        await transaction.wait();
    }

    async function setupEscrowAndFinalizeSale() {
        await setupEscrow();
        await finalizeSale(firstTokenId);
    }

    async function setupEscrow() {
        await escrowListToken(seller, firstTokenId);
        await escrowDepositEarnestMoney(buyer, escrowAmount);
        await escrowPassInspection(inspector, firstTokenId);
        await escrowApproveSale(buyer, firstTokenId);
        await escrowApproveSale(seller, firstTokenId);
        await escrowApproveSale(lender, firstTokenId);
        await escrowLenderSendTransaction();
    }

    async function finalizeSale(tokenId) {
        const transactionFinalizeSale =
            await escrow.connect(seller).finalizeSale(tokenId);
        await transactionFinalizeSale.wait();
    }

    async function escrowCancelSale(_signer) {
        var cancelSaleTx = await escrow.connect(_signer).cancelSale(firstTokenId);
        await cancelSaleTx.wait();
    }

    function consoleLog(_message) {
        if (isConsoleLogEnabled) {
            console.log(_message);
        }
    }
})