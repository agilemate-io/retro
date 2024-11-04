// import SecureLS from "secure-ls"

export function get(key: string): any {
  // const storage = new SecureLS({ encodingType: 'aes', isCompression: false })
  // return storage.get(key)
  const storage = window.localStorage
  return JSON.parse(storage.getItem(key))
}

export function set(key: string, data: any, password?: string) {
  // const storage = new SecureLS({ encodingType: 'aes', isCompression: false, encryptionSecret: password })
  // storage.set(key, data)
  const storage = window.localStorage
  storage.setItem(key, JSON.stringify(data))
}

export function useStore() { 
  return { get, set }
}
