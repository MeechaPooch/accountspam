import * as cheerio from 'cheerio';
import request from 'request'

export async function getProxyList(): Promise<string[]> {
    let res1 = await fetch('https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt');
    let text = await res1.text();
    let list = text.split('\n');

    let res2 = await fetch('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=20000&country=all&ssl=no&anonymity=all')
    let text2 = await res2.text();
    let list2 = text.split('\n');

    return list.concat(list2)

}

console.log(await getProxyList())

export function getProxyList1(): Promise<string[]> {
    let ip_addresses: string[] = [];
    let port_numbers: string[] = [];

    return new Promise(res => {
        request("https://sslproxies.org/", function (error, response, html) {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);

                $("td:nth-child(1)").each(function (index, value) {
                    ip_addresses[index] = $(this).text();
                });

                $("td:nth-child(2)").each(function (index, value) {
                    port_numbers[index] = $(this).text();
                });
            } else {
                console.log("Error loading proxy, please try again");
            }

            ip_addresses.join(", ");
            port_numbers.join(", ");


            res(ip_addresses.map((addr, index) => `${addr}:${port_numbers[index]}`))

        });
    });
}
