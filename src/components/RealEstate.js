import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';
import RealEstateUtils from '../utils/RealEstateUtils';
import EthersUtils from '../utils/EthersUtils';

const RealEstate = ({ realEstate, realEstateId, provider, accountAddress, escrow, onClose }) => {
    const [buyer, setBuyer] = useState(null);
    const [seller, setSeller] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [lender, setLender] = useState(null);

    const [hasBought, setHasBought] = useState(null);
    const [hasInspected, setHasInspected] = useState(null);
    const [hasLended, setHasLended] = useState(null);
    const [hasSold, setHasSold] = useState(null);

    const [owner, setOwner] = useState(null);

    const fetchDetails = async () => {
        console.log("fetchDetails");

        const buyer = await escrow.buyer(realEstateId);
        setBuyer(buyer);
        console.log("buyer =", buyer);

        const seller = await escrow.seller();
        setSeller(seller);
        console.log("seller =", seller);

        const inspector = await escrow.inspector();
        setInspector(inspector);
        console.log("inspector =", inspector);

        const lender = await escrow.lender();
        setLender(lender);
        console.log("lender =", lender);

        const hasBought = await escrow.approval(realEstateId, buyer);
        setHasBought(hasBought);
        console.log("hasBought =", hasBought);

        const hasSold = await escrow.approval(realEstateId, seller);
        setHasSold(hasSold);
        console.log("hasSold =", hasSold);

        const hasInspected = await escrow.isInspectionPassed(realEstateId);
        setHasInspected(hasInspected);
        console.log("hasInspected =", hasInspected);

        const hasLended = await escrow.approval(realEstateId, lender);
        setHasLended(hasLended);
        console.log("hasLended =", hasLended);
    }

    const fetchOwner = async () => {
        console.log("fetchOwner");

        const isListed = await escrow.isListed(realEstateId);
        console.log("isListed =", isListed);

        if (isListed) return;

        const owner = await escrow.buyer(realEstateId);
        setOwner(owner);

        console.log("owner =", owner);
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(realEstateId);
        const signer = await provider.getSigner();

        console.log("escrowAmount=", escrowAmount)
        console.log("signer=", signer)

        let tx = await escrow.connect(signer).depositEarnestMoney(
            realEstateId, { value: escrowAmount, gasLimit: 60000 });
        await tx.wait();

        tx = await escrow.connect(signer).approveSale(realEstateId);
        await tx.wait();

        setHasBought(true);

        console.log("hasBought=", hasBought);
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner();

        let tx = await escrow.connect(signer)
            .updateInspectionStatus(realEstateId, true);
        await tx.wait();

        setHasInspected(true);
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner();

        let tx = await escrow.connect(signer).approveSale(realEstateId);
        await tx.wait();

        const purchasePrice = await escrow.purchasePrice(realEstateId);
        const escrowAmount = await escrow.escrowAmount(realEstateId);
        const lendAmount = purchasePrice - escrowAmount;

        await signer.sendTransaction(
            {
                to: escrow.address,
                value: lendAmount.toString(),
                gasLimit: 60000
            }
        );

        setHasLended(true);
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner();

        let tx = await escrow.connect(signer).approveSale(realEstateId);
        await tx.wait();

        tx = await escrow.connect(signer).finalizeSale(realEstateId);
        await tx.wait();

        setHasSold(true);
    }

    // call again on hasSold changed
    useEffect(() => {
        fetchDetails();
        fetchOwner();
    }, [hasSold]);

    useEffect(() => {
        console.log("realEstate =", realEstate);
        console.log("realEstateId =", realEstateId);
        console.log("accountAddress =", accountAddress);
    }, []);

    return (
        <div className="realEstate">
            <div className='realEstate__details'>

                <div className='realEstate__image'>
                    <img src={RealEstateUtils.getImage(realEstate)} alt="RealEstate" />
                </div>

                <div className='realEstate__overview'>
                    <h1>{RealEstateUtils.getName(realEstate)}</h1>
                    <h2>{RealEstateUtils.getPurchasePrice(realEstate)}</h2>

                    <strong>
                        <p>{RealEstateUtils.getYearBuilt(realEstate)}</p>
                        <p>{RealEstateUtils.getSquareMetre(realEstate)}</p>
                        <p>{RealEstateUtils.getBedrooms(realEstate)} bedrooms</p>
                        <p>{RealEstateUtils.getBathrooms(realEstate)} bathrooms</p>
                    </strong>

                    <p><strong>Address</strong></p>
                    <p>{RealEstateUtils.getAddress(realEstate)}</p>

                    {owner ? (
                        <div className='realEstate__owned'>
                            Owned by {EthersUtils.getSlicedAccountAddress(owner)}
                        </div>
                    ) : (
                        <div>
                            {(accountAddress === inspector) ? (
                                <button className='realEstate__buy'
                                    onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (accountAddress === lender) ? (
                                <button className='realEstate__buy'
                                    onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            ) : (accountAddress === seller) ? (
                                <button className='realEstate__buy'
                                    onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='realEstate__buy'
                                    onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}

                            <button className='realEstate__contact'>
                                Contact
                            </button>
                        </div>
                    )}

                    <hr />
                    <h2>Description</h2>
                    <p>{RealEstateUtils.getDescription(realEstate)}</p>

                    <hr />
                    <h2>Attributes</h2>
                    <ul>
                        {
                            RealEstateUtils.getAttributes(realEstate).map((attribute, index) =>
                            (<li key={index}>
                                <strong>{RealEstateUtils.getTraitType(attribute)} </strong>
                                : {RealEstateUtils.getValue(attribute)}
                            </li>))
                        }
                    </ul>
                </div>

                <button onClick={onClose} className="realEstate__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div>
    );
}

export default RealEstate;
