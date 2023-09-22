const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
import { expect } from "chai";
import { ethers } from "hardhat";

describe("JourneyToken", function () {

  // Deployed contract each test because if describe once and use snapshots there are some errors we have

  describe("createJourney",async function () {
    it("Should create the journey", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();

    const [ driver ] = await ethers.getSigners(); // Getting signers for test from network.

    await journeyTokenInstance.createJourney(); // Driver created journey
    const _event = await journeyTokenInstance.queryFilter("JourneyCreated"); // After createJourney function "JoruneyCreated" event is emitted and filtering here
    const journeyHash = _event[0].args[0]; // Get arguments of event
    const passengerList = await journeyTokenInstance.getJourneyPassengers(journeyHash); // Get passenger passenger list (only driver added that passenger list)
    expect(passengerList[0]).to.equal(driver.address); // Expect first passenger of journey equals to driver address.

    });
  })

  describe("confirmJourney",async function () {
    it("Should confirm the journey", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();


    await journeyTokenInstance.createJourney(); // Driver created journey
    const _event = await journeyTokenInstance.queryFilter("JourneyCreated"); // After createJourney function "JoruneyCreated" event is emitted and filtering here
    const journeyHash = _event[0].args[0]; // Get arguments of event
    await journeyTokenInstance.confirmJourney(journeyHash); // Driver confirms journey
    expect((await journeyTokenInstance.getJourneyPassengers(journeyHash)).length).to.equal(0); // Expect there is no passenger and journey with this hash because we deleted from contract.

    });
  })

  describe("purchaseToken",async function () {
    it("Should purchase token from the owner", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();
    
    const [owner, addr1] = await ethers.getSigners(); // Getting signers for test from network.
    await journeyTokenInstance.connect(addr1).purchaseToken({value: ethers.parseEther("1")}) // addr1 user purchasing token from the owner.
    expect(await journeyTokenInstance.balanceOf(addr1.address)).to.equal(ethers.parseEther("1")) // Check that user did buy the tokens
    })
  })
  
  describe("payForJourney", async function () {
    it("Should transfer the tokens for the journey to the owner", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();

    const [ driver, passenger1 ] = await ethers.getSigners(); // Getting signers for test from network.
    
    await journeyTokenInstance.createJourney();
    const _event = await journeyTokenInstance.queryFilter("JourneyCreated"); // After createJourney function "JoruneyCreated" event is emitted and filtering here
    const journeyHash = _event[0].args[0]; // Get arguments of event

    await journeyTokenInstance.connect(passenger1).purchaseToken({value: ethers.parseEther("2")}) // passenger1 user purchasing token from the owner.
    await journeyTokenInstance.connect(passenger1).payForJourney(journeyHash, 1); // passenger1 user paid for the journey.
    const passengerList = await journeyTokenInstance.getJourneyPassengers(journeyHash); // Get passengers of the journey.
    expect(await journeyTokenInstance.balanceOf(passengerList[1])).to.be.equal(ethers.parseEther("1")) // Check is balance of passenger 1 is decreased.

    });
  });

  describe("sellToken",async function () {
    it("Should sell token to the owner", async function () {
    const JourneyToken = await ethers.getContractFactory("JourneyToken");
    const journeyTokenInstance = await JourneyToken.deploy();
    await journeyTokenInstance.waitForDeployment();
    
    const [owner, addr1] = await ethers.getSigners(); // Getting signers for test from network.
    await journeyTokenInstance.connect(addr1).purchaseToken({value: ethers.parseEther("1")}) // addr1 user purchasing token from the owner.
    await journeyTokenInstance.connect(addr1).sellToken(1); // addr1 user sell his tokens to the owner.
    expect(await journeyTokenInstance.balanceOf(addr1.address)).to.be.equal(0) // Check is addr1 user did sell the his tokens.
    })
  })
});
