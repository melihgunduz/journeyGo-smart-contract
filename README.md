# rise-in-solidity-bootcamp-september-competition-final-case-smart-contract
This project is a back end part of Rise In Solidity & BNB Chain Development Bootcamp September competition.
Welcome to the JourneyGo smart contract!

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Future Ideas](#future-ideas)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Run](#run)


## Overview

This smart contract provides user to safety token operations for our project.

## Features

- Buy token.
- Create journey.
- Pay for journey.
- Reserve a journey.
- Confirm journey.
- Burn token. (After journey confirmed, automatically)
- Distribute rewards. (After journey confirmed, automatically)

## Getting Started

Follow the steps to set up the smart contract locally and test, deploy etc.

### Prerequisites

1. Node.js: Ensure Node.js is installed. Download it from [nodejs.org](https://nodejs.org/).

### Installation

1. Clone the repository:

```bash

  git clone https://github.com/melihgunduz/september-competition-smart-contract.git
```

2. Navigate to the project directory:

```bash
  cd september-competition-smart-contract
```

3. Install required npm packages:

```bash
 npm install
```
4. Create secrets.json at root of the project:
You can create BSCAPIKEY from https://bscscan.com/myapikey
MNEMONIC is 12 word secret phrase of your wallet
```json
  {
    "MNEMONIC": "test test test test test .... test",
    "BSCAPIKEY": "bscscanApiKey"
  }
```

## Run
Before compile contract I suggest clean first
```bash
  npx hardhat clean
```
To compile contract follow this code
```bash
  npx hardhat compile
```
To test contract follow this code
```bash
  npx hardhat test
```
To deploy contract follow this code
```bash
  npx hardhat run scripts/deploy.ts
```

