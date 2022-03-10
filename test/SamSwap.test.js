const { assert } = require('chai')

const Token = artifacts.require('Token')
const SamSwap = artifacts.require("SamSwap")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}
//deployer: first account, ivnestor = 2nd in gananche
contract('SamSwap', ([deployer, investor]) =>{

    let token, samSwap

    before(async ()=>{
        token = await Token.new()
        samSwap = await SamSwap.new(token.address)  
        //Transfer all tokens to samSwap contract (1 million)
        await token.transfer(samSwap.address, tokens('1000000'))
    })

    describe('Token deployment', async () =>{
        //Check if contract name correct
        it('contract has a name', async () =>{
            const name = await token.name()
            assert.equal(name, 'Sam Token')
        })
    })

    describe('SamSwap deployment', async () =>{
        //Check if contract name correct
        it('contract has a name', async () =>{   
            const name = await samSwap.name()
            assert.equal(name, 'SamSwap Instant Exchange')
        })
        //Check if contract has the tokens
        it('contract has tokens', async () =>{
            let balance = await token.balanceOf(samSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
        
    })

    describe('buyTokens()', async () =>{
        let result
        before(async ()=>{
            //Purchase tokens before each example
            result = await samSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        it('Allows user to instantly purchase tokens from SamSwap at a fixed price', async () =>{
            //Check investor token bal after purchase 
            let investorBal = await token.balanceOf(investor)
            assert.equal(investorBal.toString(), tokens('100'))

            //Check samswap bal after purchase
            let samSwapBal
            samSwapBal = await token.balanceOf(samSwap.address)
            assert.equal(samSwapBal.toString(), tokens('999900'))
            samSwapBal = await web3.eth.getBalance(samSwap.address)
            assert.equal(samSwapBal.toString(), web3.utils.toWei('1', 'Ether'))

            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })
    describe('sellTokens()', async () =>{
        let result
        before(async ()=>{
            //Investor account approves 100 tokens
            await token.approve(samSwap.address, tokens('100'), {from: investor})
            //Investor acc sells 100 tokens
            result = await samSwap.sellTokens(tokens('100'), {from: investor})
        })
        it('Allows users to instantly sell tokens to samSwap for fixed price', async () =>{
            //Check investor token bal after purchase 
            let investorBal = await token.balanceOf(investor)
            assert.equal(investorBal.toString(), tokens('0'))

            //Checks logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //FAILURE: investor cannot sell more tokens than they have
            await samSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        })
    })
})