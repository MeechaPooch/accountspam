const CONF = {
    MAX_BROWSERS_AT_ONCE: 3,
    NEW_TAB_INTERVAL: 8 * 1000,
    MAX_TABS: 4,

    HEADLESS: true,

    MAX_ERRORS_IN_ROW_NON_GOOGLE: 5,
    MAX_GOOGLE_KNOWS_IN_ROW: 3,
}

console.log('test')

let totalCreated = 0;

import puppeteer from 'puppeteer-extra'
import userAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import fs from 'fs/promises'
import { getTextFromAudio, solve } from './solver';
import { Browser, HTTPRequest, ResponseForRequest } from 'puppeteer';
import Rotator from './ProxyRotater';
import { HttpProxyAgent } from 'http-proxy-agent';
import fetch from 'node-fetch'


let usernames = await getUsernames();
let overrides: Map<string, Partial<ResponseForRequest>> = new Map();

import {
    proxyRequest,
} from 'puppeteer-proxy';


const args = {
    email: 'bigblackkittenslimy@gmail.com',
    createPassword() {
        return Math.random().toString(36).slice(2)
    },
    createUsername() {
        // return `${usernames[Math.floor(Math.random() * usernames.length)]}${Math.random().toString().slice(2, 5)}`
        return `haiku${this.createPassword().slice(-5)}`
    },
}


puppeteer.use(StealthPlugin())
async function newBrowser(proxyUrl) {
    try {
        return await puppeteer.launch({
            args: [
                `--proxy-server=${proxyUrl}`,
                // '--proxy-server=socks5://127.0.0.1:9050',
                '--no-sandbox', '--allow-external-pages',
                '--allow-third-party-modules',
                '--data-reduction-proxy-http-proxies',
                '--disable-web-security',
                '--enable-automation',
                '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
                '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end', '--disable-features=IsolateOrigins,site-per-process',

                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-session-crashed-bubble',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--noerrdialogs',
                '--disable-gpu'
            ],
            // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 
            // executablePath: '/usr/bin/chromium',
            headless: CONF.HEADLESS, timeout: 0,
            waitForInitialPage: true,
            defaultViewport: { width: 800 + Math.round(Math.random() * 100), height: 600 + Math.round(Math.random() * 100), isMobile: true },
            // devtools: true,
        });

    } catch (e) {
        console.error(e);
        return null;
    }
}

async function getUsernames() {
    let usernames = (await fs.readFile('usernames.txt')).toString();
    return usernames.split('\n')
}

async function fetchInterceptedRequest(interceptedRequest: HTTPRequest) {
    if (interceptedRequest.url().includes('engageub')) {
        console.log('YIPPEEE IM A BIG GREEN LEPRACHAUN!!!');
        // console.log(interceptedRequest,interceptedRequest.hasPostData(),interceptedRequest.postData(),)
    }
    let fetchOptions: RequestInit = {
        headers: interceptedRequest.headers(),
        method: interceptedRequest.method(),
    }
    if (interceptedRequest.hasPostData()) fetchOptions.body = interceptedRequest.postData(); // todo make be proxy instead
    // console.log('fetching with options', fetchOptions)
    let response = await fetch(interceptedRequest.url(), fetchOptions)

    if (response.ok) {
        // console.log('overriding success');
        // console.log(response)
        let responseObj = { ...response } // allow body to be editable
        // response.body = JSON.stringify(response.text)
        if (response.body) responseObj.body = await streamToBuffer(response.body)
        // if(response.body) responseObj.body = await streamToString(response.body)
        // console.log('new body', responseObj.body)
        // console.log(response);

        if (responseObj) {
            // console.log('running direct ' + interceptedRequest.url())
            interceptedRequest.respond(responseObj)
        } else {
            interceptedRequest.continue();
        }

        return responseObj
    } else {
        interceptedRequest.continue();
        return false;
    }
}

