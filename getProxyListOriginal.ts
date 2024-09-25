import ProxyScraper from 'simple-proxy-scraper';

let options = {
    timeout: 1000, //Timeout of proxies in MS
    proxytype: 'all', //Type of proxy - Must be an element of the array ['http', 'socks4', 'socks5', 'all']
    // anonimity: 'elite', //Must be an element of the array ['elite', 'anonymous', 'transparent', 'all']
    // country: 'us', //Must be a country code
    // ssl: 'yes', //Whether proxy has SSL or not - Must be type ['yes', 'no', 'all']
    limit: 1000 //Must be an integer - Amount of proxies it limits response to
}

export function getProxies() { return ProxyScraper.ProxyScrape.getProxies(options) }
