import { ethers } from "hardhat";

async function main() {
  const journeyToken = await ethers.deployContract("JourneyToken"); //defining our contract

  await journeyToken.waitForDeployment(); // deploying our contract on network
  console.log(await journeyToken.getAddress()) // writing contract address to the console
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
