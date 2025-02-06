import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';
import RealEstateUtils from '../utils/RealEstateUtils';

const RealEstate = ({ realEstate, provider, escrow, onClose }) => {

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

                    <button className='realEstate__buy'>
                        Buy
                    </button>

                    <button className='realEstate__contact'>
                        Contact
                    </button>

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
