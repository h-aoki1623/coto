export interface Turn {
  id: string;
  conversationId: string;
  role: 'user' | 'ai';
  text: string;
  audioUrl: string | null;
  sequence: number;
  correctionStatus: 'none' | 'pending' | 'clean' | 'has_corrections';
  createdAt: string;
}

export interface CorrectionItem {
  id: string;
  original: string;
  corrected: string;
  originalSentence: string;
  correctedSentence: string;
  type: 'grammar' | 'expression' | 'vocabulary';
  explanation: string;
}

export interface TurnCorrection {
  id: string;
  turnId: string;
  correctedText: string;
  explanation: string;
  items: CorrectionItem[];
}
