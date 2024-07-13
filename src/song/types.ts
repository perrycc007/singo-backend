// types.ts
export interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    pronunciation: string;
    audioUrl: string;
  }
  
  export interface Sentence {
    id: number;
    line: string;
    translation: string;
    pronunciation: string;
    audioUrl: string;
    vocabularies: Vocabulary[];
  }
  
  export interface SongData {
    id: number;
    title: string;
    artist: string;
    sentences: Sentence[];
  }
  