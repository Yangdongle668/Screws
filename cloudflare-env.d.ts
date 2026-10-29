declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAILS?: string;
    INQUIRY_TO?: string;
    MAIL_FROM?: string;
    RESEND_API_KEY?: string;
  }
}
