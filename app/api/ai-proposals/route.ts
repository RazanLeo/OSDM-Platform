import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const proposalSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(20),
  language: z.enum(['ar', 'en']).optional(),
})

// Simulated AI proposal generation (replace with actual AI API)
function generateProposal(projectTitle: string, projectDescription: string, prompt: string, language: string = 'en'): string {
  if (language === 'ar') {
    return `السلام عليكم،

أنا مهتم جداً بمشروعكم "${projectTitle}".

${prompt}

لدي خبرة واسعة في هذا المجال وأستطيع تنفيذ المشروع بجودة عالية.

أنا متاح للبدء فوراً والالتزام بالمواعيد المحددة.

في انتظار ردكم.
مع أطيب التحيات.`
  } else {
    return `Dear Client,

I am very interested in your project "${projectTitle}".

${prompt}

I have extensive experience in this field and can deliver high-quality work.

I am available to start immediately and committed to meeting deadlines.

Looking forward to hearing from you.
Best regards.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, prompt, language } = proposalSchema.parse(body)

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const generatedProposal = generateProposal(
      language === 'ar' ? project.titleAr : project.titleEn,
      language === 'ar' ? project.descriptionAr : project.descriptionEn,
      prompt,
      language
    )

    const aiProposal = await prisma.aiProposal.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        projectId,
        prompt,
        generatedProposal,
      },
    })

    return NextResponse.json({
      message: 'Proposal generated successfully',
      proposal: generatedProposal,
      id: aiProposal.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error generating proposal:', error)
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposals = await prisma.aiProposal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('Error fetching AI proposals:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}
