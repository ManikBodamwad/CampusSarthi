import { createAdminClient } from './supabase/server';
import { embed, cosineSimilarity } from './embeddings';
import { KnowledgeBaseEntry, QueryCacheEntry, QueryLog, Escalation, Room } from './types';
import seedData from '@/data/knowledge_base_seed.json';

// Pre-configured room list for IIM Lucknow indoor navigation
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    room_name: 'Hall 5',
    building: 'Bodhi Griha 3 (BG3)',
    floor: 'Floor 1',
    wing: 'East Wing',
    category: 'classroom',
    directions_text: 'Enter through BG3 Main Atrium -> Take the central staircase or East Elevator to 1st Floor -> Turn right down the East Wing corridor -> Hall 5 is the 3rd classroom on your left (next to Faculty Lounge).',
    coordinates: { x: 380, y: 220 },
    nearest_landmark: 'Faculty Lounge & East Staircase',
  },
  {
    id: 'room-2',
    room_name: 'Hall 1 (Main Auditorium)',
    building: 'Chintan Bhawan (Main Academic Block)',
    floor: 'Ground Floor',
    wing: 'Central Wing',
    category: 'classroom',
    directions_text: 'Enter Chintan Bhawan main portico -> Walk past the reception desk directly forward -> Hall 1 double doors are straight ahead.',
    coordinates: { x: 250, y: 150 },
    nearest_landmark: 'Central Reception & Dean Office',
  },
  {
    id: 'room-3',
    room_name: 'Admissions & Registrar Office',
    building: 'Prabandh Nagar Administrative Block',
    floor: 'Ground Floor',
    wing: 'North Wing',
    category: 'admin',
    directions_text: 'From the main entrance roundabout, head towards the Admin Tower -> Enter ground floor security check -> Room G-12 on the right corridor.',
    coordinates: { x: 180, y: 310 },
    nearest_landmark: 'Admin Flagpole & Security Desk',
  },
  {
    id: 'room-4',
    room_name: 'Central Library (Gyanodaya)',
    building: 'Gyanodaya Library Complex',
    floor: 'Floors 1 & 2',
    wing: 'All Wings',
    category: 'facility',
    directions_text: 'Follow the central boulevard past Bodhi Tree -> Library entrance with turnstiles -> Scan Student ID -> Digital Reference section is immediately to the left on Floor 1.',
    coordinates: { x: 500, y: 180 },
    nearest_landmark: 'Bodhi Tree Plaza',
  },
  {
    id: 'room-5',
    room_name: 'Student Health Centre',
    building: 'Samarpan Complex',
    floor: 'Ground Floor',
    wing: 'West Wing',
    category: 'facility',
    directions_text: 'Head towards the Hostel Cluster -> Health Centre is located ground level next to the 24/7 Pharmacy -> Doctor consultation room 2.',
    coordinates: { x: 120, y: 440 },
    nearest_landmark: '24/7 Pharmacy & Ambulance Bay',
  },
  {
    id: 'room-6',
    room_name: 'Central Dining Hall / Mess 1',
    building: 'Annapoorna Mess Complex',
    floor: 'Ground Floor',
    wing: 'Dining Area A',
    category: 'mess',
    directions_text: 'Located between Hostel Blocks 4 & 5 -> Enter via Annapoorna front ramp -> Vegetarian counter is on the East side, Non-Veg counter on the West side.',
    coordinates: { x: 420, y: 460 },
    nearest_landmark: 'Hostel 4 Quadrangle',
  },
  {
    id: 'room-7',
    room_name: 'Finance & Accounts Cell',
    building: 'Prabandh Nagar Administrative Block',
    floor: 'Floor 1',
    wing: 'South Wing',
    category: 'admin',
    directions_text: 'Admin Block -> Take staircase to Floor 1 -> Turn left past the notice board -> Room 108 (Accounts & Student Fee Desk).',
    coordinates: { x: 210, y: 340 },
    nearest_landmark: 'Board Room',
  },
  {
    id: 'room-8',
    room_name: 'Computer & IT Centre',
    building: 'Chintan Bhawan',
    floor: 'Floor 2',
    wing: 'West Wing',
    category: 'facility',
    directions_text: 'Enter Chintan Bhawan -> Take West stairs to 2nd Floor -> IT Helpdesk & Server Lab is at Room 204.',
    coordinates: { x: 290, y: 110 },
    nearest_landmark: 'Computer Lab 3',
  },
];

