// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract JourneyToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {

    constructor() ERC20("JourneyToken", "JNG") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    using Counters for Counters.Counter;
    Counters.Counter private counter;
    
    uint256 tokenPriceInWei = 1 ether;

    mapping (bytes32 => Journey) journeyMapping;

    struct Journey{
        address driver;
        address[] passengers;
        uint256 tokensBurned;
        uint256 tokensToDistribute;
        uint256 journeyAmount;
    }
    

    event JourneyConfirmed(bytes32 indexed journeyHash);
    event JourneyCreated(bytes32 indexed journeyHash, address driver);
    event TokenPurchased(address indexed from, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensDistributedTo(address indexed from, uint256 amount);
    event PaidForJourney(bytes32 indexed journeyHash, address passenger);
    
    error UserHasNotPaid(address _user);
    error RewardsHasNotDistributed(bytes32 journeyHash);

    modifier checkBalance(address _user, uint256 _amount) {
        require(balanceOf(_user) > 0, "Insufficient balance for journey"); // checks the balance of the user
        require(_amount > 0, "Can't transfer 0 balance"); // checks the balance from the user
        _;
    }

    // In emergency, owner can pause buy, sell, transfer functions
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause after emergency.
    function unpause() public onlyOwner {
        _unpause();
    }

    
    // Burning tokens from journey's burnable amount.
    function burnTokens(bytes32 _journeyHash) private whenNotPaused returns(uint256) {
        uint256 tokensToBurn = journeyMapping[_journeyHash].tokensBurned; // token value to burn
        _burn(owner(), tokensToBurn); // burns tokens from owner address
        emit TokensBurned(_msgSender(), tokensToBurn); // emits TokenBurned event for app
        return (tokensToBurn);
    }


    // This function will must be called by driver. Driver confirms journey and payments are made.
    function confirmJourney(bytes32 _journeyHash) public nonReentrant{
        require(msg.sender == journeyMapping[_journeyHash].driver, "You are not driver of the this journey."); // Check msg.sender equals to journey driver.
        uint256 tokensToBurned = burnTokens(_journeyHash); // Trigger burnTokens function then equal the returned value to created variable.
        uint256 tokensToDistributed = distributeRewards(_journeyHash); // Trigger distributeRewards function then equal the returned value to created variable.
        uint256 journeyAmount = journeyMapping[_journeyHash].journeyAmount; // Get total journey amount from journey mapping.
        uint256 tokensToContract = journeyAmount * 15 / 100; // Calculate the token that contract will earn from this journey.
        uint256 tokensToTransfer = journeyAmount - tokensToBurned - tokensToDistributed - tokensToContract; // Calculate the token that driver will get from this journey.
        _transfer(owner(), msg.sender, tokensToTransfer); // Transfer the tokens of the driver.
        delete journeyMapping[_journeyHash];
        emit JourneyConfirmed(_journeyHash);
    }

    // Creating a new journey from the driver.
    function createJourney() public {
        bytes32 journeyHash = generateHash(); // Triggers the generateHash function then created variable will be equals to returned hash
        journeyMapping[journeyHash].driver = msg.sender; // Append driver of journey to journey mapping.
        journeyMapping[journeyHash].passengers.push(msg.sender); // Add driver to the passenger list.
        emit JourneyCreated(journeyHash, msg.sender);
    }

    // Distribute rewards to the passengers
    function distributeRewards(bytes32 _journeyHash) private whenNotPaused returns (uint256) {
        address[] memory _passengers = journeyMapping[_journeyHash].passengers; // Get passenger list to the memory variable.
        require(_passengers.length > 0, "There is no passenger for this journey."); // Check list length (number of passengers).
        uint256 tokensToDistributed = journeyMapping[_journeyHash].tokensToDistribute; // Tokens amount that will be distributed.
        uint256 distributePerUser = tokensToDistributed / _passengers.length; // Calculate reward amount per user.
        for (uint8 i = 0; i < _passengers.length; i++) {
            _transfer(owner(), _passengers[i], distributePerUser); // Transfer the rewards of passengers.
            tokensToDistributed -= distributePerUser; // Decrease total reward amount variable.
            emit TokensDistributedTo(_passengers[i], distributePerUser); // Emit transfer.
        }
        if (tokensToDistributed != 0) {
            revert RewardsHasNotDistributed(_journeyHash); // If tokens that have to distribute have not distributed revert with an error.
        }
        return (tokensToDistributed); // Return total reward amount.
    }

    // Generate hash for journey.
    function generateHash() private returns(bytes32) {
        counter.increment(); // Counter incremented
        return keccak256(abi.encodePacked(counter.current() + block.timestamp)); // Hash generated and returned
    }

    function getJourneyPassengers(bytes32 _journeyHash) public view returns (address[] memory){
       return journeyMapping[_journeyHash].passengers;
    }

    // Passenger pays for journey.
    function payForJourney (bytes32 _journeyHash, uint256 _amount) public checkBalance(_msgSender(), _amount) whenNotPaused nonReentrant{
        uint256 amountInWei = _amount * 10 ** decimals(); // Convert amount to the wei.
        uint256 tokensToBurn = amountInWei * 10 / 100; // Calculate the token amount to burn.
        uint256 tokensToDistribute = amountInWei * 15 / 100; //  Calculate the token amount to distribute.
        _transfer(_msgSender(), owner(), amountInWei); // Transfer tokens to the contract owner.
        journeyMapping[_journeyHash].passengers.push(msg.sender); // Add passenger to the journal passenger list.
        journeyMapping[_journeyHash].tokensBurned += tokensToBurn; // Add passenger burn amount to total burn amount of journey.
        journeyMapping[_journeyHash].tokensToDistribute += tokensToDistribute; // Add passenger reward amount to total reward amount of journey.
        journeyMapping[_journeyHash].journeyAmount += amountInWei; // Add passenger journey amount to total journey amount of journey.
        emit PaidForJourney(_journeyHash, msg.sender); // Emit journey confirmed.
    }

    // Users can buy tokens from owner with this function.
    function purchaseToken() public payable whenNotPaused nonReentrant {
        require(msg.value >= tokenPriceInWei, "Not enough money sent."); // Checks the user inputted value enough for the buy at least one token.
        uint tokensToTransfer = msg.value / tokenPriceInWei; // Converts balance to the token amount.
        _approve(owner(), _msgSender(), tokensToTransfer * 10 ** decimals()); // Increases user token allowence by owner.
        transferFrom(owner(), _msgSender(), tokensToTransfer * 10 ** decimals()); // Transfer tokens by owner to user.
        _approve(owner(), _msgSender(), 0);
        emit TokenPurchased(_msgSender(), tokensToTransfer * 10 ** decimals()); // Emits TokenPurchased event.
    }

    // Users can sell their tokens to the contract.
    function sellToken(uint256 _amount) public payable  whenNotPaused nonReentrant {
        require(balanceOf(msg.sender) > 0, "User do not have any token."); // Check user tokens.
        uint256 amountAsWei = _amount * 10 ** decimals(); // Convert amount to wei.
        _transfer(msg.sender, owner(), amountAsWei); // Transfer tokens from user to the contract owner.
         (bool sent, ) = payable(msg.sender).call{value: amountAsWei}(""); // Send crypto to the user.
         require(sent, "Failed to send Ether"); // Check transaction completed or reverted.
    }

    receive() external payable {
        revert(); // Revert all transfers that coming outside from the contract.
    }
}