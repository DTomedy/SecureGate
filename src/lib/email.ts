import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import {
  SMTP_FROM_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  RESEND_FROM_EMAIL,
} from '@/lib/constants'

type SendEmailParams = {
  to: string
  subject: string
  react: React.ReactElement
}

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_dummy_key_for_build') {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

export async function sendEmail({ to, subject, react }: SendEmailParams): Promise<boolean> {
  try {
    // 1. Try Resend first
    const resend = getResendClient()
    if (resend) {
      const { error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        react,
      })

      if (error) {
        console.error('[EMAIL_SEND_ERROR] Resend failed:', error)
        return false
      }
      return true
    }

    // 2. Try SMTP second
    const transporter = getTransporter()
    if (transporter) {
      const html = await render(react)
      await transporter.sendMail({
        from: SMTP_FROM_EMAIL,
        to,
        subject,
        html,
      })
      return true
    }

    // 3. Neither configured
    console.error(
      '[EMAIL_SEND_ERROR] No email provider configured. Please set RESEND_API_KEY or SMTP credentials (SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL).'
    )
    return false
  } catch (error) {
    console.error('[EMAIL_SEND_ERROR] Exception occurred:', error)
    return false
  }
}
