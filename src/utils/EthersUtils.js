import { ethers } from 'ethers';

class EthersUtils {
    static async requestAccounts() {
        const accounts = await window.ethereum.request(
            { method: 'eth_requestAccounts' });
        return accounts;
    }

    static async requestAccount() {
        const accounts = await this.requestAccounts();
        const account = accounts[0];
        return account;
    }

    static async requestAccountAddress() {
        const account = await this.requestAccount();
        const accountAddress =
            ethers.utils.getAddress(account);
        return accountAddress;
    }

    static getSlicedAccountAddress(account) {
        return account.slice(0, 6) +
            '...' +
            account.slice(38, 42);
    }
}

export default EthersUtils;