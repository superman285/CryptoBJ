import axios from 'axios';

// console.log(process.env);
// const apiUrl = 'http://api.beta.cryptofate.io';
const apiUrl = 'http://localhost:3000';

export async function getMyBets(address) {
    return (await axios.request({
        method: 'GET',
        url: `${apiUrl}/dice/${address}/top.json`,
        mode: 'cors',
        withCredentials: 'include',
    })).data;
}

export async function getLotteryResult(id) {
    return (await axios.request({
        method: 'GET',
        url: `${apiUrl}/dice/tx/${id}/result.json`,
        mode: 'cors',
        withCredentials: 'include',
    })).data;
}

export async function getAllBets() {
    return (await axios.request({
        method: 'GET',
        url: `${apiUrl}/dice/top.json`,
        mode: 'cors',
        withCredentials: 'include',
    })).data;
}

export async function getDiceAddress() {
    return (await axios.request({
        method: 'GET',
        url: `${apiUrl}/dice/address.json`,
        mode: 'cors',
        withCredentials: 'include',
    })).data.hex;
}

export function getBet() {
    return axios.request({
        method: 'GET',
        url: '/dice/tron/bet',
    });
}

export function postBet(betMask, modulo, commitLastBlock, commit, r, s) {
    return axios.request({
        method: 'POST',
        url: '/dice/tron/bet',
        data: {
            betMask,
            modulo,
            commitLastBlock,
            commit,
            r,
            s,
        },
    });
}
