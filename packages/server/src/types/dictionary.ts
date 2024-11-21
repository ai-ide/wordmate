export interface Example {
  en: string;
  zh: string;
}

export interface Definition {
  partOfSpeech: string;
  definition: string;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordInfo {
  word: string;
  phonetic: string;
  audioUrl?: string;
  definitions: Definition[];
  etymology?: string;
  relatedWords?: string[];
}

export interface ZhipuAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
} 