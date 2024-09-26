import { scratchcsrftoken } from "./defaults";
import fs from 'fs/promises'
import { HttpProxyAgent } from 'http-proxy-agent';
import http from 'http'
import { SocksProxyAgent } from 'socks-proxy-agent';
import Rotator from "./ProxyRotater";
import fetch, { RequestInit } from 'node-fetch'
import { exec } from "child_process";
import { sleep, torAgent } from "./utils";

interface Bot {
    username: string, password: string, token?: string, cookie?,
}

export async function rotateTor() {
    exec('killall -HUP tor');
    await sleep(10)
}

export function torFetch(url, options?: RequestInit) {
    const proxy = 'socks5h://127.0.0.1:9050';
    const endpoint = url;
    const agent = new SocksProxyAgent(proxy);
    return fetch(url,{
        agent,
        ...options,
    })
}

// console.log(await (await fetch('https://api.ipify.org?format=json')).text())
// console.log(await (await torFetch('https://api.ipify.org?format=json')).text())
// process.exit();

export async function botFetch(bot: Bot, url: string, options: RequestInit) {

    // let agent = new HttpProxyAgent('http://152.26.229.93:9443');
    // let agent = new HttpProxyAgent(await Rotator.getMainRotator().getCurrentProxyUrl());
    let agent = torAgent;

    return await fetch(url, {
        ...options,
        "headers": {
            // "accept": "application/json, text/javascript, */*; q=0.01",
            // "accept-language": "en-US,en;q=0.9",

            // "cache-control": "no-cache",
            // "pragma": "no-cache",
            // "priority": "u=1, i",
            // "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",

            // "sec-ch-ua-mobile": "?0",
            // "sec-ch-ua-platform": "\"macOS\"",
            // "sec-fetch-dest": "empty",
            // "sec-fetch-mode": "cors",
            // "sec-fetch-site": "same-origin",

            // "x-requested-with": "XMLHttpRequest",
            // "x-csrftoken": scratchcsrftoken,
            // "cookie": bot.cookie ?? `scratchcsrftoken=${scratchcsrftoken}; permissions=%7B%7D`,
            // "Referer": "https://scratch.mit.edu/",
            // "Referrer-Policy": "strict-origin-when-cross-origin"
            ...options?.headers,
        },
        agent,
    })
}

export function login(bot) {
    // return botFetch(bot, "https://scratch.mit.edu/accounts/login/", {

    //     method: 'POST',
    // })


    return botFetch(bot,"https://scratch.mit.edu/accounts/login/", {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-csrftoken": "nC8MIup6VLD4q0A3WjcvtpgmrtkRd6YK",
          "x-requested-with": "XMLHttpRequest",
          "cookie": "permissions=%7B%7D; scratchcsrftoken=nC8MIup6VLD4q0A3WjcvtpgmrtkRd6YK",
          "Referer": "https://scratch.mit.edu/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        body: JSON.stringify({ username: bot.username, password: bot.password }),
        "method": "POST"
      });
}




await rotateTor()
let bot = await fs.readFile('accounts/Zoogirl431.json')
let ans = await login(bot);
console.log(ans);
console.log(await ans.json())