import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const algorithm = 'aes-256-gcm'

// Get encryption key from environment variable
const getKey = () => {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  // Derive a 32-byte key from the provided key
  return scryptSync(key, 'salt', 32)
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Combine iv, authTag, and encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedData: string): string {
  const key = getKey()
  const parts = encryptedData.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Hash sensitive data for storage (one-way)
export function hashData(data: string): string {
  const hash = scryptSync(data, process.env.ENCRYPTION_KEY || 'default-salt', 64)
  return hash.toString('hex')
}

// Mask sensitive data for display
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length <= 4) return cardNumber
  return cardNumber.slice(0, 2) + '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-2)
}

// Encrypt object fields
export function encryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encrypted = { ...obj }
  
  for (const field of fieldsToEncrypt) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]) as any
    }
  }
  
  return encrypted
}

// Decrypt object fields
export function decryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const decrypted = { ...obj }
  
  for (const field of fieldsToDecrypt) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]) as any
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error)
      }
    }
  }
  
  return decrypted
}