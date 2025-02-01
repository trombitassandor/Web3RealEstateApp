//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => address) public buyer;
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
        address _lender
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
        address _buyer,
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
    function finalizeSale(uint256 _tokenId) public 
    onlyListed(_tokenId) {
        require(isInspectionPassed[_tokenId], "Inspection not passed");
        require(approval[_tokenId][buyer[_tokenId]], "Buyer not approved");
        require(approval[_tokenId][seller], "Seller not approved");
        require(approval[_tokenId][lender], "Lender not approved");

        // todo
        // // transfer nft from this escrow contract to buyer
        // IERC721(nftAddress).transferFrom(address(this), buyer[_tokenId], _tokenId);

        // // transfer purchase price to seller
        // seller.transfer(purchasePrice[_tokenId]);
    }
}