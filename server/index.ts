import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  toPublicUser,
  UserPublic,
} from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'require-platform-super-secret-jwt-key-2026';

// Configure CORS using FRONTEND_URL environment variable
const frontendUrlEnv = process.env.FRONTEND_URL;
const allowedOrigins = frontendUrlEnv
  ? frontendUrlEnv
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, uptime/health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        !frontendUrlEnv ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        allowedOrigins.some((allowed) => normalizedOrigin.startsWith(allowed))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(express.json({ limit: '2mb' }));

interface AuthRequest extends Request {
  user?: UserPublic;
}

// Authentication middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
      return;
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      res.status(404).json({ error: 'User account no longer exists.' });
      return;
    }

    req.user = toPublicUser(user);
    next();
  });
}

// Helper: Email validation regex
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * =========================================================
 * AUTHENTICATION ENDPOINTS
 * =========================================================
 */

/**
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both an email address and password.' });
      return;
    }

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address (e.g. name@example.com).' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const existing = findUserByEmail(trimmedEmail);
    if (existing) {
      res.status(409).json({
        error: 'An account with this email address already exists. Please log in instead.',
      });
      return;
    }

    const user = await createUser({
      email: trimmedEmail,
      password,
      name: name?.trim() || trimmedEmail.split('@')[0],
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to create user account. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please enter both your email address and password.' });
      return;
    }

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address format.' });
      return;
    }

    const user = findUserByEmail(trimmedEmail);
    if (!user) {
      res.status(401).json({
        error: 'No account found with this email address. Please check your spelling or sign up.',
      });
      return;
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        error: 'Incorrect password. Please verify your credentials and try again.',
      });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: toPublicUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to authenticate user. Please try again.',
    });
  }
});

/**
 * GET /api/auth/me
 */
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No active session token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Session has expired. Please log in again.' });
      return;
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.json({
      success: true,
      user: toPublicUser(user),
    });
  });
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * =========================================================
 * REQUIREMENT ANALYSIS ENGINE (@google/genai & Resilience)
 * =========================================================
 */

export interface RawRequirement {
  code: string;
  text: string;
  lineIndex: number;
}

export interface AnalysisIssue {
  id: string;
  reqCode: string;
  category: 'contradiction' | 'ambiguous' | 'incomplete' | 'duplicate';
  categoryLabel: string;
  originalText: string;
  conflictingReqCode?: string;
  issueDescription: string;
  suggestedFix: string;
  severity: 'high' | 'medium' | 'low';
}

interface CacheEntry {
  issues: AnalysisIssue[];
  totalAnalyzed: number;
  timestamp: number;
}

// In-memory cache keyed by SHA-256 hash of input text
const analysisCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 250;

function computeHash(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Normalizes input text into structured requirement statements.
 */
function parseRequirements(rawText: string): RawRequirement[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    const customCodeMatch = line.match(/^(?:\[?(REQ[-_ ]?\d+)\]?|(\d+)[.:)]?)\s*[-:]?\s*(.*)$/i);
    let code = `REQ-${String(index + 1).padStart(3, '0')}`;
    let text = line;

    if (customCodeMatch) {
      if (customCodeMatch[1]) {
        code = customCodeMatch[1].toUpperCase().replace(/\s+/g, '-');
      } else if (customCodeMatch[2]) {
        code = `REQ-${String(parseInt(customCodeMatch[2], 10)).padStart(3, '0')}`;
      }
      if (customCodeMatch[3] && customCodeMatch[3].trim().length > 0) {
        text = customCodeMatch[3].trim();
      }
    } else {
      text = text.replace(/^[-*•]\s*/, '').trim();
    }

    return {
      code,
      text,
      lineIndex: index + 1,
    };
  });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    provider: 'gemini',
    hasGeminiKey: hasKey,
    port: PORT,
    cachedEntries: analysisCache.size,
  });
});

