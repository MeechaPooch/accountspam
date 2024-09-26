import { SocksProxyAgent } from "socks-proxy-agent"

export function sleep(m) { return new Promise(r => setTimeout(r, m)) }
export const torAgent = new SocksProxyAgent('socks5h://127.0.0.1:9050');