import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { SMTP_FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '@/lib/constants'

type SendEmailParams = {
  to: string
  subject: string
  react: React.ReactElement
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }
  return transporter
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
