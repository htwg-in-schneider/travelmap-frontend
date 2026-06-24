export const PROFILE_FIELD_LIMITS = {
  displayName: 100,
  bio: 1000,
  street: 100,
  postalCode: 20,
  city: 100,
  country: 100,
} as const

export const ADMIN_USER_LIMITS = {
  ...PROFILE_FIELD_LIMITS,
  usernameMin: 2,
  usernameMax: 40,
  email: 254,
} as const

export const COMMENT_MAX_LENGTH = 1000
export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 2000,
} as const

export type ProfileFieldName = keyof typeof PROFILE_FIELD_LIMITS
export type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>

export type AdminUserFieldName =
  | ProfileFieldName
  | 'username'
  | 'email'
  | 'role'
export type AdminUserFieldErrors = Partial<Record<AdminUserFieldName, string>>

export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

export const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

export function firstError(errors: Record<string, string | undefined>): string {
  return Object.values(errors).find(Boolean) ?? ''
}

function maxLengthError(label: string, value: string | null | undefined, maxLength: number) {
  return value && value.length > maxLength
    ? `${label} darf maximal ${maxLength} Zeichen lang sein.`
    : ''
}

export function validateProfileFields(fields: Record<ProfileFieldName, string>): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}

  if (!fields.displayName.trim()) {
    errors.displayName = 'Name ist ein Pflichtfeld.'
  } else {
    const error = maxLengthError('Name', fields.displayName.trim(), PROFILE_FIELD_LIMITS.displayName)
    if (error) errors.displayName = error
  }

  const optionalFields: Array<[Exclude<ProfileFieldName, 'displayName'>, string]> = [
    ['bio', 'Bio'],
    ['street', 'Straße'],
    ['postalCode', 'PLZ'],
    ['city', 'Ort'],
    ['country', 'Land'],
  ]

  for (const [field, label] of optionalFields) {
    const error = maxLengthError(label, fields[field], PROFILE_FIELD_LIMITS[field])
    if (error) errors[field] = error
  }

  return errors
}

export function validateAdminUserFields(fields: {
  displayName: string
  username: string
  email: string
  bio: string
  street: string
  postalCode: string
  city: string
  country: string
  role: string
}): AdminUserFieldErrors {
  const errors: AdminUserFieldErrors = validateProfileFields(fields)
  const username = fields.username.trim()
  const email = fields.email.trim()

  if (!username) {
    errors.username = 'Username ist ein Pflichtfeld.'
  } else if (
    username.length < ADMIN_USER_LIMITS.usernameMin ||
    username.length > ADMIN_USER_LIMITS.usernameMax
  ) {
    errors.username = `Username muss zwischen ${ADMIN_USER_LIMITS.usernameMin} und ${ADMIN_USER_LIMITS.usernameMax} Zeichen lang sein.`
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username =
      'Username darf nur Buchstaben, Zahlen, Punkte, Unterstriche und Bindestriche enthalten.'
  }

  if (email.length > ADMIN_USER_LIMITS.email) {
    errors.email = `E-Mail darf maximal ${ADMIN_USER_LIMITS.email} Zeichen lang sein.`
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = 'E-Mail ist ungültig.'
  }

  if (!['user', 'support', 'marketing', 'admin'].includes(fields.role)) {
    errors.role = 'Rolle ist ungültig.'
  }

  return errors
}

export function validateContactFields(fields: {
  name: string
  email: string
  message: string
}): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()

  if (!name) {
    errors.name = 'Name ist ein Pflichtfeld.'
  } else {
    const error = maxLengthError('Name', name, CONTACT_FIELD_LIMITS.name)
    if (error) errors.name = error
  }

  if (!email) {
    errors.email = 'E-Mail ist ein Pflichtfeld.'
  } else if (email.length > CONTACT_FIELD_LIMITS.email) {
    errors.email = `E-Mail darf maximal ${CONTACT_FIELD_LIMITS.email} Zeichen lang sein.`
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'E-Mail ist ungültig.'
  }

  if (!message) {
    errors.message = 'Nachricht ist ein Pflichtfeld.'
  } else {
    const error = maxLengthError('Nachricht', message, CONTACT_FIELD_LIMITS.message)
    if (error) errors.message = error
  }

  return errors
}

export function validationMessageFromApi(message: string): string {
  const normalized = message.trim()
  const messages: Record<string, string> = {
    'displayName is required': 'Name ist ein Pflichtfeld.',
    'displayName is too long (max 100 characters)': 'Name darf maximal 100 Zeichen lang sein.',
    'bio is too long (max 1000 characters)': 'Bio darf maximal 1000 Zeichen lang sein.',
    'street is too long (max 100 characters)': 'Straße darf maximal 100 Zeichen lang sein.',
    'postalCode is too long (max 20 characters)': 'PLZ darf maximal 20 Zeichen lang sein.',
    'city is too long (max 100 characters)': 'Ort darf maximal 100 Zeichen lang sein.',
    'country is too long (max 100 characters)': 'Land darf maximal 100 Zeichen lang sein.',
    'username must be between 2 and 40 characters':
      'Username muss zwischen 2 und 40 Zeichen lang sein.',
    'username may only contain letters, numbers, dots, underscores and hyphens':
      'Username darf nur Buchstaben, Zahlen, Punkte, Unterstriche und Bindestriche enthalten.',
    'username is already taken': 'Dieser Username ist bereits vergeben.',
    'email is too long': 'E-Mail darf maximal 254 Zeichen lang sein.',
    'email is invalid': 'E-Mail ist ungültig.',
  }
  return messages[normalized] ?? normalized
}
