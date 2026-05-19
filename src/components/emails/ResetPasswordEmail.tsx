interface ResetPasswordEmailProps {
  name: string
  resetUrl: string
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{ backgroundColor: '#EFF6FF' }}
    >
      <tr>
        <td align="center" style={{ padding: '40px 16px' }}>
          <table
            width="480"
            cellPadding="0"
            cellSpacing="0"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            <tr>
              <td style={{ padding: '40px 40px 0' }}>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#1E3A5F',
                    margin: '0 0 8px',
                    textAlign: 'center' as const,
                  }}
                >
                  Reset your password
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: '0 0 24px',
                    textAlign: 'center' as const,
                    lineHeight: '24px',
                  }}
                >
                  Hi {name}, we received a request to reset the password for
                  your SecureGate account. Click the button below to set a new
                  password.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style={{ padding: '0 40px 32px' }}>
                <a
                  href={resetUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 600,
                    padding: '14px 32px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center' as const,
                  }}
                >
                  Reset password
                </a>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#9CA3AF',
                    margin: '24px 0 0',
                    textAlign: 'center' as const,
                    lineHeight: '20px',
                  }}
                >
                  This link expires in 1 hour. If you did not request a password
                  reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '24px 40px',
                  borderTop: '1px solid #E5E7EB',
                  textAlign: 'center' as const,
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    margin: '0',
                  }}
                >
                  SecureGate &mdash; Identity &amp; Access Management
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  )
}
