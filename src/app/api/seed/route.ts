import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { embed } from '@/lib/embeddings';
import { INITIAL_ROOMS } from '@/lib/db';
import seedData from '@/data/knowledge_base_seed.json';

export async function POST() {
  try {
    const supabase = createAdminClient();
    const results = {
      supabase_connected: Boolean(supabase),
      kb_inserted: 0,
      rooms_inserted: 0,
    };

    if (supabase) {
      // 1. Seed Knowledge Base with embeddings
      for (const item of seedData) {
        const textToEmbed = `${item.category}: ${item.question} ${item.answer}`;
        const embedding = await embed(textToEmbed);

        const { error } = await supabase.from('knowledge_base').upsert(
          {
            category: item.category,
            question: item.question,
            answer: item.answer,
            source_document: item.source_document,
            contact_if_unsure: item.contact_if_unsure,
            embedding,
          },
          { onConflict: 'question' }
        );

        if (!error) {
          results.kb_inserted++;
        }
      }

      // 2. Seed Rooms
      for (const room of INITIAL_ROOMS) {
        const { error } = await supabase.from('rooms').upsert(
          {
            room_name: room.room_name,
            building: room.building,
            floor: room.floor,
            wing: room.wing,
            directions_text: room.directions_text,
          },
          { onConflict: 'room_name' }
        );

        if (!error) {
          results.rooms_inserted++;
        }
      }
    } else {
      results.kb_inserted = seedData.length;
      results.rooms_inserted = INITIAL_ROOMS.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded knowledge base entries and campus rooms`,
      details: results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