// In-memory runtime cache/store for fallback & instant demonstration
interface RuntimeStore {
  knowledgeBase: KnowledgeBaseEntry[];
  queryCache: QueryCacheEntry[];
  queriesLog: QueryLog[];
  escalations: Escalation[];
  rooms: Room[];
  initialized: boolean;
}

const runtimeStore: RuntimeStore = {
  knowledgeBase: [],
  queryCache: [],
  queriesLog: [],
  escalations: [],
  rooms: INITIAL_ROOMS,
  initialized: false,
};

// Initialize seed data into memory
export async function initializeStoreIfNeeded() {
  if (runtimeStore.initialized) return;

  const entries: KnowledgeBaseEntry[] = [];
  for (let i = 0; i < seedData.length; i++) {
    const item = seedData[i];
    entries.push({
      id: `kb-${i + 1}`,
      category: item.category,
      question: item.question,
      answer: item.answer,
      source_document: item.source_document,
      contact_if_unsure: item.contact_if_unsure,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  runtimeStore.knowledgeBase = entries;
  runtimeStore.rooms = INITIAL_ROOMS;

  // Add sample demo queries log
  runtimeStore.queriesLog = [
    {
      id: 'log-1',
      question: 'Can I pay the hostel and tuition fees in instalments?',
      answer_given: 'Fees are typically collected term-wise as per the published fee schedule, which effectively splits the annual fee across terms. A specific instalment request beyond this should be raised with the Accounts/Finance office before the due date.',
      confidence_score: 0.94,
      sources_used: ['Fee Payment Circular'],
      was_escalated: false,
      model_used: 'llama-3.1-8b-instant',
      tokens_in: 450,
      tokens_out: 85,
      cost_inr: 0.038,
      served_from_cache: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'log-2',
      question: 'Where is Hall 5 and what are its timings?',
      answer_given: 'Hall 5 is a teaching hall inside the academic block. For the current academic session, check your timetable for the exact block and room; the campus map and the Academic office signage show hall locations. CampusSaarthi\'s navigator can guide you building to floor to wing.',
      confidence_score: 0.96,
      sources_used: ['Campus Map'],
      was_escalated: false,
      model_used: 'llama-3.1-8b-instant',
      tokens_in: 410,
      tokens_out: 78,
      cost_inr: 0.035,
      served_from_cache: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log-3',
      question: 'My fee payment gateway failed and money got deducted, can you refund it?',
      answer_given: '',
      confidence_score: 0.25,
      sources_used: [],
      was_escalated: true,
      model_used: 'llama-3.3-70b-versatile',
      tokens_in: 480,
      tokens_out: 42,
      cost_inr: 0.32,
      served_from_cache: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      escalation_id: 'esc-1',
    },
  ];

  runtimeStore.escalations = [
    {
      id: 'esc-1',
      query_id: 'log-3',
      question: 'My fee payment gateway failed and money got deducted, can you refund it?',
      user_email: 'student.sample@iiml.ac.in',
      status: 'open',
      assigned_dept: 'Accounts & Finance Cell',
      admin_notes: 'Urgent payment reconciliation query routed from AI gateway.',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  runtimeStore.initialized = true;
}

// ----------------------------------------------------
// 1. SEMANTIC CACHE LOOKUP
// ----------------------------------------------------
export async function checkSemanticCache(
  questionText: string,
  questionEmbedding: number[],
  threshold = 0.95
): Promise<QueryCacheEntry | null> {
  const supabase = createAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('match_query_cache', {
        query_embedding: questionEmbedding,
        match_threshold: threshold,
        match_count: 1,
      });

      if (!error && data && data.length > 0) {
        const hit = data[0];
        // Increment hit count
        await supabase
          .from('query_cache')
          .update({ hit_count: (hit.hit_count || 1) + 1 })
          .eq('id', hit.id);
        return hit;
      }
    } catch (e) {
      console.warn('Supabase cache RPC error, falling back to local cache check:', e);
    }
  }

  // Fallback in-memory cache check
  await initializeStoreIfNeeded();
  for (const entry of runtimeStore.queryCache) {
    const similarity = cosineSimilarity(questionEmbedding, entry.question_embedding);
    if (similarity >= threshold) {
      entry.hit_count += 1;
      return entry;
    }
  }

  return null;
}

// ----------------------------------------------------
// 2. KNOWLEDGE BASE RETRIEVAL (TOP-4)
// ----------------------------------------------------
export async function retrieveKnowledgeBase(
  questionEmbedding: number[],
  topK = 4
): Promise<KnowledgeBaseEntry[]> {
  const supabase = createAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('match_knowledge_base', {
        query_embedding: questionEmbedding,
        match_threshold: 0.1,
        match_count: topK,
      });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          similarity: d.similarity || 0.8,
        }));
      }
    } catch (e) {
      console.warn('Supabase knowledge retrieval RPC error, using memory store:', e);
    }
  }

  await initializeStoreIfNeeded();

  // Compute similarities across memory store
  const scored = await Promise.all(
    runtimeStore.knowledgeBase.map(async (entry) => {
      let emb = entry.embedding;
      if (!emb || emb.length === 0) {
        emb = await embed(`${entry.category}: ${entry.question} ${entry.answer}`);
        entry.embedding = emb;
      }
      const similarity = cosineSimilarity(questionEmbedding, emb);
      return { ...entry, similarity };
    })
  );

  scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  return scored.slice(0, topK);
}