import { sleep, streamToBuffer, streamToString } from './utils'
function createAccount(browser: Browser, username?, p?): Promise<void | null | { success?: boolean, username?: string, password?: string, info?: string, error?: any, }> {
    let inputtedUsername = username;
    let generate = false;
    if (!username) generate = true;

    return new Promise(async res => {

        try {
            browser.on('close', () => { res({ info: 'browser closed' }) })

            // let page = (await browser.pages())[0]
            let page = await browser.newPage()
            await page.setUserAgent(userAgent.random().toString())


            // page.bringToFront();


            // filter certain requests not through the proxy!
            await page.setRequestInterception(true);
            page.on('request', async interceptedRequest => {
                // console.log(interceptedRequest.url())
                // handle ones that you want to proxy through vanilla network
                if (
                    interceptedRequest.url().includes('engageub')
                    // || interceptedRequest.url().includes('recaptcha__en.js')
                    || (interceptedRequest.url().includes('www.googletagmanager.com') && interceptedRequest.method().toLowerCase() == 'get')
                    || interceptedRequest.url().includes('www.recaptcha.net/recaptcha/api.js')
                    || interceptedRequest.url().includes('api.scratch.mit.edu/accounts/checkusername')
                    // || interceptedRequest.url().includes('www.google.com/js/')
                    // || interceptedRequest.url().includes('www.recaptcha.net/recaptcha/api2')
                    // || interceptedRequest.url().includes('www.googletagmanager.com')
                    // || interceptedRequest.url().includes('www.googletagmanager.com')
                    // || interceptedRequest.url().includes('www.googletagmanager.com/gtag')
                    // || interceptedRequest.url().includes('www.googletagmanager.com/gtm')
                ) {

                    let result = await fetchInterceptedRequest(interceptedRequest);

                } else

                    if (overrides.has(interceptedRequest.url() && interceptedRequest.method().toLowerCase() == 'get')) {

                        interceptedRequest.respond(overrides.get(interceptedRequest.url())!);
                    } else if (
                        (
                            (interceptedRequest.url().includes('scratch.mit.edu') && new URL(interceptedRequest.url()).pathname.slice(-5).includes('.'))
                            || interceptedRequest.url() == ('https://scratch.mit.edu/join')
                            || interceptedRequest.url().includes('scratch.mit.edu/session')
                            || interceptedRequest.url().includes('gstatic.com')
                            // || interceptedRequest.url().includes('engageub.pythonanywhere.com')
                        )
                        && interceptedRequest.method().toLowerCase() == 'get'
                    ) { // test if is filename 
                        let responseObj = await fetchInterceptedRequest(interceptedRequest);
                        if (responseObj) {
                            overrides.set(interceptedRequest.url(), responseObj); // test types
                            return;
                        } else {
                            console.log('whomp whomp')
                        }
                    } else {
                        // interceptedRequest.
                        interceptedRequest.continue();
                        // await sleep(1000)


                        let response = interceptedRequest.responseForRequest()
                        // console.log(response)
                    }
            });


            // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36')

            page.setDefaultNavigationTimeout(1000 * 40)
            page.setDefaultTimeout(1000 * 120)

            console.log('loading page')

            page.evaluate(getTextFromAudio);

            let navPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 1000 * 39 })
            await page.goto('https://scratch.mit.edu/join')
            await navPromise

            console.log('page loaded!')

            if (!p) p = args.createPassword();

            console.log('inputting fields, waiting for password')

            await page.waitForSelector('#password')
            await page.type('#password', p)
            await page.type('#passwordConfirm', p)

            console.log('inputted password')

            let total = 0
            while (true) { // loop in case username exists
                if (total > 10) { res({ info: 'username recreate loop' }); return; }
                total++;
                console.log('creating new username')
                if (generate) {
                    console.log('yes making new', total)
                    inputtedUsername = args.createUsername();
                    console.log(inputtedUsername)
                }

                // await page.waitForNavigation({waitUntil: 'networkidle2'})

                // page.evaluate(()=>{alert('okay')})

                await page.type('#username', inputtedUsername);

                await page.click('[type="submit"]');

                let elem = await Promise.race([page.waitForSelector('#country'), page.waitForSelector('.validation-error')])
                if (await elem?.evaluate(e => e.classList.contains('validation-error')) == false) { break }

                const inputValue = await page.$eval('#username', el => (el as HTMLInputElement).value);
                // focus on the input field
                await page.click('#username');
                for (let i = 0; i < inputValue.length; i++) {
                    await page.keyboard.press('Backspace');
                }

                console.log('that didnt work, making new')
                await sleep(500)


            }

            await page.select('#country', 'United States')

            await page.click('[type="submit"]');

            await page.waitForSelector('#birth_month')
            await page.select('#birth_month', 'May')
            await page.select('#birth_year', String(Math.round(1980 + 40 * Math.random())))

            await page.click('[type="submit"]');

            await page.waitForSelector('#GenderRadioOptionPreferNot')

            await page.click('#GenderRadioOptionPreferNot')

            await page.click('[type="submit"]');

            page.waitForSelector('.registration-error-msg', { timeout: 1000 * 600 }).then((err) => {
                // console.log('GOOGLE error message!!!')
                res({ success: false, username: inputtedUsername, password: p, info: 'captchaload' });
            })

            await page.waitForSelector('#email')
            await page.type('#email', args.email)

            console.log('done. waiting for submit button')

            await sleep(100)
            await page.waitForSelector('[type="submit"][content="Create Your Account"]:has(.next-step-title)')
            // console.log('found')
            await page.click('[type="submit"]');

            console.log('clicked, waiting for google')

            await Promise.all([(
                (async () => {
                    sleep(1000 * 60);
                })()
                ,
                (async () => {
                    try {
                        await page.waitForSelector('iframe[title="recaptcha challenge expires in two minutes"]');
                        // console.log('found iframe')
                        let title = await page.evaluate(() => { return (document.querySelector('iframe[title="recaptcha challenge expires in two minutes"]') as HTMLIFrameElement)?.title }) as string;
                        console.log('title', title)
                        let frames = await page.frames();
                        // console.log(frames.length, await Promise.all(frames.map(frame => frame)));

                        {
                            (async () => {
                                // blocks until element shows up
                                let item = await (await (await page.waitForSelector('iframe[src*="api2/bframe"]'))?.contentFrame())?.waitForSelector('.rc-doscaptcha-body-text');
                                // when error element shows up, say so
                                res({ success: false, username: inputtedUsername, password: p, info: 'googleknows' })
                                // page.close();
                            })();
                        }

                        // page.evaluate(() => {
                        //     return new Promise(async res => {
                        //         console.log('test')
                        //         function ifqSelector(selector) {
                        //             // @ts-ignore
                        //             return document.querySelector('iframe[src*="api2/bframe"]')?.contentWindow?.document?.querySelector?.(selector)
                        //         }
                        //         function sleep(m) { return new Promise(r => setTimeout(r, m)) }

                        //         while (true) {
                        //             let isThing = ifqSelector('.rc-doscaptcha-body-text')?.innerText?.includes?.('protect')
                        //             await sleep(1000);
                        //             console.log('going again')
                        //             if (isThing) {
                        //                 console.log('it knew!')
                        //                 res(true)
                        //                 break;
                        //             }
                        //         }
                        //     })
                        // }).then(ress => {
                        //     console.log('google knows:', ress);
                        //     res({ success: false, username, password: p })
                        // })

                        sleep(1000 * 10).then(() => { page.evaluate(solve); })
                        sleep(1000 * 20).then(() => { page.evaluate(solve); })
                        sleep(1000 * 40).then(() => { page.evaluate(solve); })
                        await sleep(1000);
                        await page.evaluate(solve);

                        await Promise.race([page.waitForSelector('.welcome-step-image', { timeout: 1000 * 600 }), sleep(1000 * 15)]);
                        if ((await page.waitForSelector('.welcome-step-image'))) {
                            console.log('success!!')
                            res({ success: true, username: inputtedUsername, password: p })
                            console.log('PAGE CLOSING SUCCESS')
                            try { page.close(); } catch (e) { }
                        } else {
                            console.log('so close, no success')
                            res({ success: false, username: inputtedUsername, password: p })
                            console.log('PAGE CLOSING NEAR SUCCESS')
                            try { page.close(); } catch (e) { }
                        }

                        // await sleep(1000 * 1000)
                        // for (let frame of frames) {
                        //     // let thisTitle = await frame.evaluate((f)=>f)
                        //     let thisTitle = frame.url
                        //     console.log(thisTitle);
                        //     if(thisTitle==title) {
                        //         console.log('got frame', frame.title)

                        //         // await page.evaluate(()=>alert('solving'))
                        //         // await frame.page().evaluate(solve);
                        //         // await frame.waitForNavigation({ waitUntil: 'load' })
                        //         // await frame.waitForSelector('.rc-button.goog-inline-block.rc-button-audio')
                        //         await frame.waitForSelector('.rc-button-audio')

                        //         console.log('solving in 100 ms')
                        //         await sleep(100)
                        //         await page.evaluate(solve);
                        //         console.log('done');
                        //         res();
                        //         return;
                        //     }
                        // }

                    } catch (e) {
                        console.error(e)
                        console.log('PAGE CLOSING FROM ERROR')
                        try { page.close(); } catch (e) { }
                    }
                })())])

            res({ info: 'timed out waiting for captcha to appear and solve' });
            console.log('PAGE CLOSING CAPTCHA TIMEOUT')
            try { page.close(); } catch (e) { }
        } catch (e) {
            // console.error(e);
            res({ error: e });
        }
    })
}

