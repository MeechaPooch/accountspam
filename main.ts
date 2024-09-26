let totalCreated = 0;

import puppeteer from 'puppeteer-extra'
import userAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin())
import fs from 'fs/promises'
import { solve } from './solver';
import { Browser } from 'puppeteer';
import Rotator from './ProxyRotater';

let usernames = await getUsernames()

import {
    proxyRequest,
} from 'puppeteer-proxy';


const args = {
    email: 'bigblackkittenslimy@gmail.com',
    password: 'jfoiwljf2sdFJ9',
    createUsername() {
        return `${usernames[Math.floor(Math.random() * usernames.length)]}1`
    },
}



async function newBrowser(proxyUrl) {
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
            '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end', '--disable-features=IsolateOrigins,site-per-process',],
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 
        executablePath: '/opt/homebrew/bin/chromium',
        headless: true, timeout: 0,
        waitForInitialPage: true,
        defaultViewport: { width: 800 + Math.round(Math.random() * 100), height: 600 + Math.round(Math.random() * 100), isMobile: true },
    });

}

async function getUsernames() {
    let usernames = (await fs.readFile('usernames.txt')).toString();
    return usernames.split('\n')
}
import { sleep } from './utils'
function createAccount(browser: Browser, username?, p?): Promise<void | null | { success: boolean, username: string, password: string, info?: string }> {
    let inputtedUsername = username;
    let generate = false;
    if (!username) generate = true

    return new Promise(async res => {

        try {
            browser.on('close', () => { res() })

            // let page = (await browser.pages())[0]
            let page = await browser.newPage()
            await page.setUserAgent(userAgent.random().toString())
            page.bringToFront();

            // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36')

            page.setDefaultNavigationTimeout(1000 * 40)
            page.setDefaultTimeout(1000 * 120)

            let navPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 1000 * 39 })
            await page.goto('https://scratch.mit.edu/join')
            await navPromise


            if (!p) p = args.password;


            await page.waitForSelector('#password')
            await page.type('#password', p)
            await page.type('#passwordConfirm', p)


            let total = 0
            while (true) { // loop in case username exists
                if (total > 10) { res(); return; }
                total++;
                console.log('creating new username')
                if (generate) {
                    console.log('yes making new')
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

            await sleep(100)
            await page.waitForSelector('[type="submit"][content="Create Your Account"]:has(.next-step-title)')
            // console.log('found')
            await page.click('[type="submit"]');

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
                            page.close();
                        } else {
                            console.log('so close, no success')
                            res({ success: false, username: inputtedUsername, password: p })
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
                        // console.error(e)
                     }
                })())])

            res();
        } catch (e) {
            // console.error(e);
            res();
        }
    })
}

async function createAccountAndStoreCredentials(browser, username?, p?) {
    let res = await createAccount(browser, username, p);
    console.log('result was:', res)
    if (res?.success) {
        totalCreated++;
        await storeDeets(res.username, res.password)
    }
    console.log('total created:',totalCreated)
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

const INTERVAL = 1000 * 8;
const MAX_ERRORS_IN_ROW_NON_GOOGLE = 5;
const MAX_GOOGLE_KNOWS_IN_ROW = 3;

async function doCreates(browser: Browser) {

    // let answer = await createAccountAndStoreCredentials();
    // if (answer?.success) {
    if (true) {
        // console.log('IT WAS A SUCCESS!')
        console.log('starting up the factory!')

        let errorCount = 0;
        let errorCountInRowNonGoogle = 2;
        let callitoff = false;
        let googleKnowsInRow = 0;
        while (true) {
            if (callitoff || errorCountInRowNonGoogle > MAX_ERRORS_IN_ROW_NON_GOOGLE || googleKnowsInRow >= MAX_GOOGLE_KNOWS_IN_ROW) break;
            await sleep(INTERVAL);
            console.log('sleep over')
            if (callitoff || errorCountInRowNonGoogle > MAX_ERRORS_IN_ROW_NON_GOOGLE || googleKnowsInRow >= MAX_GOOGLE_KNOWS_IN_ROW) break;

            {
                (async () => {
                    try {
                        let resp = await createAccountAndStoreCredentials(browser);
                        if (resp?.success) {
                            googleKnowsInRow = 0;
                            errorCountInRowNonGoogle = 0;
                        } else {
                            if (resp?.info == 'googleknows') {
                                googleKnowsInRow++;
                                errorCountInRowNonGoogle++;
                            } else if (resp?.info == 'captchaload') {
                                callitoff = true;
                                errorCountInRowNonGoogle++;
                            } else {
                                // callitoff = true;
                                errorCountInRowNonGoogle++;
                            }
                            errorCount++;
                        }

                    } catch (e) {
                        errorCount++;
                        // callitoff = true;
                    }
                })()
            }

        }
        console.log('loop broken')

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

        browser = await newBrowser(proxyUrl);
        await doCreates(browser)
        console.log('DONE')

    } catch (e) {
        console.log('ERROR')
        // console.error(e)
        totalNumberOfBrowsersOpen--;
        browser.close();
        return;
    } finally {
        totalNumberOfBrowsersOpen--;

        browser.close();
    }
   

}

const TOTAL_BROWSERS_AT_ONCE = 10;
let totalNumberOfBrowsersOpen = 0;
async function go() {

    while (true) {
        console.log('waiting', totalNumberOfBrowsersOpen)

        while(totalNumberOfBrowsersOpen>=TOTAL_BROWSERS_AT_ONCE) {await sleep(1000)}

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

go()