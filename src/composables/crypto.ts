import { AES, enc } from "crypto-js"

let defaultKey: string = ""

export function encrypt(data: string, key: string = defaultKey) {
  return AES.encrypt(data, key).toString()
}
export function decrypt(data: string, key: string = defaultKey) {
  return AES.decrypt(data, key).toString(enc.Utf8)
}

export function useCrypto(key: string = "") {
  if(key) defaultKey = key
  return { encrypt, decrypt }
}
