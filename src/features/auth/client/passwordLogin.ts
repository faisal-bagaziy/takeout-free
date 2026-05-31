import { authClient } from './authClient'

type Result =
  | { success: true; error?: undefined }
  | {
      success: false
      error: { code: string; title: string; message: string }
    }

/**
 * Login with email and password. Auto-creates account if user doesn't exist yet.
 */
export async function passwordLogin(email: string, password: string): Promise<Result> {
  const { error: signInError } = await authClient.signIn.email({ email, password })

  if (!signInError) {
    return { success: true }
  }

  const { code: signInCode } = standardizeBetterAuthError(signInError)

  // Better Auth returns INVALID_EMAIL_OR_PASSWORD for both wrong password and
  // unknown email. Try sign-up so new users don't have to use a separate form.
  if (signInCode === 'INVALID_EMAIL_OR_PASSWORD') {
    const name = email.split('@')[0]
    const { error: signUpError } = await authClient.signUp.email({ email, password, name })

    if (!signUpError) {
      return { success: true }
    }

    const { code: signUpCode } = standardizeBetterAuthError(signUpError)

    // Sign-up failed because email already exists → wrong password
    if (signUpCode === 'USER_ALREADY_EXISTS') {
      return {
        success: false,
        error: {
          code: signInCode,
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect. Please try again.',
        },
      }
    }

    const { message } = standardizeBetterAuthError(signUpError)
    return {
      success: false,
      error: {
        code: signUpCode,
        title: 'Sign Up Failed',
        message: `Could not create account: "${message}" (${signUpCode}).`,
      },
    }
  }

  const { message } = standardizeBetterAuthError(signInError)
  return {
    success: false,
    error: {
      code: signInCode,
      title: 'An Error Occurred',
      message: `Failed to log in: "${message}" (${signInCode}). Please try again.`,
    },
  }
}

export function standardizeBetterAuthError(error: unknown) {
  let code = 'UNKNOWN'
  let message = 'Unknown error'

  if (error && typeof error === 'object') {
    const errorCode = Reflect.get(error, 'code')
    if (errorCode && typeof errorCode === 'string') {
      code = errorCode
    }

    const errorMessage = Reflect.get(error, 'message')
    if (errorMessage && typeof errorMessage === 'string') {
      message = errorMessage
    }
  }

  return { code, message }
}