async function createAccountAndStoreCredentials(browser, username?, p?) {
    let res = await createAccount(browser, username, p);
    if (res?.success) {
        totalCreated++;
        if (!res.username || !res.password) return;
        await storeDeets(res.username, res.password)
    }
    console.log('total created:', totalCreated)
    return res;

}

function storeDeets(u: string, p: string) {
    return fs.writeFile(`./accounts/${u}.json`, JSON.stringify({
        token: null,
        username: u,
        password: p,
    }));
}

// let usernames = await getUsernames()
// let username = `${usernames[Math.floor(Math.random() * usernames.length)]}1`
// let password = '3uiwefhjskd'
// createAccount(username, password)
// page.do('create an account') // does it conciously the first time, then saves steps to quickly reproduce.
// app with interface where people can select folders to pull from and then ask the ai to complete a certain task
import { emailLoop } from './email/emailServer.ts'
async function startEmailResponding() {
    emailLoop();
}

let pr = new Rotator();

async function doCreates(browser: Browser, proxyUrl:string) {

    // let answer = await createAccountAndStoreCredentials();
    // if (answer?.success) {
    if (true) {
        // console.log('IT WAS A SUCCESS!')
        console.log('starting up the factory!')

        let errorCount = 0;
        let errorCountInRowNonGoogle = 2;
        let callitoff = false;
        let googleKnowsInRow = 0;
        let numTabs = 0
        while (true) {
            if (callitoff || errorCountInRowNonGoogle > CONF.MAX_ERRORS_IN_ROW_NON_GOOGLE || googleKnowsInRow >= CONF.MAX_GOOGLE_KNOWS_IN_ROW) break;
            await sleep(CONF.NEW_TAB_INTERVAL);
            while (numTabs >= CONF.MAX_TABS) { await sleep(100) }
            console.log('sleep over')
            if (callitoff || errorCountInRowNonGoogle > CONF.MAX_ERRORS_IN_ROW_NON_GOOGLE || googleKnowsInRow >= CONF.MAX_GOOGLE_KNOWS_IN_ROW) break;
            numTabs++;

            {
                (async () => {
                    try {
                        let resp = await createAccountAndStoreCredentials(browser);
                        console.log(resp)
                        numTabs--;
                        if (resp?.success) {
                            googleKnowsInRow = 0;
                            errorCountInRowNonGoogle = 0;
                        } else {
                            if (resp?.info == 'googleknows') {
                                googleKnowsInRow++;
                                errorCountInRowNonGoogle--;
                            } else if (resp?.info == 'captchaload') {
                                callitoff = true;
                            } else if (resp?.info == 'username recreate loop') {
                                // callitoff = true;
                                console.log('username recreate loop for',proxyUrl)
                            } else {
                                console.log('non google error')
                                // callitoff = true;
                                errorCountInRowNonGoogle++;
                            }
                            errorCount++;
                            errorCountInRowNonGoogle++;
                        }

                    } catch (e) {
                        console.error('error', e)
                        errorCount++;
                        numTabs--;
                        // callitoff = true;
                    }
                })()
            }

        }
        console.log('loop broken [callitoff,errCount,errCountInRowNonGoogle,googleKnowsInRow,numTabs]', callitoff, errorCount, errorCountInRowNonGoogle, googleKnowsInRow, numTabs)

    } // make more. until not success
}

