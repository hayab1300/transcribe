
// These types are based on the Web Speech API specification.
// Browsers might have slight variations or prefixes (e.g., webkitSpeechRecognition).

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  // readonly interpretation: any; // Deprecated or non-standard
  // readonly emma: Document | null; // Deprecated or non-standard
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechGrammar {
  src: string;
  weight: number;
}
export interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}
declare var SpeechGrammarList: {
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};
declare var webkitSpeechGrammarList: { // For Safari/older Chrome
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};


export interface SpeechRecognitionErrorEvent extends Event { // Standard is SpeechRecognitionErrorEvent
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

// Common error codes for SpeechRecognition
export type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';


export interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

export interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  // serviceURI: string; // Deprecated

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  // onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null; // Less common
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent | Event) => any) | null; // Event can be simpler in some browsers
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Extend window object for global SpeechRecognition/webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
    SpeechGrammarList?: { new(): SpeechGrammarList };
    webkitSpeechGrammarList?: { new(): SpeechGrammarList };
  }
}
