const {
    Connection,
     PublicKey,
     clusterApiUrl,
     Keypair,
     LAMPORTS_PER_SOL,
     Transaction,
     SystemProgram,
     sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        125, 167, 143, 112, 126,  85, 114,  29, 220,  87, 197,
         13,  87,  86, 221, 250, 162, 252, 106,  42,  41,  27,
        168, 180,  66,  83, 188,  21, 208, 200, 165,   8,  43,
        140,  27, 202,  80, 219, 196, 173, 202, 186, 192,  49,
        100, 100,  18, 204,  95, 190, 173,  94,   5, 208,  47,
         90, 255, 225, 145, 216,  51, 101, 211, 182
    ]
);

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get keypair from secret key
    var fromWallet = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Generate another keypair (account we'll be sending to)
    const toWallet = Keypair.generate();

    // Get the initial wallet balance of the fromWallet
    var fromWalletBalance = await connection.getBalance(fromWallet.publicKey);
    console.log(`Initial balance of fromWallet: ${fromWalletBalance / LAMPORTS_PER_SOL} SOL`);

    var amountToBeTransferred = 0;

    // if the fromWalletBalance is 0, airdrop 2 SOL on the wallet, and calculate amount to be transferred
    // if the fromWalletBalance is != 0, calculate the amount to be transferred

    if(parseInt(fromWalletBalance) == 0) {
        // request airdrop for the fromWallet
        const fromAirDropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            2 * LAMPORTS_PER_SOL
        );

        let latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature
        });

        console.log("Airdrop completed!");
        fromWalletBalance = await connection.getBalance(fromWallet.publicKey);
        console.log("New balance of the fromWallet: ", fromWalletBalance / LAMPORTS_PER_SOL);

        amountToBeTransferred = fromWalletBalance / 2;
    } else {
        amountToBeTransferred = fromWalletBalance / 2;
    }

    // Display the 50% of the fromWalletBalance as amount to be transferred
    console.log("Getting 50% of the balance of fromWallet...");
    console.log(`Amount to be transferred: ${amountToBeTransferred / LAMPORTS_PER_SOL} SOL`);

    var toWalletBalance = await connection.getBalance(toWallet.publicKey);
    console.log(`Initial balance of the toWallet: ${toWalletBalance / LAMPORTS_PER_SOL} SOL`);

    console.log("Sending the 50% of the fromWallet balance to the toWallet...");
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: toWallet.publicKey,
            lamports: amountToBeTransferred,
        })
    );

    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet],
    );

    // get the updated balance of the two wallets
    fromWalletBalance = await connection.getBalance(fromWallet.publicKey);
    toWalletBalance = await connection.getBalance(toWallet.publicKey);
    console.log(`Updated fromWallet balance: ${fromWalletBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`Updated toWallet balance: ${toWalletBalance / LAMPORTS_PER_SOL} SOL`);

    // signature of the transaction
    console.log("Signature: ", signature);
}

transferSol();