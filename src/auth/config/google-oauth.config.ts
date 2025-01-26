import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuthConfig', () => ({
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  clinetSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  callBackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
}));