const SYSTEM_INSTRUCTION = `You are REQUIRE, an elite software specification auditor and logic analyzer.
Your task is to analyze the provided software requirement statements as an interrelated system specification.

Identify all defects across four categories:
1. contradiction: Requirements that directly oppose or undermine each other (e.g. conflicting latency, conflicting authentication minimums, contradictory state transitions).
2. ambiguous: Vague, unmeasurable, or subjective qualifiers (e.g. "fast", "seamless", "user-friendly", "modern algorithms", "high availability", "reasonable").
3. incomplete: Missing edge cases, failure states, retry logic, timeout ceilings, or regulatory data retention boundaries.
4. duplicate: Redundant statements that say the same thing or specify identical logic, causing synchronization drift.

Guidelines:
- Carefully cross-reference EVERY requirement against all others to catch subtle logical clashes.
- For each defect, provide a concise, sharp "issueDescription" (the Structural Diagnosis) explaining the exact flaw.
- For each defect, provide a testable, measurable, concrete "suggestedFix" (the Synthesized Precision Replacement) that an engineering team can immediately adopt.
- Assign severity: 'high' for contradictions or critical edge case omissions, 'medium' for ambiguous metrics, 'low' for minor duplicates.
- Ensure the output strictly follows the specified JSON format.

JSON Schema:
{
  "issues": [
    {
      "id": "iss-1",
      "reqCode": "REQ-001",
      "category": "contradiction" | "ambiguous" | "incomplete" | "duplicate",
      "categoryLabel": "Contradiction" | "Ambiguous" | "Incomplete" | "Duplicate",
      "originalText": "exact text of the flagged statement",
      "conflictingReqCode": "REQ-002",
      "issueDescription": "Incisive structural diagnosis of the defect...",
      "suggestedFix": "Precise, measurable, rectified replacement specification...",
      "severity": "high" | "medium" | "low"
    }
  ]
}`;

// Models hierarchy: gemini-3.1-flash-lite (primary fast), gemini-3.5-flash-lite (secondary),
// with safety fallback to gemini-3.8-flash.
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

const MAX_ATTEMPTS_PER_MODEL = 3;
const BACKOFF_DELAYS_MS = [1000, 2000, 4000];
const REQUEST_TIMEOUT_MS = 25000;
const CHUNK_SIZE = 25;

/**
 * Checks if an error is retryable (503, 429, timeout, network error)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  const status = Number(error.status || error.code || error.statusCode);
  if (status === 503 || status === 429 || status === 408 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  if (error.isTimeout) return true;

  const msg = String(error.message || error.error || '').toLowerCase();
  if (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('etimedout') ||
    msg.includes('econnreset') ||
    msg.includes('network') ||
    msg.includes('fetch failed')
  ) {
    return true;
  }
  return false;
}

/**
 * Executes a single AI generation with a strict 25-second timeout.
 */
async function callModelWithTimeout(
  ai: GoogleGenAI,
  modelName: string,
  userPrompt: string,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<string> {
  let timeoutTimer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutTimer = setTimeout(() => {
      const err: any = new Error(`Request to model ${modelName} timed out after ${timeoutMs / 1000}s`);
      err.status = 408;
      err.isTimeout = true;
      reject(err);
    }, timeoutMs);
  });

  try {
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 0.1,
      },
    });

    const result = await Promise.race([callPromise, timeoutPromise]);
    const responseText = result?.text || (result as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText || responseText.trim().length === 0) {
      throw new Error(`Empty response returned from model ${modelName}.`);
    }

    return responseText;
  } finally {
    clearTimeout(timeoutTimer!);
  }
}

export type ProgressCallback = (info: {
  message: string;
  attempt?: number;
  maxAttempts?: number;
  model?: string;
  chunkIndex?: number;
  totalChunks?: number;
}) => void;

/**
 * Runs requirement analysis on a chunk with exponential backoff & model fallbacks.
 */
