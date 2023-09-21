import { expect } from "chai";
import { ethers } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";

describe("JourneyToken", function () {

  // Deployed contract each test because if describe once and use snapshots there are some errors we have
  describe("createJourney", async function () {
    it("Should create the new journey by driver", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();

    journeyTokenInstance.once("JourneyCreated", (journeyHash, driver) => {
      console.log(journeyHash, driver);
    })
    await journeyTokenInstance.createJourney();

    await expect(journeyTokenInstance.createJourney()).to.emit(journeyTokenInstance,"JourneyCreated");
    });
  });



  describe("purchaseToken",async function () {
    it("Should purchase token from the owner", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();
    
    const [owner, addr1] = await ethers.getSigners();
    await journeyTokenInstance.connect(addr1).purchaseToken({value: ethers.parseEther("1")})
    expect(await journeyTokenInstance.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"))
    })
  })
  
  describe("payForJourney", async function () {
    it("Should transfer the tokens for the journey to the owner", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();

    const [ driver, passenger1 ] = await ethers.getSigners();
    let hash:any;
    
    await journeyTokenInstance.connect(passenger1).purchaseToken({value: ethers.parseEther("1")})
    
    journeyTokenInstance.once("JourneyCreated",async (journeyHash, driver) => {
      expect(await journeyTokenInstance.connect(passenger1).payForJourney(journeyHash, 1)).to.emit(journeyTokenInstance, "PaidForJourney");

    })
    await journeyTokenInstance.createJourney();

    });
  });
});
