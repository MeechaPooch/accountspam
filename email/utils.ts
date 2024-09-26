export function encodeBase64Url(buffer:Buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

export function decodeBase64Url(base64url:string) {
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/')

    return Buffer.from(base64, 'base64')
}