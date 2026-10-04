import { NextRequest, NextResponse } from 'next/server';
import { embed, cosineSimilarity } from '@/lib/embeddings';
import {
  checkSemanticCache,
  retrieveKnowledgeBase,
  logQuery,
  saveToQueryCache,
} from '@/lib/db';
import { callGroqLLM, calculateCostINR } from '@/lib/groq';
import { AskResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, user_id, user_email } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const cleanQuestion = question.trim();
    const qLower = cleanQuestion.toLowerCase();

    // ----------------------------------------------------
    // STEP 0: Conversational Greetings Check
    // ----------------------------------------------------
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'who are you', 'what can you do', 'help'];
    const isGreeting = greetings.some((g) => qLower === g || qLower.startsWith(g + ' ') || qLower.startsWith(g + '!'));

    if (isGreeting) {
      const greetingAnswer =
        "Hello! I am **CampusSaarthi**, the institutional AI guide for **IIM Lucknow**.\n\nI can answer questions regarding:\n- 📋 **Document verification & reporting requirements**\n- 💳 **Fee schedules, instalments, and payment deadlines**\n- 🏡 **Hostel rules, mess timings, and electrical appliance allowances**\n- 📍 **Step-by-step campus walking directions to any hall or building**\n\nHow can I help you today?";

      const greetingResponse: AskResponse = {
        answer: greetingAnswer,
        confidence: 0.99,
        used_source: 'CampusSaarthi Assistant Guide',
        escalate: false,
        served_from_cache: false,
        model_used: 'assistant-router',
        tokens_in: 20,
        tokens_out: 70,
        cost_inr: 0.0,
        sources: [],
      };

      const logResult = await logQuery({
        user_id,
        user_email,
        question: cleanQuestion,
        answer_given: greetingAnswer,
        confidence_score: 0.99,
        sources_used: ['Campus Guide'],
        was_escalated: false,
        model_used: 'assistant-router',
        tokens_in: 20,
        tokens_out: 70,
        cost_inr: 0.0,
        served_from_cache: false,
      });

      greetingResponse.query_id = logResult.query_id;
      return NextResponse.json(greetingResponse);
    }

    // ----------------------------------------------------
    // STEP 1: Embed question locally (384-dim)
    // ----------------------------------------------------
    const questionEmbedding = await embed(cleanQuestion);

    // ----------------------------------------------------
    // STEP 2: Semantic Cache Check (> 0.95 cosine similarity)
    // ----------------------------------------------------
    const cachedHit = await checkSemanticCache(cleanQuestion, questionEmbedding, 0.95);

    if (cachedHit) {
      const cachedResponse: AskResponse = {
        answer: cachedHit.cached_answer,
        confidence: 0.99,
        used_source: 'Semantic Cache (Verified Circular)',
        escalate: false,
        served_from_cache: true,
        model_used: 'cache-hit',
        tokens_in: 0,
        tokens_out: 0,
        cost_inr: 0.0,
        sources: [],
      };

      const logResult = await logQuery({
        user_id,
        user_email,
        question: cleanQuestion,
        answer_given: cachedHit.cached_answer,
        confidence_score: 0.99,
        sources_used: ['Semantic Cache'],
        was_escalated: false,
        model_used: 'cache-hit',
        tokens_in: 0,
        tokens_out: 0,
        cost_inr: 0.0,
        served_from_cache: true,
      });

      cachedResponse.query_id = logResult.query_id;
      return NextResponse.json(cachedResponse);
    }

    // ----------------------------------------------------
    // STEP 3: Retrieve top knowledge base entries
    // ----------------------------------------------------
    const retrievedEntries = await retrieveKnowledgeBase(questionEmbedding, 4);
    const topSimilarity = retrievedEntries[0]?.similarity || 0;

    // ----------------------------------------------------
    // STEP 4: Tiered Model Routing (20B vs 120B)
    // ----------------------------------------------------
    const selectedModel =
      topSimilarity >= 0.60
        ? 'openai/gpt-oss-20b'
        : 'openai/gpt-oss-120b';

    // ----------------------------------------------------
    // STEP 5: Generate with Strict Grounding System Prompt
    // ----------------------------------------------------
    const groqResult = await callGroqLLM({
      question: cleanQuestion,
      retrievedEntries,
      model: selectedModel,
    });

    // ----------------------------------------------------
    // STEP 6: Groundedness Gate
    // ----------------------------------------------------
    const isPersonalSituation = [
      'my fee payment failed',
      'my payment failed',
      'transaction failed',
      'special permission',
      'exception for me',
      'refund my money',
    ].some((k) => qLower.includes(k));

    const shouldEscalate =
      isPersonalSituation ||
      groqResult.escalate ||
      (groqResult.confidence < 0.50 && topSimilarity < 0.35) ||
      !groqResult.answer ||
      groqResult.answer.trim().length === 0;

    const finalAnswer = shouldEscalate ? '' : groqResult.answer;
    const finalConfidence = shouldEscalate
      ? Math.min(groqResult.confidence, 0.40)
      : groqResult.confidence;

    // ----------------------------------------------------
    // STEP 7: Log everything & save good answers to cache
    // ----------------------------------------------------
    const sourcesUsed = shouldEscalate
      ? []
      : [groqResult.used_source || retrievedEntries[0]?.source_document || 'Official Circular'];

    const logResult = await logQuery({
      user_id,
      user_email,
      question: cleanQuestion,
      answer_given: finalAnswer,
      confidence_score: finalConfidence,
      sources_used: sourcesUsed,
      was_escalated: shouldEscalate,
      model_used: groqResult.model_used,
      tokens_in: groqResult.tokens_in,
      tokens_out: groqResult.tokens_out,
      cost_inr: groqResult.cost_inr,
      served_from_cache: false,
    });

    if (!shouldEscalate && finalConfidence >= 0.80 && finalAnswer) {
      await saveToQueryCache(
        cleanQuestion,
        questionEmbedding,
        finalAnswer,
        retrievedEntries.map((r) => r.id)
      );
    }

    const responsePayload: AskResponse = {
      answer: finalAnswer,
      confidence: finalConfidence,
      used_source: groqResult.used_source || retrievedEntries[0]?.source_document || '',
      escalate: shouldEscalate,
      served_from_cache: false,
      model_used: groqResult.model_used,
      tokens_in: groqResult.tokens_in,
      tokens_out: groqResult.tokens_out,
      cost_inr: groqResult.cost_inr,
      sources: retrievedEntries,
      query_id: logResult.query_id,
      escalation_id: logResult.escalation_id,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    return NextResponse.json(
      {
        error: 'Failed to process question',
        details: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
