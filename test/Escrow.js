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
        //consoleLog("Signers");
        //consoleLog(signers);

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

        // transfer token721/real estate from seller to escrow
        // list token712/real estate for sale
        listTransaction = await escrow.connect(seller).list(
            firstTokenId, buyer.address, purchasePrice, escrowAmount);
        await listTransaction.wait();
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

    function consoleLog(message) {
        if (isConsoleLogEnabled) {
            console.log(message);
        }
    }
})