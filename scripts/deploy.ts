import { ethers } from "hardhat";

async function main() {
  const journeyToken = await ethers.deployContract("JourneyToken");

  await journeyToken.waitForDeployment();
  const [owner] = await ethers.getSigners();
  console.log(
    `${owner.address} deployed contract to ${journeyToken.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
