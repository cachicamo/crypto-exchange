const { assert } = require('chai');
const { default: Web3 } = require('web3');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}
// (accounts) gets all 10 accounts in array accounts[0]...[9]
contract('EthSwap', ([deployer, investor]) => {
  let token, ethSwap

  before( async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    await token.transfer(ethSwap.address, tokens('1000000'));
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name();
      assert.equal(name, 'DApp Token', 'name is OK');
    })
  })

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name();
      assert.equal(name, 'EthSwap Instant Exchange', 'name is OK');
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'), 'tokens transferred to contract OK')
    })
  })

  describe('buy tokens', async () => {
    let result

    beforeEach(async () => {
      //Purchase tokens before each example
      result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1')});
    })

    it('Allows user to instantly purchase tokens froj ethswap for a fixed price', async () => {
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'), 'buy tokens OK')
    
      //Check ethSwap balance after purchase
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('999900'), 'contract balance after purchase OK' )
      let etherSwapBalanceEth = await web3.eth.getBalance(ethSwap.address)
      assert.equal(etherSwapBalanceEth, web3.utils.toWei('1', 'ether'), 'ethSwap Eth balance OK')
    
      // funtion emits results
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })

  })
  describe('sell tokens', async () => {
    let result
  
    before(async () => {
      // investor must approve the token sale
      await token.approve(ethSwap.address, tokens('100'), { from: investor })
      // sell the tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: investor })
    })
  
    it('Allows user to instantly sale tokens to ethswap for a fixed price', async () => {
    
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'), 'buy tokens OK')
    
      //Check ethSwap balance after purchase
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'), 'contract balance after purchase OK' )
      let etherSwapBalanceEth = await web3.eth.getBalance(ethSwap.address)
      assert.equal(etherSwapBalanceEth, web3.utils.toWei('0', 'ether'), 'ethSwap Eth balance OK')
    
      // funtion emits results
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')


      // FAILURE: Investor cant sell more tokens than what he has
      await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
    })
  })
})