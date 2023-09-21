import {  loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("JourneyToken", function () {

  async function deployJourneyTokenFixture() {
    // deploy a lock contract where funds can be withdrawn
    // one year in the future
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    

    await journeyTokenInstance.waitForDeployment();
    return { journeyTokenInstance };
  }


  describe("createJourney", async function () {
    it("Should create the new journey by driver", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();

    const [ driver ] = await ethers.getSigners();
    // await journeyTokenInstance.createJourney();
    
    journeyTokenInstance.once("JourneyCreated", (journeyHash, driver) => {
      console.log(journeyHash, driver);
    })
    await journeyTokenInstance.createJourney();

    await expect(journeyTokenInstance.createJourney()).to.emit(journeyTokenInstance,"JourneyCreated");
    });
  });
});
