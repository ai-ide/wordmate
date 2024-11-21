let logBuffer = '';

export function handleLog(content: string) {
  logBuffer += content;
  const matches = logBuffer.match(/\{[^}]+\}/g);
  if (matches) {
    matches.forEach(json => {
      try {
        const parsed = JSON.parse(json);
        const logContent = {
          type: parsed.type,
          ...(parsed.word && { word: parsed.word }),
          ...(parsed.definition && { definition: parsed.definition }),
          ...(parsed.en && { en: parsed.en })
        };
        console.log('AI响应:', logContent);
      } catch (e) {
        // 忽略解析错误
      }
    });
    logBuffer = logBuffer.slice(logBuffer.lastIndexOf('}') + 1);
  }
}

export function getLogBuffer() {
  return logBuffer;
}

export function clearLogBuffer() {
  logBuffer = '';
} 