// ----------------------------------------------------
// 3. LOG QUERY & CREATE ESCALATION
// ----------------------------------------------------
export async function logQuery(logData: {
  user_id?: string;
  user_email?: string;
  question: string;
  answer_given: string;
  confidence_score: number;
  sources_used: string[];
  was_escalated: boolean;
  model_used: string;
  tokens_in: number;
  tokens_out: number;
  cost_inr: number;
  served_from_cache: boolean;
}): Promise<{ query_id: string; escalation_id?: string }> {
  const queryId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let escalationId: string | undefined = undefined;

  if (logData.was_escalated) {
    escalationId = `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('queries_log')
        .insert({
          user_id: logData.user_id,
          question: logData.question,
          answer_given: logData.answer_given,
          confidence_score: logData.confidence_score,
          sources_used: logData.sources_used,
          was_escalated: logData.was_escalated,
          model_used: logData.model_used,
          tokens_in: logData.tokens_in,
          tokens_out: logData.tokens_out,
          cost_inr: logData.cost_inr,
          served_from_cache: logData.served_from_cache,
        })
        .select('id')
        .single();

      if (!error && data) {
        const liveQueryId = data.id;
        if (logData.was_escalated) {
          const { data: escData } = await supabase
            .from('escalations')
            .insert({
              query_id: liveQueryId,
              status: 'open',
              assigned_dept: determineAssignedDept(logData.question),
            })
            .select('id')
            .single();
          if (escData) {
            escalationId = escData.id;
          }
        }
        return { query_id: liveQueryId, escalation_id: escalationId };
      }
    } catch (e) {
      console.warn('Supabase insert log error:', e);
    }
  }

  // Memory log
  await initializeStoreIfNeeded();
  const newLog: QueryLog = {
    id: queryId,
    ...logData,
    created_at: new Date().toISOString(),
    escalation_id: escalationId,
  };
  runtimeStore.queriesLog.unshift(newLog);

  if (logData.was_escalated) {
    const newEsc: Escalation = {
      id: escalationId!,
      query_id: queryId,
      question: logData.question,
      user_email: logData.user_email || 'student@iiml.ac.in',
      status: 'open',
      assigned_dept: determineAssignedDept(logData.question),
      admin_notes: 'Auto-routed due to groundedness gate (escalate flag or confidence < 0.60)',
      created_at: new Date().toISOString(),
    };
    runtimeStore.escalations.unshift(newEsc);
  }

  return { query_id: queryId, escalation_id: escalationId };
}

// ----------------------------------------------------
// 4. SAVE TO CACHE
// ----------------------------------------------------
export async function saveToQueryCache(
  questionText: string,
  questionEmbedding: number[],
  cachedAnswer: string,
  sourceIds?: string[]
) {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from('query_cache').insert({
        question_text: questionText,
        question_embedding: questionEmbedding,
        cached_answer: cachedAnswer,
        source_ids: sourceIds,
        hit_count: 1,
      });
      return;
    } catch (e) {
      console.warn('Supabase query_cache insert error:', e);
    }
  }

  await initializeStoreIfNeeded();
  runtimeStore.queryCache.push({
    id: `cache-${Date.now()}`,
    question_text: questionText,
    question_embedding: questionEmbedding,
    cached_answer: cachedAnswer,
    source_ids: sourceIds,
    hit_count: 1,
    created_at: new Date().toISOString(),
  });
}

// ----------------------------------------------------
// 5. ADMIN UTILITIES & GETTERS
// ----------------------------------------------------
export async function getAdminAnalytics() {
  await initializeStoreIfNeeded();
  const supabase = createAdminClient();

  let logs: QueryLog[] = runtimeStore.queriesLog;
  let escalations: Escalation[] = runtimeStore.escalations;
  let kbCount = runtimeStore.knowledgeBase.length;

  if (supabase) {
    try {
      const { data: dbLogs } = await supabase.from('queries_log').select('*').order('created_at', { ascending: false });
      const { data: dbEsc } = await supabase.from('escalations').select('*');
      const { count } = await supabase.from('knowledge_base').select('*', { count: 'exact', head: true });

      if (dbLogs) logs = dbLogs;
      if (dbEsc) escalations = dbEsc;
      if (typeof count === 'number') kbCount = count;
    } catch (e) {
      console.warn('Supabase analytics fetch error:', e);
    }
  }

  const totalQuestions = logs.length;
  const cacheHits = logs.filter((l) => l.served_from_cache).length;
  const cacheHitRate = totalQuestions > 0 ? (cacheHits / totalQuestions) * 100 : 0;
  
  const totalCost = logs.reduce((acc, l) => acc + (l.cost_inr || 0), 0);
  const avgConfidence = totalQuestions > 0
    ? logs.reduce((acc, l) => acc + (l.confidence_score || 0), 0) / totalQuestions
    : 0;

  const openEscalations = escalations.filter((e) => e.status !== 'resolved').length;
  const resolvedEscalations = escalations.filter((e) => e.status === 'resolved').length;

  // Model breakdown
  const model8bCount = logs.filter((l) => l.model_used?.includes('8b')).length;
  const model70bCount = logs.filter((l) => l.model_used?.includes('70b')).length;

  return {
    totalQuestions,
    cacheHits,
    cacheHitRate: Number(cacheHitRate.toFixed(1)),
    totalCostInr: Number(totalCost.toFixed(3)),
    avgConfidence: Number(avgConfidence.toFixed(2)),
    openEscalations,
    resolvedEscalations,
    kbCount,
    modelBreakdown: {
      llama8b: model8bCount,
      llama70b: model70bCount,
      cache: cacheHits,
    },
  };
}

export async function getAllKnowledgeBaseEntries(): Promise<KnowledgeBaseEntry[]> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, category, question, answer, source_document, contact_if_unsure, created_at, updated_at')
        .order('category', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase get KB error:', e);
    }
  }
  await initializeStoreIfNeeded();
  return runtimeStore.knowledgeBase;
}

export async function saveKnowledgeBaseEntry(entry: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
  const embedding = await embed(`${entry.category || ''}: ${entry.question || ''} ${entry.answer || ''}`);
  const supabase = createAdminClient();

  if (supabase) {
    try {
      if (entry.id && !entry.id.startsWith('kb-')) {
        const { data, error } = await supabase
          .from('knowledge_base')
          .update({
            category: entry.category,
            question: entry.question,
            answer: entry.answer,
            source_document: entry.source_document,
            contact_if_unsure: entry.contact_if_unsure,
            embedding,
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id)
          .select()
          .single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase
          .from('knowledge_base')
          .insert({
            category: entry.category,
            question: entry.question,
            answer: entry.answer,
            source_document: entry.source_document,
            contact_if_unsure: entry.contact_if_unsure,
            embedding,
          })
          .select()
          .single();
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('Supabase save KB error:', e);
    }
  }

  await initializeStoreIfNeeded();
  if (entry.id) {
    const idx = runtimeStore.knowledgeBase.findIndex((k) => k.id === entry.id);
    if (idx !== -1) {
      runtimeStore.knowledgeBase[idx] = {
        ...runtimeStore.knowledgeBase[idx],
        ...entry,
        embedding,
        updated_at: new Date().toISOString(),
      } as KnowledgeBaseEntry;
      return runtimeStore.knowledgeBase[idx];
    }
  }

  const newEntry: KnowledgeBaseEntry = {
    id: `kb-${Date.now()}`,
    category: entry.category || 'General',
    question: entry.question || '',
    answer: entry.answer || '',
    source_document: entry.source_document || 'Official Bulletin',
    contact_if_unsure: entry.contact_if_unsure || 'Admin Office',
    embedding,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  runtimeStore.knowledgeBase.unshift(newEntry);
  return newEntry;
}

export async function deleteKnowledgeBaseEntry(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from('knowledge_base').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete KB error:', e);
    }
  }
  await initializeStoreIfNeeded();
  runtimeStore.knowledgeBase = runtimeStore.knowledgeBase.filter((k) => k.id !== id);
  return true;
}

export async function getEscalations(): Promise<Escalation[]> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('escalations')
        .select(`
          id,
          query_id,
          status,
          assigned_dept,
          created_at,
          resolved_at,
          queries_log (
            question,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          query_id: d.query_id,
          question: d.queries_log?.question || 'Student inquiry',
          user_email: 'student@iiml.ac.in',
          status: d.status,
          assigned_dept: d.assigned_dept,
          created_at: d.created_at,
          resolved_at: d.resolved_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase get escalations error:', e);
    }
  }
  await initializeStoreIfNeeded();
  return runtimeStore.escalations;
}

