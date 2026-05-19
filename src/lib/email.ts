/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This file exports exactly one function
 * (sendEmail). Every email type — verification, password reset — calls this
 * same helper. Do not add per-email-type senders; pass different subject and
 * react props instead.
 */
import { Resend } from 'resend'
import { RESEND_FROM_EMAIL } from '@/lib/constants'

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    // Provide a dummy key if env var is missing to prevent constructor throw during build
    resendClient = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')
  }
  return resendClient
}

type SendEmailParams = {
  to: string
  subject: string
  react: React.ReactElement
}

/**
 * Law of Leaky Abstractions — The caller only learns whether the email was
 * accepted for delivery by Resend's API. SMTP-level bounces, spam rejections,
 * or invalid "from" domain errors are logged server-side and never exposed.
 *
 * Postel's Law — Return a boolean so callers can decide their own error UX
 * without needing to understand the email delivery stack.
 */
export async function sendEmail({ to, subject, react }: SendEmailParams): Promise<boolean> {
  try {
    const client = getResendClient()
    const { error } = await client.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      react,
    })

    if (error) {
      console.error('[EMAIL_SEND_ERROR]', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[EMAIL_SEND_EXCEPTION]', error)
    return false
  }
}
