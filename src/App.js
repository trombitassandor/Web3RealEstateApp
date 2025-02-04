import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

import EthersUtils from './utils/EthersUtils';

function App() {

  const [account, setAccount] = useState(null);

  const loadBlockchainData = async () => {
    const provider =
      new ethers.providers.Web3Provider(window.ethereum);
    
    window.ethereum.on('accountsChanged', async () => {
      const accountAddress = 
        await EthersUtils.RequestAccountAddress();
      setAccount(accountAddress);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>

      <Navigation account={account} setAccount={setAccount} />
      <Search/>

      <div className='cards__section'>

        <h3>Welcome to Web3RealEstateApp!</h3>

        <hr/>

        <div className='cards'>
          <div className='card'>
            <div className='card__image'>
              <img src="" alt="Home"/>
            </div>
            <div className="card__info">
              <h4>1 ETH</h4>
              <p>
                <strong>2</strong> bedrooms |
                <strong>1</strong> bathrooms |
                <strong>60</strong> sqm
              </p>
              <p>Street [street_name] Nr[street_number]</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
