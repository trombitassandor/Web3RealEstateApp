import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const RealEstate = ({ realEstate, provider, escrow, onClose }) => {

    return (
        <div className="realEstate">
            <div className='realEstate__details'>
                <div className='realEstate__image'>
                    <img src={realEstate.image} alt="RealEstate" />
                </div>
                <button onClick={onClose} className="realEstate__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div>
    );
}

export default RealEstate;
