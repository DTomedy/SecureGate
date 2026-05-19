import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { SMTP_FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '@/lib/constants'

type SendEmailParams = {
  to: string
  subject: string
  react: React.ReactElement
}

function getTransporter(): nodemailer.Transporter {
  const missing = []
  if (!SMTP_USER) missing.push('SMTP_USER')
  if (!SMTP_PASS) missing.push('SMTP_PASS')
  if (!SMTP_FROM_EMAIL) missing.push('SMTP_FROM_EMAIL')
  if (missing.length) {
    throw new Error(`Missing SMTP credentials: ${missing.join(', ')}`)
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
    const html = await render(react)
    await getTransporter().sendMail({
      from: SMTP_FROM_EMAIL,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('[EMAIL_SEND_ERROR]', error)
    return false
  }
}
