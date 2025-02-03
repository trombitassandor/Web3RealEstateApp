//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _receiver, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address payable public lender;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => address payable) public buyer;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => bool) public isInspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval; 

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }

    modifier onlyBuyer(uint256 _tokenId) {
        require(msg.sender == buyer[_tokenId], "Only buyer can call this function");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }

    modifier onlyApprovalParties(uint256 _tokenId) {
        require(
            msg.sender == buyer[_tokenId] ||
            msg.sender == seller ||
            msg.sender == lender,
            "Only buyer, seller, or lender can call this function"
        );
        _;
    }

    modifier onlyListed(uint256 _tokenId) {
        require(isListed[_tokenId], "Not listed");
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address payable _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}

    function list(
        uint256 _tokenId,
        address payable _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount)
    public payable onlySeller() {
        require(!isListed[_tokenId], "Already listed");

        // transfer nft from seller to this escrow contract
        // must be approved first
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        isListed[_tokenId] = true;
        buyer[_tokenId] = _buyer;
        purchasePrice[_tokenId] = _purchasePrice;
        escrowAmount[_tokenId] = _escrowAmount;
    }

    function depositEarnestMoney(uint256 _tokenId) 
    public payable onlyListed(_tokenId) onlyBuyer(_tokenId) {
        require(msg.value >= escrowAmount[_tokenId], "Invalid escrow amount");
    }

    function updateInspectionStatus(uint256 _tokenId, bool _isInspectionPassed)
    public onlyListed(_tokenId) onlyInspector() {
        isInspectionPassed[_tokenId] = _isInspectionPassed;
    }

    function approveSale(uint256 _tokenId) 
    public onlyListed(_tokenId) onlyApprovalParties(_tokenId){
        require(approval[_tokenId][msg.sender] == false, "Already approved by sender");
        approval[_tokenId][msg.sender] = true;
    }

    // finalize sale
    // if inspection passed
    // if buyer approved
    // if seller approved
    // if lender approved
    // then transfer nft to buyer
    // then purchase price to seller
    function finalizeSale(uint256 _tokenId) 
    public onlyListed(_tokenId) {
        require(isInspectionPassed[_tokenId], "Inspection not passed");
        require(approval[_tokenId][buyer[_tokenId]], "Buyer not approved");
        require(approval[_tokenId][seller], "Seller not approved");
        require(approval[_tokenId][lender], "Lender not approved");
        require(address(this).balance >= purchasePrice[_tokenId], "Insufficient balance");

        transferTo(seller, purchasePrice[_tokenId]);
        transferNftTo(buyer[_tokenId], _tokenId);
        isListed[_tokenId] = false;
    }

    function cancelSale(uint256 _tokenId) 
    public onlyListed(_tokenId) onlyApprovalParties(_tokenId){
        isListed[_tokenId] = false;

        if(getBalance() == 0) {
            return;
        }

        uint256 lendedAmount = 
            purchasePrice[_tokenId] - escrowAmount[_tokenId];

        if(lendedAmount > 0) {
            transferTo(lender, lendedAmount);
        }

        bool isSellerError = 
            msg.sender == seller ||
            isInspectionPassed[_tokenId] == false;
        
        uint256 remainedBalance = getBalance();

        if (isSellerError) {
            transferTo(buyer[_tokenId], remainedBalance);
        } else {
            transferTo(seller, remainedBalance);
        }

        // option: return lender deposit
    }

    function transferTo(address payable _receiver, uint256 amount) private {
        // safer and more readable
        _receiver.transfer(amount);

        // more gas efficient
        // (bool success, ) = _receiver.call{value: amount}("");
        // require(success, "Transfer failed");
    }

    function transferNftTo(address _receiver, uint256 _tokenId) private {
        IERC721(nftAddress).transferFrom(address(this), _receiver, _tokenId);
    }
}