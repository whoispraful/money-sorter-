export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;         // Original amount
  currency: string;       // Original currency (e.g., EUR, GBP)
  amountInUSD: number;    // Normalized for charts
  category: string;
  notes: string;
  sourceFile?: string;
}

export interface StatementData {
  id: string;
  fileName: string;
  transactions: Transaction[];
  isValid: boolean;
  validationError?: string;
  summary: {
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
  };
}

export interface BatchSummary {
  totalFiles: number;
  processedFiles: number;
  totalCreditsUSD: number; // Changed to explicitly state USD
  totalDebitsUSD: number;  // Changed to explicitly state USD
  netFlowUSD: number;      // Changed to explicitly state USD
}

export interface HistoricalBatch {
  id: string;
  date: string;
  summary: BatchSummary;
  transactionCount: number;
}

export type FileStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';

export interface FileTracker {
  id: string;
  file: File;
  status: FileStatus;
  errorMessage?: string;
}

export interface UserProfile {
  name: string;
  joinedAt: string;
}