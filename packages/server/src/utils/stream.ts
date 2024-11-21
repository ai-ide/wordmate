import { Readable } from 'stream';
import { handleLog } from './logger.js';

export function createResponseStream() {
  return new Readable({
    read() {}
  });
}

export function handleStreamData(chunk: Buffer, stream: Readable, buffer: string = '') {
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
            handleLog(content);
            
            if (content.startsWith('{') && content.endsWith('}')) {
              stream.push(`data: ${content}\n\n`);
            } else {
              buffer += content;
              const matches = buffer.match(/\{.*?\}/g);
              if (matches) {
                matches.forEach(json => {
                  try {
                    JSON.parse(json);
                    stream.push(`data: ${json}\n\n`);
                  } catch (e) {
                    return;
                  }
                });
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
  
  return buffer;
} 