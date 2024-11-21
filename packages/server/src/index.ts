import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { createHmac } from 'crypto';
import { Readable } from 'stream';

// 加载环境变量
config();

const app = new Koa();
const router = new Router();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// 智谱 AI API 配置
const ZHIPUAI_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const API_KEY = process.env.ZHIPUAI_API_KEY ?? '';

if (!API_KEY) {
  console.error('请在 .env 文件中设置 ZHIPUAI_API_KEY');
  process.exit(1);
}

// 生成智谱 AI API 认证头
function generateAuthHeader() {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = createHmac('sha256', API_KEY);
  const signature = hmac.update(timestamp.toString()).digest('hex');
  return `Bearer ${signature}`;
}

// 启用跨域
app.use(cors());

interface Example {
  en: string;
  zh: string;
}

interface Definition {
  partOfSpeech: string;
  definition: string;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
}

interface WordInfo {
  word: string;
  phonetic: string;
  audioUrl?: string;
  definitions: Definition[];
  etymology?: string;
  relatedWords?: string[];
}

interface ZhipuAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 添加一个日志缓冲区
let logBuffer = '';

// 添加日志处理函数
function handleLog(content: string) {
  logBuffer += content;
  // 尝试提取完整的 JSON 对象
  const matches = logBuffer.match(/\{[^}]+\}/g);
  if (matches) {
    matches.forEach(json => {
      try {
        const parsed = JSON.parse(json);
        console.log('完整响应:', {
          type: parsed.type,
          content: json
        });
      } catch (e) {
        // 忽略解析错误
      }
    });
    // 保留最后一个不完整的部分
    logBuffer = logBuffer.slice(logBuffer.lastIndexOf('}') + 1);
  }
}

// 词典 API 路由
router.get('/dictionary/:word', async (ctx) => {
  const word = ctx.params.word;
  
  const prompt = `你是一个专业的英语词典助手。请解释英语单词"${word}"。
要求：
1. 返回多个独立的 JSON 对象，每个对象代表单词信息的一部分
2. 按以下顺序返回信息：
   a) 首先返回基本信息：{ type: "basic", word: "单词", phonetic: "音标" }
   b) 然后逐个返回每个词性的释义：{ type: "definition", partOfSpeech: "词性", definition: "释义" }
   c) 接着为每个释义返回例句：{ type: "example", forDefinition: "词性", en: "英文例句", zh: "中文翻译" }
   d) 然后返回同义词：{ type: "synonyms", words: ["同义词1", "同义词2"] }
   e) 再返回反义词：{ type: "antonyms", words: ["反义词1", "反义词2"] }
   f) 最后返回词源信息：{ type: "etymology", content: "词源解释" }

3. 每个 JSON 对象必须是完整的、独立的，可以直接解析
4. 每个对象占一行，不要使用换行符或其他格式
5. 所有中文使用规范的现代汉语
6. 音标使用标准IPA格式

示例输出：
{"type":"basic","word":"example","phonetic":"ɪɡˈzæmpəl"}
{"type":"definition","partOfSpeech":"n.","definition":"例子，范例"}
{"type":"example","forDefinition":"n.","en":"This is a good example.","zh":"这是一个好例子。"}
{"type":"synonyms","words":["instance","sample","specimen"]}
{"type":"etymology","content":"来自拉丁语 exemplum"}`;

  try {
    const response = await fetch(ZHIPUAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        top_p: 0.8,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // 设置响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // 创建可读流
    const stream = new Readable({
      read() {} // 需要实现 read 方法，即使是空的
    });

    // 将响应数据通过流传输
    ctx.body = stream;

    // 修改处理响应流的逻辑
    if (response.body) {
      let buffer = '';
      
      response.body.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        const lines = text.split('\n');
        buffer += lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              console.log('智谱响应完成: [DONE]');
              stream.push('data: [DONE]\n\n');
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                if (content && content !== "'" && content !== '"') {
                  // 添加到日志缓冲区
                  handleLog(content);
                  
                  // 正常发送响应
                  if (content.startsWith('{') && content.endsWith('}')) {
                    stream.push(`data: ${content}\n\n`);
                  } else {
                    buffer += content;
                    // 使用非贪婪匹配，避免匹配到不完整的 JSON
                    const matches = buffer.match(/\{.*?\}/g);
                    if (matches) {
                      matches.forEach(json => {
                        try {
                          // 验证是否为有效的 JSON
                          JSON.parse(json);
                          stream.push(`data: ${json}\n\n`);
                        } catch (e) {
                          // 如果解析失败，说明不是完整的 JSON，继续累积
                          return;
                        }
                      });
                      // 保留最后一个不完整的部分
                      const lastMatch = matches[matches.length - 1];
                      const lastIndex = buffer.lastIndexOf(lastMatch) + lastMatch.length;
                      buffer = buffer.slice(lastIndex);
                    }
                  }
                }
              }
            } catch (e) {
              console.error('解析错误:', e);
            }
          }
        }
      });

      response.body.on('end', () => {
        if (buffer.trim()) {
          try {
            const match = buffer.match(/\{[^}]+\}/);
            if (match) {
              handleLog(match[0]); // 处理最后的日志
              stream.push(`data: ${match[0]}\n\n`);
            }
          } catch (e) {
            console.error('处理剩余数据错误:', e);
          }
        }
        // 打印最后可能的不完整日志
        if (logBuffer.trim()) {
          console.log('未完成的响应:', logBuffer);
        }
        console.log('响应流结束');
        stream.push(null);
      });

      response.body.on('error', (err) => {
        console.error('流错误:', err);
        stream.destroy(err);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    ctx.status = 500;
    ctx.body = { 
      error: error instanceof Error ? error.message : '查询失败'
    };
  }
});

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
