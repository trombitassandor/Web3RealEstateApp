import logo from '../assets/logo.svg';
import EthersUtils from '../utils/EthersUtils';
import { useEffect, useState } from 'react';
import { usePopup } from '../PopupContext';

const Navigation = ({ accountAddress, setAccountAddress, onClickSell }) => {
    const { showGlobalPopup } = usePopup();
    
    const connectHandler = async () => {
        const accountAddress = await EthersUtils.requestAccountAddress();
        setAccountAddress(accountAddress);
        showGlobalPopup(`Account connected 
            ${EthersUtils.getSlicedAccountAddress(accountAddress)})`)
        console.log("setAccountAddress=", accountAddress);
    }

    const disconnectHandler = async () => {
        setAccountAddress(null);
        showGlobalPopup(`Account disconnected 
            (${EthersUtils.getSlicedAccountAddress(accountAddress)})`)
        console.log("setAccountAddress=", null);
    }

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href='#'>Buy</a></li>
                <li><a href='#'>Rent</a></li>
                <li><a href='#' onClick={onClickSell}>Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Web3RealEstateApp</h1>
            </div>

            {accountAddress
                ? (
                    <>
                        <button
                            type="button"
                            className="nav__connect"
                        >
                            {EthersUtils.getSlicedAccountAddress(accountAddress)}
                        </button>

                        <button
                            type="button"
                            className="nav__connect"
                            onClick={disconnectHandler}
                        >
                            Disconnect
                        </button>
                    </>
                )
                : (
                    <button
                        type="button"
                        className="nav__connect"
                        onClick={connectHandler}
                    >
                        Connect
                    </button>
                )}
        </nav>
    );
}

export default Navigation;
