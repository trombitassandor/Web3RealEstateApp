import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import RealEstate from './components/RealEstate';
import Sell from './components/Sell';
import { usePopup } from './PopupContext';

// ABIs
import RealEstateABI from './abis/RealEstate.json'
import EscrowABI from './abis/Escrow.json'

// Config
import config from './config.json';

import EthersUtils from './utils/EthersUtils';
import RealEstateUtils from './utils/RealEstateUtils';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [allRealEstates, setAllReatEstates] = useState([]);
  const [currentRealEstate, setCurrentRealEstate] = useState(null);
  const [currentRealEstateId, setCurrentRealEstateId] = useState(null);
  const [realEstateToggle, setRealEstateToggle] = useState(false);
  const [sellToggle, setSellToggle] = useState(false);
  const [realEstateContract, setRealEstateContract] = useState(null);

  const { showGlobalPopup } = usePopup();

  const loadBlockchainData = async () => {
    console.log("window.ethereum =", window.ethereum);

    const provider =
      new ethers.providers.Web3Provider(window.ethereum);

    setProvider(provider);

    const network = await provider.getNetwork();
    const networkConfig = config[network.chainId];

    console.log("networkConfig =", networkConfig);
    console.log("networkConfig.realEstate =", networkConfig?.realEstate);
    console.log("networkConfig.escrow =", networkConfig?.escrow);

    if (!networkConfig || !networkConfig.realEstate || !networkConfig.escrow) {
      console.error("Real estate or escrow contract address not found in networkConfig");
      console.log(`Use Hardhat network! 
        Default RPC URL Local = 127.0.0.1:8545
        Chain ID = 31337
        Currency symbol = ETH`)
      return;
    }

    const realEstateAddress = networkConfig.realEstate.address;
    const realEstateContract = new ethers.Contract(
      realEstateAddress, RealEstateABI, provider);
    setRealEstateContract(realEstateContract);

    console.log("realEstateAddress =", realEstateAddress);
    console.log("realEstate =", realEstateContract);

    const realEstateTotalSupply = await realEstateContract.totalSupply();
    console.log("realEstateTotalSupply =", realEstateTotalSupply.toString());

    const allRealEstates = [];

    for (var tokenId = 1; tokenId <= realEstateTotalSupply; tokenId++) {
      const tokenURI = await realEstateContract.tokenURI(tokenId);
      console.log("Fetching tokenURI=", tokenURI);
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      allRealEstates.push(metadata);
    }
    setAllReatEstates(allRealEstates);
    console.log(allRealEstates);

    const escrowAddress = networkConfig.escrow.address;
    const escrow = new ethers.Contract(
      escrowAddress, EscrowABI, provider);
    setEscrow(escrow);

    console.log("escrowAddress =", escrowAddress);
    console.log("escrow =", escrow);

    window.ethereum.on('accountsChanged', async () => {
      const accountAddress =
        await EthersUtils.requestAccountAddress();
      setAccount(accountAddress);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const toggleRealEstate = (realEstate, id) => {
    console.log("toggleRealEstate", realEstate);
    setCurrentRealEstate(realEstate);
    setCurrentRealEstateId(id);
    setRealEstateToggle(!realEstateToggle);
  };

  const toggleSell = (isToggled) => {
    if (!account) {
      showGlobalPopup("Connect as seller");
      return;
    }
    setSellToggle(isToggled);
  }

  return (

      <div>
        <Navigation account={account} setAccount={setAccount} onClickSell={() => toggleSell(true)} />
        <Search />
        <div className='cards__section'>
          <h3>Welcome to Web3RealEstateApp!</h3>
          <hr />
          <div className='cards'>
            {
              allRealEstates.map((realEstate, id) => (
                <div className='card' key={id + 1} onClick={() => toggleRealEstate(realEstate, id + 1)}>
                  <div className='card__image'>
                    <img src={RealEstateUtils.getImage(realEstate)} alt="RealEstate" />
                  </div>
                  <div className="card__info">
                    <h4>
                      {RealEstateUtils.getPurchasePrice(realEstate)}|
                      {RealEstateUtils.getName(realEstate)}
                    </h4>
                    <h5>
                      <p>
                        <strong>{RealEstateUtils.getYearBuilt(realEstate)} | </strong>
                        <strong>{RealEstateUtils.getSquareMetre(realEstate)} | </strong>
                        <strong>{RealEstateUtils.getBedrooms(realEstate)}</strong> bedrooms |
                        <strong>{RealEstateUtils.getBathrooms(realEstate)}</strong> bathrooms
                      </p>
                    </h5>
                    <p>
                      <strong>Address | </strong>
                      {RealEstateUtils.getAddress(realEstate)}
                    </p>
                    <p>
                      <strong>Description | </strong>
                      {RealEstateUtils.getDescription(realEstate)}
                    </p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        {
          realEstateToggle && <RealEstate
            realEstate={currentRealEstate}
            realEstateId={currentRealEstateId}
            provider={provider}
            account={account}
            escrow={escrow}
            onClose={toggleRealEstate}
          />
        }
        {
          sellToggle && <Sell
            account={account}
            realEstateContract={realEstateContract}
            onClose={() => toggleSell(false)} />
        }
      </div>
  );
}

export default App;
