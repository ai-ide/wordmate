import { Context } from 'koa';
import { queryWord } from '../services/dictionary.js';
import { createResponseStream, handleStreamData } from '../utils/stream.js';
import { clearLogBuffer } from '../utils/logger.js';

export async function getDictionary(ctx: Context) {
  const word = ctx.params.word;
  console.log('\n开始查询单词:', word);
  
  try {
    const response = await queryWord(word);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const stream = createResponseStream();
    ctx.body = stream;

    if (response.body) {
      let buffer = '';
      
      response.body.on('data', (chunk: Buffer) => {
        buffer = handleStreamData(chunk, stream, buffer);
      });

      response.body.on('end', () => {
        if (buffer.trim()) {
          try {
            const match = buffer.match(/\{[^}]+\}/);
            if (match) {
              stream.push(`data: ${match[0]}\n\n`);
            }
          } catch (e) {
            console.error('处理剩余数据错误:', e);
          }
        }
        console.log('查询完成\n');
        clearLogBuffer();
        stream.push(null);
      });

      response.body.on('error', (err) => {
        console.error('流错误:', err);
        stream.destroy(err);
      });
    }

  } catch (error) {
    console.error('查询失败:', error);
    ctx.status = 500;
    ctx.body = { 
      error: error instanceof Error ? error.message : '查询失败'
    };
  }
} 