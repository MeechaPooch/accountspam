import { SocksProxyAgent } from "socks-proxy-agent"

export function sleep(m) { return new Promise(r => setTimeout(r, m)) }
export const torAgent = new SocksProxyAgent('socks5h://127.0.0.1:9050');


import { Readable } from 'stream';

export async function streamToBuffer(stream) {
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk); // Collect each Uint8Array chunk
    }

    // Concatenate all chunks into a single Buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = Buffer.alloc(totalLength);
    let position = 0;

    for (const chunk of chunks) {
        buffer.set(chunk, position);
        position += chunk.length;
    }

    return buffer;
}


export async function streamToString(stream: ReadableStream) {
    const reader = stream.getReader()
    let html = ''
    while (true) {
        const { value, done } = await reader.read()
        if (value) {
            html += new TextDecoder().decode(value)
        }
        if (done) {
            return html
        }
    }
}

export async function streamToStringOld(stream: ReadableStream<Uint8Array<ArrayBufferLike>>) {
    const chunks: any = [];

    // Use async iteration to read from the stream
    for await (const chunk of stream) {
        chunks.push(chunk);  // Collect each Uint8Array chunk
    }

    // Concatenate all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const resultArray = new Uint8Array(totalLength);

    let position = 0;
    for (const chunk of chunks) {
        resultArray.set(chunk, position);
        position += chunk.length;
    }

    // Convert the Uint8Array to a string
    return new TextDecoder().decode(resultArray);
}