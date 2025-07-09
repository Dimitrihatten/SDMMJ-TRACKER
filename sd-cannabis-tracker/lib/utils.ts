import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateDaysUntilReset(periodEnd: Date): number {
  const now = new Date()
  const end = new Date(periodEnd)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function ouncesToGrams(ounces: number): number {
  return ounces * 28.3495
}

export function gramsToOunces(grams: number): number {
  return grams / 28.3495
}

export function getProductTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'Edible': '🍪',
    'Tincture': '💧',
    'Topical': '🧴',
    'Capsule': '💊',
    'Concentrate': '🍯',
    'Vape': '💨',
  }
  return icons[type] || '📦'
}

export function getProductTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Edible': 'bg-amber-500',
    'Tincture': 'bg-blue-500',
    'Topical': 'bg-green-500',
    'Capsule': 'bg-purple-500',
    'Concentrate': 'bg-orange-500',
    'Vape': 'bg-indigo-500',
  }
  return colors[type] || 'bg-gray-500'
}

export function calculateAllotmentPercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

export function getAllotmentStatus(percentage: number): {
  status: 'safe' | 'warning' | 'critical'
  message: string
  color: string
} {
  if (percentage >= 90) {
    return {
      status: 'critical',
      message: 'Critical: Near allotment limit',
      color: 'text-red-600',
    }
  } else if (percentage >= 75) {
    return {
      status: 'warning',
      message: 'Warning: Approaching limit',
      color: 'text-yellow-600',
    }
  } else {
    return {
      status: 'safe',
      message: 'Within safe limits',
      color: 'text-green-600',
    }
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}