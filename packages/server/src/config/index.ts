import { config } from 'dotenv';
import { createHmac } from 'crypto';

config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const ZHIPUAI_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
export const API_KEY = process.env.ZHIPUAI_API_KEY ?? '';

if (!API_KEY) {
  console.error('请在 .env 文件中设置 ZHIPUAI_API_KEY');
  process.exit(1);
}

export function generateAuthHeader() {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = createHmac('sha256', API_KEY);
  const signature = hmac.update(timestamp.toString()).digest('hex');
  return `Bearer ${signature}`;
} 