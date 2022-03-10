pragma solidity ^0.5.0;

import "./Token.sol";

contract SamSwap{
    string public name = "SamSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {

        //Calcualte num of tokens to buy
        uint tokenAmount = msg.value * rate;

        //Ensure that contract has enough tokens for purchase 
        require(token.balanceOf(address(this)) >= tokenAmount);

        //transfer tokens to user
        token.transfer(msg.sender, tokenAmount);

        //Emit event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {

        //User can't sell more tokens that they have (implemented in ERC20)
        require(token.balanceOf(msg.sender) >= _amount);
        
        //Calculate amount of eth to send
        uint etherAmount = _amount / rate;

        //Ensure that contract has enough ETH
        require(address(this).balance >= etherAmount);

        //use transferfrom to let contract spend user tokens, requires approval
        token.transferFrom(msg.sender, address(this), _amount);
        //Perform sale, send eth to msgsender
        msg.sender.transfer(etherAmount);

        //Emits an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}