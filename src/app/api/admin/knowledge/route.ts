import { NextRequest, NextResponse } from 'next/server';
import {
  getAllKnowledgeBaseEntries,
  saveKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
} from '@/lib/db';

export async function GET() {
  try {
    const entries = await getAllKnowledgeBaseEntries();
    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, category, question, answer, source_document, contact_if_unsure } = body;

    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Category, question, and answer are required' },
        { status: 400 }
      );
    }

    const saved = await saveKnowledgeBaseEntry({
      id,
      category,
      question,
      answer,
      source_document: source_document || 'Official Bulletin',
      contact_if_unsure: contact_if_unsure || 'Admin Cell',
    });

    return NextResponse.json({ entry: saved, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteKnowledgeBaseEntry(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
