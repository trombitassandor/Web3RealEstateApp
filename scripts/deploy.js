// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";

async function main() {
  console.log("Start setup accounts");
  const [buyer, seller, inspector, lender] = await ethers.getSigners();
  const allRealEstateTokenId = [1, 2];
  const realEstate = await deployContractRealEstate();
  await mintAllRealEstateTokens(realEstate, seller);
  const escrow = await deployContractEscrow(realEstate, seller, inspector, lender);
  await approveAllRealEstateTokens(realEstate, escrow, seller, allRealEstateTokenId);
  await listAllRealEstateTokens(escrow, seller, buyer, allRealEstateTokenId);
  console.log("Finished");
}

async function deployContractRealEstate() {
  console.log("Start deploy real estate contract");
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  console.log("RealEstate deployed to:", realEstate.address);
  return realEstate;
};

async function mintAllRealEstateTokens(realEstate, seller) {
  console.log("Start minting real estate tokens");

  const allRealEstateTokenURI = [
    "https://ipfs.io/ipfs/bafybeignot2h6boaci4eqer6irzibmv3xn6qcfzmeyszddnyus5fowbtgu/RealEstate00.json",
    "https://ipfs.io/ipfs/bafybeigp5mi4qfos2oevvhdrfkxbvie7zf5ca25hvvn7rzicuory4edfhe/RealEstate01.json",
  ];

  for (const realEstateTokenURI of allRealEstateTokenURI) {
    const tx = await realEstate.connect(seller).mint(realEstateTokenURI);
    await tx.wait();
    console.log("Minted real estate token with URI:", realEstateTokenURI);
  }
}

async function deployContractEscrow(realEstate, seller, inspector, lender) {
  console.log("Start deploy escrow contract");

  const Escrow = await ethers.getContractFactory("Escrow");

  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address);

  await escrow.deployed();

  console.log("Escrow deployed to:", escrow.address);

  return escrow;
}

async function approveAllRealEstateTokens(
  realEstate, escrow, seller, allRealEstateTokenId) {
  console.log("Start approve real estates");
  
  for (const realEstateTokenId of allRealEstateTokenId) {
    const tx = await realEstate.connect(seller)
      .approve(escrow.address, realEstateTokenId);

    await tx.wait();

    console.log("Approved real estate token with id:", realEstateTokenId);
  }
}

async function listAllRealEstateTokens(escrow, seller, buyer, allRealEstateTokenId){
  console.log("Start list real estates");

  const allPurchasePriceAndEscrowAmounts = {
    1: {
      purchasePrice: tokens(10),
      escrowAmount: tokens(1),
    },
    2: {
      purchasePrice: tokens(20),
      escrowAmount: tokens(2),
    },
  };

  for (const realEstateTokenId of allRealEstateTokenId) {
    const { purchasePrice, escrowAmount } =
      allPurchasePriceAndEscrowAmounts[realEstateTokenId];

    const tx = await escrow.connect(seller).list(
      realEstateTokenId, buyer.address, purchasePrice, escrowAmount);
    await tx.wait();

    console.log("Listed real estate token with id:", realEstateTokenId);
  }
}

function tokens(n) {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
