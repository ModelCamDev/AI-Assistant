import crypto from 'crypto';
// Encode the string
export const hashString = (text:string) => {
    return crypto.createHash('sha1').update(text).digest('hex');
}