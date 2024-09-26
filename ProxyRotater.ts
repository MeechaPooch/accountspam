import { testProxy, verifyProxy } from "./verifyProxy";
import { getProxyList } from './getProxyList.ts'
import { getProxies } from './getProxyListOriginal.ts'
import { sleep } from "./utils.ts";

let DEBUG = false;
let INTERVAL = 50; //millis

function debug(...strings) {
    if (DEBUG) console.log(...strings)
}


export default class Rotator {

    private static mainRotator: Rotator;

    public static getMainRotator() {
        if (this.mainRotator) return this.mainRotator;
        else return new Rotator();
    }

    private proxies: string[] = [];
    private currentIndex = 0;
    private refreshPromise: Promise<any> | null;

    constructor() {
        this.refreshPromise = this.refreshProxyList().then(async _ => {
            await this.verifyProxies();
            this.refreshPromise = null
        }
        );

        Rotator.mainRotator = this;
    };

    async getCurrentProxyUrl() {
        console.log('getting')
        if (this.refreshPromise) await this.refreshPromise;

        return this.proxies[this.currentIndex]
    }

    async rotate() {
        this.currentIndex++;
        if (this.currentIndex >= this.proxies.length) this.refreshProxyList();
        await this.verifyProxies();
    }

    lastGoodIndex = 0;
    async verifyProxies() {
        console.log('searching for new proxy')
        // return true;
        let found = false;
        let lost = false;
        while (true) {
            if (lost || found) return;
            await sleep(INTERVAL);
            if (lost || found) return;
            {
                (async () => {

                    if (lost || found) return;
                    let thisIndex = ++this.currentIndex;
                    if (!this.proxies[thisIndex]) { lost = true; return; }
                    debug('verifying', this.proxies[thisIndex]) // test
                    let ok = await testProxy(this.proxies[thisIndex]);
                    debug('done verifying') // test
                    debug(ok ? `GOOD PROXY: ${this.proxies[thisIndex]}` : ok)

                    if (lost || found) return;
                    if (ok) {

                        found = true;
                        console.log('found', this.proxies[thisIndex])
                        this.currentIndex = thisIndex;
                        this.lastGoodIndex = thisIndex;
                        return;
                    }
                    // else this.proxies.splice(this.proxies.indexOf(this.proxies[this.currentIndex]), 1);
                })()
            }
        }
        if (lost) {
            this.currentIndex = 0;
        }
    }

    async refreshProxyList() {
        this.proxies = Array.from(new Set([...await getProxyList(),])).map(proxyname => `http://${proxyname}`);
        shuffle(this.proxies)
        // console.log(this.proxies)
        this.currentIndex = 0;
    }

}

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}


// let test = new Rotator();
// console.log(await test.getCurrentProxyUrl())
// console.log('rotating')
// await test.rotate();
// console.log('done')
// console.log(await test.getCurrentProxyUrl())
// await test.rotate();
// console.log(await test.getCurrentProxyUrl())
