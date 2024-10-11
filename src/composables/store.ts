import SecureLS from "secure-ls";

export function get(key: string): any {
  const storage = new SecureLS({ encodingType: 'aes', isCompression: false })
  return storage.get(key)
}
export function set(key: string, data: any, password?: string) {
  const storage = new SecureLS({ encodingType: 'aes', isCompression: false, encryptionSecret: password })
  storage.set(key, data)
}


export function useStore() { 
  return { get, set }
}
