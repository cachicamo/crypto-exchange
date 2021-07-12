// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.5.0;

import './Token.sol';

contract EthSwap {
  string public name = "EthSwap Instant Exchange";
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
    uint tokenAmount = msg.value * rate;

    // require that EthSwap has enoug tokens for transaction
    require(token.balanceOf(address(this)) >= tokenAmount, 'not enough tokens in EthSwap');

    // Transfer tokens to user
    token.transfer(msg.sender, tokenAmount);

    //Emit event
    emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
  }

  function sellTokens(uint _amount) public {
    // Investor cant sell more tokens than what he has
    require(token.balanceOf(msg.sender) >= _amount, 'investor cannot sell more than what he purchased');

    //calculate amount of ether to redeem
    uint etherAmount = _amount / rate;
    
    // Reuire that EthSwap has enough Ether 
    require(address(this).balance >= etherAmount);

    // Perform sale
    token.transferFrom(msg.sender, address(this), _amount);
    msg.sender.transfer(etherAmount);
   
   //Emit event
    emit TokensSold(msg.sender, address(token), _amount, rate);
  }




}
