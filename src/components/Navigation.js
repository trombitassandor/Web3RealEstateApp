import logo from '../assets/logo.svg';
import EthersUtils from '../utils/EthersUtils';
import { useEffect, useState } from 'react';

const Navigation = ({ account, setAccount, onClickSell }) => {
    const connectHandler = async () => {
        const account = await EthersUtils.requestAccountAddress();
        setAccount(account);
        console.log("setAccount=", account);
    }

    const disconnectHandler = async () => {
        setAccount(null);
        console.log("setAccount=", null);
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

            {account
                ? (
                    <>
                        <button
                            type="button"
                            className="nav__connect"
                        >
                            {EthersUtils.getSlicedAccountAddress(account)}
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
