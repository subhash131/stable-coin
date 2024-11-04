import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
const assert = require("assert");
const fs = require("fs");

const anchorProvider = require("@project-serum/anchor");

const idl = require("../target/idl/stable_fun.json");

const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";
// SOL/USD feed account
const CHAINLINK_FEED = "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR";
const DIVISOR = 100000000;
const keypairPath = require("../id.json");
const STABLE_FUN_PROGRAM_ID = "7GVmoLXf5v1F1E5vcRQLe5vgjVqENTyMsJNZGsnpVZQh";

describe("Get data from oracle feeds", () => {
  it("Query SOL/USD Price Feed!", async () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    // Initialize the program client with the program ID and IDL
    const program = new anchorProvider.Program(
      idl,
      new PublicKey(STABLE_FUN_PROGRAM_ID),
      anchor.AnchorProvider.env()
    );

    //create an account to store the price data
    const priceFeedAccount = anchor.web3.Keypair.generate();

    // Execute the RPC.
    let transactionSignature = await program.methods
      .test()
      .accounts({
        decimal: priceFeedAccount.publicKey,
        chainlinkFeed: CHAINLINK_FEED,
        chainlinkProgram: CHAINLINK_PROGRAM_ID,
      })
      .signers([priceFeedAccount])
      .rpc();

    // Fetch the account details of the account containing the price data
    const latestPrice = await program.account.decimal.fetch(
      priceFeedAccount.publicKey
    );
    console.log("Price Is: " + latestPrice.value / DIVISOR);

    // Ensure the price returned is a positive value
    assert.ok(latestPrice.value / DIVISOR > 0);
  });
});

describe("Register User", () => {
  it("will accept username and registers the user", async () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    // Initialize the program client with the program ID and IDL
    const program = new anchorProvider.Program(
      idl,
      new PublicKey(STABLE_FUN_PROGRAM_ID),
      anchor.AnchorProvider.env()
    );

    const authority = anchor.web3.Keypair.fromSecretKey(
      Uint8Array.from(keypairPath)
    );

    const inputName = "subhash4";

    const [userPda, _bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(inputName)], // username as bytes
      program.programId
    );

    // Execute the RPC.
    const tx = await program.methods
      .registerUser(inputName)
      .accounts({
        user: userPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority]) // Only authority signs here
      .rpc();

    // Fetch the user account details
    const userRes = await program.account.user.fetch(userPda);
    console.log("Registered User is: " + userRes.username);

    // Ensure the username is properly registered
    assert.ok(userRes.username == inputName);
  });
});
