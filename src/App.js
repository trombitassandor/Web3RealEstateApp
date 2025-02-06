import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import RealEstate from './components/RealEstate';

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
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider =
      new ethers.providers.Web3Provider(window.ethereum);

    setProvider(provider);

    const network = await provider.getNetwork();
    const networkConfig = config[network.chainId];

    const realEstateAddress = networkConfig.realEstate.address;
    const realEstate = new ethers.Contract(
      realEstateAddress, RealEstateABI, provider);

    console.log("realEstateAddress =", realEstateAddress);
    console.log("realEstate =", realEstate);

    const realEstateTotalSupply = await realEstate.totalSupply();
    console.log("realEstateTotalSupply =", realEstateTotalSupply.toString());

    const allRealEstates = [];

    for (var tokenId = 1; tokenId <= realEstateTotalSupply; tokenId++) {
      const tokenURI = await realEstate.tokenURI(tokenId);
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
        await EthersUtils.RequestAccountAddress();
      setAccount(accountAddress);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const toggleRealEstate = (realEstate) => {
    console.log("toggleRealEstate", realEstate);
    setCurrentRealEstate(realEstate);
    setToggle(!toggle);
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className='cards__section'>
        <h3>Welcome to Web3RealEstateApp!</h3>
        <hr />
        <div className='cards'>
          {
            allRealEstates.map((realEstate, index) => (
              <div className='card' key={index} onClick={() => toggleRealEstate(realEstate)}>
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
        toggle && <RealEstate
          realEstate={currentRealEstate}
          provider={provider}
          account={account}
          escrow={escrow}
          onClose={toggleRealEstate}
        />
      }
    </div>
  );
}

export default App;
