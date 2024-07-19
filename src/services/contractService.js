import { ethers } from 'ethers';
import RockPaperScissors from '../abi/RockPaperScissorsV2.json';

const provider = new ethers.BrowserProvider(window.ethereum);
// const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
console.log(provider)
const contractAddress = '0xad8dfa16521111872300654cdf020a1748c56037';
const rps = new ethers.Contract(contractAddress, RockPaperScissors.abi, provider);

export async function queryGames() {
    const count = await rps.gameCounter();
    const results = [];

    for (let index = 1; index <= count; index++) {
        const res = await rps.games(index);
        results.push(res);
    }  

    return results;
}

export async function createGame(pickIndex, secret, bet, expiration) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = await provider.getSigner();
    const expirationDate = new Date(expiration);
    // console.log(expiration, expirationDate.getTime()/1000);

    // const choices = ["Rock", "Paper", "Scissors"];
    // const choice = choices[pickIndex];
    const choiceEnum = pickIndex + 1;
    const commitment = ethers.solidityPackedKeccak256(["uint8", "string"], [choiceEnum, secret]);

    await rps.connect(signer).createGame(
        commitment, 
        expirationDate.getTime()/1000, 
        { value: ethers.parseEther(bet) }
    );
}

export async function joinGame(gameId, bet, pickIndex, secret) {
    const signer = await provider.getSigner();

    const choiceEnum = pickIndex + 1;
    const commitment = ethers.solidityPackedKeccak256(["uint8", "string"], [choiceEnum, secret]);

    await rps.connect(signer).joinGame(
        gameId, 
        commitment, 
        { value: ethers.parseEther(bet) }
    );
}

export async function revealGame(gameId, pickIndex, secret) {
    const signer = await provider.getSigner();
    const choiceEnum = pickIndex + 1;

    await rps.connect(signer).revealChoice(
        gameId, 
        choiceEnum,
        secret 
    );   
}

export async function listenToEvents(storeObj) {
    rps.on('GameCreated', async (newGameId, creator, bet, createTime, expiration) => {
        storeObj.createGame(newGameId, creator, bet, createTime, expiration);
    });
}
