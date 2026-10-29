declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAILS?: string;
    INQUIRY_TO?: string;
    MAIL_FROM?: string;
    RESEND_API_KEY?: string;
    MAIL_CONFIG_KEY?: string;
    LOCAL_SMTP_FETCH?: typeof fetch;
    LOCAL_SMTP_ENDPOINT?: string;
    LOCAL_SMTP_TOKEN?: string;
  }
}
