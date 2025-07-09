import axios from 'axios'

const VERIFY_API_URL = process.env.MED_VERIFY_API_URL || 'https://medcannabisverify.sd.gov/api'
const API_KEY = process.env.MED_VERIFY_API_KEY

// Valid test card numbers for development
const VALID_TEST_CARDS = ['4YBPK2GJ2', 'TEST123456', 'DEMO789012']

export interface VerificationResult {
  isValid: boolean
  cardNumber?: string
  expirationDate?: Date
  patientName?: string
  error?: string
}

export async function verifyMedicalCard(cardNumber: string): Promise<boolean> {
  try {
    // Clean the card number
    const cleanedNumber = cardNumber.trim().toUpperCase()
    
    // In development, accept test cards
    if (process.env.NODE_ENV === 'development' && VALID_TEST_CARDS.includes(cleanedNumber)) {
      return true
    }

    // Make API call to SD Medical Cannabis Verification
    const response = await axios.post(
      `${VERIFY_API_URL}/verify`,
      {
        cardNumber: cleanedNumber,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    )

    return response.data?.isValid === true
  } catch (error) {
    console.error('Medical card verification error:', error)
    
    // In production, fail closed (deny access on error)
    // In development, allow test cards even if API fails
    if (process.env.NODE_ENV === 'development' && VALID_TEST_CARDS.includes(cardNumber.trim().toUpperCase())) {
      return true
    }
    
    return false
  }
}

export async function getCardDetails(cardNumber: string): Promise<VerificationResult> {
  try {
    const cleanedNumber = cardNumber.trim().toUpperCase()
    
    // Mock data for test cards in development
    if (process.env.NODE_ENV === 'development' && VALID_TEST_CARDS.includes(cleanedNumber)) {
      return {
        isValid: true,
        cardNumber: cleanedNumber,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        patientName: 'Test Patient',
      }
    }

    const response = await axios.get(
      `${VERIFY_API_URL}/card/${cleanedNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 10000,
      }
    )

    return {
      isValid: response.data?.isValid || false,
      cardNumber: response.data?.cardNumber,
      expirationDate: response.data?.expirationDate ? new Date(response.data.expirationDate) : undefined,
      patientName: response.data?.patientName,
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Verification failed',
    }
  }
}

// Validate card format
export function isValidCardFormat(cardNumber: string): boolean {
  // South Dakota medical cannabis cards are typically alphanumeric
  // Example format: 4YBPK2GJ2 (10 characters)
  const cardPattern = /^[A-Z0-9]{8,12}$/
  return cardPattern.test(cardNumber.trim().toUpperCase())
}

// Check if card is expired
export async function isCardExpired(cardNumber: string): Promise<boolean> {
  const details = await getCardDetails(cardNumber)
  if (!details.isValid || !details.expirationDate) {
    return true
  }
  
  return details.expirationDate < new Date()
}