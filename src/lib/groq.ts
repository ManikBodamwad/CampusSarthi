import { KnowledgeBaseEntry } from './types';

export const SYSTEM_GROUNDING_PROMPT = `You are CampusSaarthi, the official AI assistant for IIM Lucknow students.

You will be given a STUDENT QUESTION and a set of KNOWLEDGE BASE ENTRIES retrieved from the institute's own documents. Each entry has: question, answer, source_document, contact_if_unsure.

Rules, in order of priority:
1. If the question is a greeting or general intro (e.g. "hi", "hello", "who are you", "help"), respond warmly as CampusSaarthi, explaining that you help with IIM Lucknow fees, hostels, reporting, academics, and campus navigation. Set escalate=false, confidence=0.99.
2. If the question is about campus policies, locations, timings, fees, or academics, answer ONLY using information contained in the KNOWLEDGE BASE ENTRIES. Give a clear, structured, and helpful answer in your own words based strictly on them. Cite the single most relevant source_document.
3. If the entries do NOT clearly answer the question, or only partially answer it, or the question involves a personal/account-specific situation (a failed transaction, a personal exception request), set escalate=true.
4. Never invent dates, amounts, room numbers, names, or policies.
5. Keep the tone calm, friendly, and supportive. Use markdown (bold, bullet points) where helpful.

Return ONLY a valid JSON object:
{
  "answer": "<your grounded answer>",
  "confidence": <0.0 to 1.0>,
  "used_source": "<source_document or 'Campus Knowledge Base'>",
  "escalate": <true or false>
}`;

export interface GroqInferenceResult {
  answer: string;
  confidence: number;
  used_source: string;
  escalate: boolean;
  tokens_in: number;
  tokens_out: number;
  cost_inr: number;
  model_used: string;
}

const USD_TO_INR = 86.5;

export function calculateCostINR(model: string, tokensIn: number, tokensOut: number): number {
  const is120B = model.includes('120b') || model.includes('70b');
  const inputRateUSD = is120B ? 0.59 / 1_000_000 : 0.05 / 1_000_000;
  const outputRateUSD = is120B ? 0.79 / 1_000_000 : 0.08 / 1_000_000;
  
  const costUSD = (tokensIn * inputRateUSD) + (tokensOut * outputRateUSD);
  const costINR = costUSD * USD_TO_INR;
  return Math.max(0.001, Number(costINR.toFixed(4)));
}

export async function callGroqLLM({
  question,
  retrievedEntries,
  model = 'openai/gpt-oss-20b',
}: {
  question: string;
  retrievedEntries: KnowledgeBaseEntry[];
  model?: string;
}): Promise<GroqInferenceResult> {
  const apiKey = process.env.GROQ_API_KEY;

  const entriesJson = JSON.stringify(
    retrievedEntries.map((e) => ({
      category: e.category,
      question: e.question,
      answer: e.answer,
      source_document: e.source_document,
      contact_if_unsure: e.contact_if_unsure,
    })),
    null,
    2
  );

  const promptContent = `KNOWLEDGE BASE ENTRIES:
${entriesJson}

STUDENT QUESTION:
${question}`;

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.startsWith('mock_')) {
    return mockGroundedInference(question, retrievedEntries, model);
  }

  // Attempt models in order of priority if a specific model fails
  const candidateModels = [model, 'openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
  const uniqueCandidates = Array.from(new Set(candidateModels));

  for (const candidate of uniqueCandidates) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: candidate,
          messages: [
            { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
            { role: 'user', content: promptContent },
          ],
          temperature: 0.1,
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Groq candidate ${candidate} error:`, res.status, errText);
        continue;
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const tokensIn = data.usage?.prompt_tokens || 350;
      const tokensOut = data.usage?.completion_tokens || 120;
      const costInr = calculateCostINR(candidate, tokensIn, tokensOut);

      let parsed: any = {};
      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(rawContent);
        }
      } catch (e) {
        parsed = {
          answer: rawContent,
          confidence: 0.85,
          used_source: retrievedEntries[0]?.source_document || 'Official Circular',
          escalate: false,
        };
      }

      return {
        answer: parsed.answer || '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        used_source: parsed.used_source || retrievedEntries[0]?.source_document || 'IIML Knowledge Base',
        escalate: Boolean(parsed.escalate),
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_inr: costInr,
        model_used: candidate,
      };
    } catch (error) {
      console.warn(`Groq execution exception on ${candidate}:`, error);
    }
  }

  // Fallback to grounded heuristic evaluator
  return mockGroundedInference(question, retrievedEntries, model);
}

function mockGroundedInference(
  question: string,
  retrievedEntries: KnowledgeBaseEntry[],
  model: string
): GroqInferenceResult {
  const qLower = question.toLowerCase().trim();
  
  // Greetings
  if (['hi', 'hello', 'hey', 'good morning', 'good evening', 'help', 'who are you'].some(g => qLower === g || qLower.startsWith(g + ' '))) {
    return {
      answer: "Hello! I'm **CampusSaarthi**, your official IIM Lucknow campus assistant. I can help you with fee schedules, reporting documents, hostel rules, academic halls, and live campus navigation. How can I assist you today?",
      confidence: 0.99,
      used_source: 'CampusSaarthi Guide',
      escalate: false,
      tokens_in: 50,
      tokens_out: 40,
      cost_inr: 0.001,
      model_used: model,
    };
  }

  const personalKeywords = [
    'my fee payment failed',
    'my payment failed',
    'transaction failed',
    'special permission',
    'my grade',
    'my roll number',
    'my application id',
    'exception for me',
    'refund my money',
    'deadline passed for me',
  ];

  const isPersonalOrException = personalKeywords.some((k) => qLower.includes(k));

  if (isPersonalOrException || retrievedEntries.length === 0) {
    return {
      answer: '',
      confidence: 0.25,
      used_source: '',
      escalate: true,
      tokens_in: 420,
      tokens_out: 45,
      cost_inr: calculateCostINR(model, 420, 45),
      model_used: model,
    };
  }

  const topEntry = retrievedEntries[0];
  const similarity = topEntry.similarity || 0.85;

  if (similarity < 0.40) {
    return {
      answer: '',
      confidence: 0.35,
      used_source: '',
      escalate: true,
      tokens_in: 380,
      tokens_out: 40,
      cost_inr: calculateCostINR(model, 380, 40),
      model_used: model,
    };
  }

  return {
    answer: topEntry.answer,
    confidence: Number(Math.min(0.98, Math.max(0.70, similarity + 0.1)).toFixed(2)),
    used_source: topEntry.source_document || 'Official IIML Circular',
    escalate: false,
    tokens_in: 480,
    tokens_out: 140,
    cost_inr: calculateCostINR(model, 480, 140),
    model_used: model,
  };
}
