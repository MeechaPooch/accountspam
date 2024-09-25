import ProxyVerifier from 'proxy-verifier'

const CHECK_TIMEOUT = 1000 * 5;
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch'




export async function testProxy(proxyUrl: string): Promise<boolean> {

    try {
        // Target website URL
        const targetUrl = 'https://ident.me/ip';


        // Create a new Proxy Agent
        const proxyAgent = new HttpsProxyAgent(proxyUrl);

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT)

        // Fetch the target website using the proxy agent
        const response = await fetch(targetUrl, { agent: proxyAgent, signal:controller.signal });

        return response.ok;


    } catch (e) {
        return false;
    }

}


export function verifyProxy(proxyString: string): Promise<boolean> {

    let proxy = {
        ipAddress: proxyString.split(':')[0],
        port: parseInt(proxyString.split(':')[1]),
        protocol: 'http',
    }

    return Promise.race<boolean>([new Promise(res => {

        ProxyVerifier.testAll(proxy, {}, function (error, result) {

            // console.log(result)
            let ok = result?.protocols?.http?.ok;

            res(ok);
        });

    }), new Promise(res => {
        setTimeout(_ => res(false), CHECK_TIMEOUT)
    })])
}

