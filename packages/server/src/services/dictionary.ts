import fetch from 'node-fetch';
import { ZHIPUAI_API_URL, API_KEY } from '../config/index.js';

export async function queryWord(word: string) {
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

  return response;
}

export async function suggestWords(word: string) {
  const prompt = `请为英语单词"${word}"提供最多5个单词联想建议。
要求：
1. 只返回一个 JSON 数组，包含单词字符串
2. 所有建议的单词必须以"${word}"开头
3. 按照使用频率从高到低排序
4. 如果找不到足够的单词，返回更少的结果也可以
5. 建议的单词必须是真实存在的英语单词
6. 响应必须简短迅速`;

  const response = await fetch(ZHIPUAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      top_p: 0.5,
      stream: false,
      max_tokens: 50
    })
  });

  return response;
} 