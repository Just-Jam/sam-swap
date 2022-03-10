const Token = artifacts.require("Token")
const SamSwap = artifacts.require("SamSwap");

module.exports = async function(deployer) {
  //Deploys Token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  //Deploys SamSwap contract
  await deployer.deploy(SamSwap, token.address);
  const samSwap = await SamSwap.deployed()

  await token.transfer(samSwap.address, '1000000000000000000000000')
};