export async function updateEscalationStatus(
  id: string,
  status: 'open' | 'in_progress' | 'resolved',
  admin_notes?: string
): Promise<boolean> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('escalations')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase update escalation error:', e);
    }
  }
  await initializeStoreIfNeeded();
  const esc = runtimeStore.escalations.find((e) => e.id === id);
  if (esc) {
    esc.status = status;
    if (admin_notes) esc.admin_notes = admin_notes;
    if (status === 'resolved') {
      esc.resolved_at = new Date().toISOString();
    } else {
      esc.resolved_at = null;
    }
  }
  return true;
}

export async function getQueriesLogs(limit = 100): Promise<QueryLog[]> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('queries_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase get logs error:', e);
    }
  }
  await initializeStoreIfNeeded();
  return runtimeStore.queriesLog.slice(0, limit);
}

export async function getRooms(): Promise<Room[]> {
  await initializeStoreIfNeeded();
  return runtimeStore.rooms;
}

function determineAssignedDept(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('fee') || q.includes('payment') || q.includes('loan') || q.includes('instalment') || q.includes('refund')) {
    return 'Accounts & Finance Cell';
  }
  if (q.includes('hostel') || q.includes('room') || q.includes('ac ') || q.includes('laundry') || q.includes('mess')) {
    return 'Hostel & Estate Office';
  }
  if (q.includes('course') || q.includes('elective') || q.includes('section') || q.includes('exam') || q.includes('grade')) {
    return 'Programme / Academic Office';
  }
  if (q.includes('doctor') || q.includes('health') || q.includes('medical') || q.includes('emergency')) {
    return 'Campus Health Centre';
  }
  return 'Admissions & Central Admin Cell';
}