async function doItWithProxy(proxyUrl) {
    let browser;
    try {
        // await newBrowser('http://assortedgummies.uk.to:6969')
        // await newBrowser('http://173.249.60.246:14344')
        // await newBrowser('http://152.53.19.8:3128')
        // await newBrowser('socks5://45.77.222.98:10312')
        totalNumberOfBrowsersOpen++;

        console.log('initting browser')
        browser = await newBrowser(proxyUrl);
        if (!browser) { totalNumberOfBrowsersOpen--; return; }
        console.log('browser initted')
        await Promise.race([
            doCreates(browser,proxyUrl),
            // test proxy can connect
            new Promise(async res => {
                try {
                    const agent = new HttpProxyAgent(proxyUrl);
                    // different proxy test urls
                    let response = await fetch('https://api.scratch.mit.edu/accounts/checkusername/testtset/', { agent });
                    // let response = await fetch('https://scratch.mit.edu/join', { agent });
                    // let response = await fetch("https://api.scratch.mit.edu/accounts/checkpassword", {
                    //     agent,
                    //     "headers": {
                    //       "accept": "application/json",
                    //       "accept-language": "en-US,en;q=0.9",
                    //       "content-type": "application/json",
                    //       "priority": "u=1, i",
                    //       "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                    //       "sec-ch-ua-mobile": "?0",
                    //       "sec-ch-ua-platform": "\"macOS\"",
                    //       "sec-fetch-dest": "empty",
                    //       "sec-fetch-mode": "cors",
                    //       "sec-fetch-site": "same-site",
                    //       "Referer": "https://scratch.mit.edu/",
                    //       "Referrer-Policy": "strict-origin-when-cross-origin"
                    //     },
                    //     "body": "{\"password\":\"testtesttest\"}",
                    //     "method": "POST"
                    //   });
                    console.log('response status',response.status,proxyUrl)
                    if([501,].includes(response.status)) {
                        console.log('destroying proxy with status '+response.status);
                        res({youreDone:true})
                    }
                } catch (e) {
                    console.log('BIG ERROR!, proxy couldnt connect. Destorying browser');
                    console.error(e);
                    res({youreDone:true})
                }
            })
        ])
        console.log('destroying browser after finish or proxy error')

    } catch (e) {
        console.log('ERROR THAT CAUSED BROWSER TO STOP LOOPING')
        console.error(e)
        totalNumberOfBrowsersOpen--;

        await browser.close();
        browser.process()?.kill()
        return;
    } finally {
        totalNumberOfBrowsersOpen--;

        await browser.close();
        browser.process()?.kill()

    }


}

let totalNumberOfBrowsersOpen = 0;
async function go() {

    while (true) {
        console.log('waiting', totalNumberOfBrowsersOpen)

        while (totalNumberOfBrowsersOpen >= CONF.MAX_BROWSERS_AT_ONCE) { await sleep(1000) }

        console.log('starting up', totalNumberOfBrowsersOpen)

        doItWithProxy(await pr.getCurrentProxyUrl())

        await pr.rotate()

        await sleep(1000);
    }



}

process.on('uncaughtException', function (err) {
    // console.error(err);
    // console.log("Node NOT Exiting...");
});

process.stdin.resume(); // so the program will not close instantly


import { spawn } from 'child_process'
import { error } from 'console';
async function exitHandler(options, exitCode) {
    if (options.cleanup) {
        console.log('total created:',totalCreated)
        console.log('killing chromium instances and waiting 5 seconds...');
        spawn('pkill chromium');
        await sleep(1000 * 5);
        console.log('done waiting')
    }

    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true, cleanup: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true, cleanup: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true, cleanup: true }));

// catches uncaught exceptions
startEmailResponding();
go();