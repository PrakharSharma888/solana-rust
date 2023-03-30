import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
    Keypair,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';

const PROGRAM_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../dist/program'),
    'hello_solana-keypair.json'
);
    console.log(PROGRAM_KEYPAIR_PATH);

async function main() {
    console.log('Connecting to cluster...');
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log("bro");
    const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, { encoding: 'utf-8' });
    console.log("bro2");
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const programKeypair = Keypair.fromSecretKey(secretKey);
    let programId = programKeypair.publicKey;
    console.log("PRogram id: ", programId.toBase58());

    console.log('Creating account...');

    const accountKeypair = Keypair.generate();
    const accountPublicKey = accountKeypair.publicKey;
    const airdropSignature = await connection.requestAirdrop(
        accountPublicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    const accountBalance = await connection.getBalance(accountPublicKey);
    console.log('Account balance:', accountBalance);


    console.log('Pinging Program...',  programId.toBase58());
    const instruction = new TransactionInstruction({
        keys: [{ pubkey: accountPublicKey, isSigner: false, isWritable: true }],
        programId,
        data: Buffer.alloc(0),
    });
    const transaction = new Transaction().add(instruction);
    await sendAndConfirmTransaction(connection, transaction, [accountKeypair]);

}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);

// 5TLDbrLsbnXBuJvpdRNFjDPcpi1SsiR5d3sbDH18EGft