async function analyzeChunkWithResilience(
  chunk: RawRequirement[],
  chunkIndex: number,
  totalChunks: number,
  ai: GoogleGenAI,
  onProgress?: ProgressCallback
): Promise<AnalysisIssue[]> {
  const formattedSpecs = chunk.map((r) => `[${r.code}] ${r.text}`).join('\n');
  const userPrompt = `Analyze these ${chunk.length} requirements and return all detected defects in the required JSON format:\n\n${formattedSpecs}`;

  let lastError: any = null;

  for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
    const modelName = CANDIDATE_MODELS[mIdx];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const progressPrefix = totalChunks > 1 ? `Chunk ${chunkIndex}/${totalChunks}: ` : '';
        const progressMessage = `Analyzing… ${progressPrefix}attempt ${attempt} of ${MAX_ATTEMPTS_PER_MODEL}`;

        if (onProgress) {
          onProgress({
            message: progressMessage,
            attempt,
            maxAttempts: MAX_ATTEMPTS_PER_MODEL,
            model: modelName,
            chunkIndex,
            totalChunks,
          });
        }

        console.log(`[Gemini Engine] ${progressMessage} (${modelName})`);
        const rawJsonText = await callModelWithTimeout(ai, modelName, userPrompt, REQUEST_TIMEOUT_MS);

        // Clean JSON format markers if present
        let cleanedJson = rawJsonText.trim();
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        let parsedResult: { issues?: AnalysisIssue[] };
        try {
          parsedResult = JSON.parse(cleanedJson);
        } catch {
          const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Unable to parse JSON payload returned by Gemini model.');
          }
        }

        const chunkIssues: AnalysisIssue[] = (parsedResult.issues || []).map((issue, idx) => ({
          id: issue.id || `iss-${chunkIndex}-${idx + 1}`,
          reqCode: issue.reqCode || `REQ-${String(idx + 1).padStart(3, '0')}`,
          category: (['contradiction', 'ambiguous', 'incomplete', 'duplicate'].includes(issue.category)
            ? issue.category
            : 'ambiguous') as AnalysisIssue['category'],
          categoryLabel:
            issue.categoryLabel ||
            (issue.category ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : 'Issue'),
          originalText: issue.originalText || '',
          conflictingReqCode: issue.conflictingReqCode,
          issueDescription: issue.issueDescription || 'Structural defect detected in specification.',
          suggestedFix: issue.suggestedFix || 'Provide a precise and testable requirement statement.',
          severity: (['high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'medium') as AnalysisIssue['severity'],
        }));

        console.log(`[Gemini Engine] Success with ${modelName} on attempt ${attempt}. Found ${chunkIssues.length} issues.`);
        return chunkIssues;
      } catch (err: any) {
        lastError = err;
        const retryable = isRetryableError(err);
        const status = err.status || err.code;
        console.warn(`[Gemini Engine] Model ${modelName} attempt ${attempt} failed (Status ${status}): ${err?.message}`);

        // If error is 404 (model deprecated/unavailable), immediately fall back to next model
        if (status === 404 || String(err.message).includes('404')) {
          console.warn(`[Gemini Engine] Model ${modelName} not available (404), switching to fallback model...`);
          break;
        }

        if (retryable && attempt < MAX_ATTEMPTS_PER_MODEL) {
          const delayMs = BACKOFF_DELAYS_MS[attempt - 1] || 1000;
          console.log(`[Gemini Engine] Retrying in ${delayMs}ms with exponential backoff (attempt ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL})...`);
          
          if (onProgress) {
            onProgress({
              message: `Analyzing… attempt ${attempt + 1} of ${MAX_ATTEMPTS_PER_MODEL}`,
              attempt: attempt + 1,
              maxAttempts: MAX_ATTEMPTS_PER_MODEL,
              model: modelName,
              chunkIndex,
              totalChunks,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else if (attempt === MAX_ATTEMPTS_PER_MODEL) {
          console.warn(`[Gemini Engine] Model ${modelName} exhausted ${MAX_ATTEMPTS_PER_MODEL} attempts.`);
        }
      }
    }
  }

  throw lastError || new Error('Failed to analyze requirements after attempting all models and retries.');
}

/**
 * POST /api/analyze
 * Supports both standard JSON responses and SSE streaming (?stream=true or Accept: text/event-stream)
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

  if (isStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
  }

  const sendProgress = (info: {
    message: string;
    attempt?: number;
    maxAttempts?: number;
    model?: string;
    chunkIndex?: number;
    totalChunks?: number;
  }) => {
    if (isStream) {
      res.write(`event: progress\ndata: ${JSON.stringify(info)}\n\n`);
    }
  };

  try {
    const { text, requirements } = req.body;
    const inputText = (typeof text === 'string' ? text : requirements) || '';

    if (!inputText || inputText.trim().length === 0) {
      const errorMsg = 'Please enter at least one requirement statement to analyze.';
      if (isStream) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`);
        res.end();
      } else {
        res.status(400).json({ error: errorMsg });
      }
      return;
    }

    const parsedRequirements = parseRequirements(inputText);
    if (parsedRequirements.length === 0) {
      const errorMsg = 'Unable to parse requirement statements. Please provide one requirement per line.';
      if (isStream) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`);
        res.end();
      } else {
        res.status(400).json({ error: errorMsg });
      }
      return;
    }

    // 1. Check Hash Cache
    const cacheKey = computeHash(inputText);
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[Cache] Hash hit for ${cacheKey.substring(0, 10)} (returned ${cachedResult.issues.length} issues)`);
      sendProgress({ message: 'Loaded verified analysis from cache.' });
      
      const responsePayload = {
        success: true,
        totalAnalyzed: cachedResult.totalAnalyzed,
        issuesCount: cachedResult.issues.length,
        issues: cachedResult.issues,
        cached: true,
      };

      if (isStream) {
        res.write(`event: complete\ndata: ${JSON.stringify(responsePayload)}\n\n`);
        res.end();
      } else {
        res.json(responsePayload);
      }
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      const errorMsg = 'Google Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file.';
      if (isStream) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: errorMsg, requiresApiKey: true })}\n\n`);
        res.end();
      } else {
        res.status(401).json({
          error: errorMsg,
          requiresApiKey: true,
          parsedCount: parsedRequirements.length,
        });
      }
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // 2. Split long requirement lists into chunks of ~25 lines
    const chunks: RawRequirement[][] = [];
    for (let i = 0; i < parsedRequirements.length; i += CHUNK_SIZE) {
      chunks.push(parsedRequirements.slice(i, i + CHUNK_SIZE));
    }

    if (chunks.length > 1) {
      sendProgress({
        message: `Analyzing ${parsedRequirements.length} requirements across ${chunks.length} parallel batches…`,
        totalChunks: chunks.length,
      });
    }

    // 3. Analyze chunks in parallel
    const chunkPromises = chunks.map((chunk, index) =>
      analyzeChunkWithResilience(chunk, index + 1, chunks.length, ai, sendProgress)
    );

    const chunkResults = await Promise.all(chunkPromises);

    // 4. Merge results and re-index issue IDs
    const mergedIssues: AnalysisIssue[] = [];
    chunkResults.forEach((issueList) => {
      mergedIssues.push(...issueList);
    });

    const unifiedIssues: AnalysisIssue[] = mergedIssues.map((issue, index) => ({
      ...issue,
      id: `iss-${index + 1}`,
    }));

    // 5. Store in Cache (with LRU eviction if full)
    if (analysisCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = analysisCache.keys().next().value;
      if (oldestKey) analysisCache.delete(oldestKey);
    }
    analysisCache.set(cacheKey, {
      issues: unifiedIssues,
      totalAnalyzed: parsedRequirements.length,
      timestamp: Date.now(),
    });

    const finalResult = {
      success: true,
      totalAnalyzed: parsedRequirements.length,
      issuesCount: unifiedIssues.length,
      issues: unifiedIssues,
      cached: false,
    };

    if (isStream) {
      res.write(`event: complete\ndata: ${JSON.stringify(finalResult)}\n\n`);
      res.end();
    } else {
      res.json(finalResult);
    }
  } catch (error: any) {
    console.error('Gemini Analysis error:', error);
    let friendlyError = 'The AI analysis service is experiencing high demand or temporary network congestion. Please click Retry below to try again.';
    
    if (error?.status === 401 || String(error?.message).includes('API_KEY')) {
      friendlyError = 'Google Gemini API Key is invalid or expired. Please check your GEMINI_API_KEY in .env.';
    } else if (error?.isTimeout || String(error?.message).includes('timed out')) {
      friendlyError = 'The analysis request timed out. Please click Retry below to re-attempt.';
    }

    if (isStream) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: friendlyError, rawError: error?.message })}\n\n`);
      res.end();
    } else {
      res.status(503).json({
        error: friendlyError,
        rawError: error?.message,
      });
    }
  }
});

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`REQUIRE backend server running on http://${HOST}:${PORT} (@google/genai & Resilience Engine Active)`);
});
