import { expect, test } from 'vitest'
import { useCrypto } from './crypto'

test('Data encryption and decryption with explicit key', () => {
  const { encrypt, decrypt } = useCrypto()
  const encData = encrypt('data', 'key')
  expect(encData).not.toBe('data')
  const decData = decrypt(encData, 'key')
  expect(decData).toBe('data')
})

test('Data encryption and decryption with default key', () => {
  const { encrypt, decrypt } = useCrypto("My very strong & secret key!")
  const encData = encrypt('data')
  expect(encData).not.toBe('data')
  const decData = decrypt(encData)
  expect(decData).toBe('data')
})
