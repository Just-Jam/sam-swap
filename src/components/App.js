import React, { Component } from 'react';
import './App.css';
import Navbar from './NavBar';
import Main from './Main';
import Web3 from 'web3'
import Token from '../abis/Token.json'
import SamSwap from '../abis/SamSwap.json'

class App extends Component {

  //Loads before html
  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
    console.log(window.web3)
  }
  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3

    //load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    //console.log(this.state.account)

    //gets eth balance of account
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance: ethBalance})
    //console.log(this.state.ethBalance)

    //Fetch token.sol, loads token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData){
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({token})
      this.setState({tokenAddress: tokenData.address})
      //Gets token bal of current user address
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      console.log("tokenBalance", tokenBalance.toString())
      this.setState({ tokenBalance: tokenBalance.toString()})

    }
    else {
      window.alert("Token contract not deployed to deteceted network")
    }

    //Fetch samSwap.sol, loads samswap
    const samSwapData = SamSwap.networks[networkId]
    if(samSwapData){
      const samSwap = new web3.eth.Contract(SamSwap.abi, samSwapData.address)
      this.setState({samSwap})
    }
    else {
      window.alert("SamSwap contract not deployed to detected network")
    }
    this.setState({loading: false})
    
  }

  buyTokens=(ethAmount) =>{
    this.setState({loading:true})
    //Send method to initate transaction
    this.state.samSwap.methods.buyTokens()
    .send({ value: ethAmount, from: this.state.account})
    .on('transactionHash', (hash) =>{
      this.setState({loading:false})
    })
  }


  sellTokens=(tokenAmount) =>{
    this.setState({loading:true})
    //Send method to initate transaction
    this.state.token.methods.approve(this.state.samSwap.address, tokenAmount)
    .send({ from: this.state.account}).on('transactionHash', (hash) =>{
      this.state.samSwap.methods.sellTokens(tokenAmount)
      .send({ from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })
  }
  

  //Set default values upon component load
  constructor(props) {
    super(props)
    this.state = {
      account:'',
      token:{},
      tokenAddress:'',
      samSwap:{},
      ethBalance:'0',
      tokenBalance:'0',
      loading:true
    }
  }

  render() {
    //sets loading defualt to true
    let content
    if(this.state.loading){
      content = <p id="loader" className='text-center'> Loading...</p>
    }
    else{
      content = 
      <Main 
      //pass functions and data to main.js
      ethBalance={this.state.ethBalance}
      tokenBalance={this.state.tokenBalance}
      tokenAddress={this.state.tokenAddress}
      buyTokens={this.buyTokens}
      sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account = {this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">

                {content}
                
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
