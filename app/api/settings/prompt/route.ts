import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.email,
      },
    });

    return NextResponse.json(
      userSettings || {
        tone: 'friendly',
        basePrompt: getDefaultBasePrompt(),
        templates: {
          productInfo: getDefaultProductTemplate(),
          support: getDefaultSupportTemplate(),
          feedback: getDefaultFeedbackTemplate(),
        },
      }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/settings
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await req.json();

    await prisma.userSettings.upsert({
      where: {
        userId: session.user.email,
      },
      update: {
        tone: settings.tone,
        basePrompt: settings.basePrompt,
        templates: settings.templates,
      },
      create: {
        userId: session.user.email,
        tone: settings.tone,
        basePrompt: settings.basePrompt,
        templates: settings.templates,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getDefaultBasePrompt() {
  return `Start with a friendly greeting, address the main points of the post, and provide helpful information. End with a relevant call to action or invitation for further discussion.`;
}

function getDefaultProductTemplate() {
  return `Thank you for your interest! Let me share some details about our product. [Insert key features and benefits here] Feel free to ask if you have any specific questions!`;
}

function getDefaultSupportTemplate() {
  return `I understand your concern. Let me help you with that. [Address the specific issue] Please let me know if you need any clarification.`;
}

function getDefaultFeedbackTemplate() {
  return `Thank you for your feedback! We really appreciate you taking the time to share your thoughts. [Address specific points] Your input helps us improve our service.`;
}
