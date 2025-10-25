import { notFound } from 'next/navigation';
import { TicketDetailClientPage } from './client-page';

export async function generateStaticParams() {
  // For static export, we need to provide all possible ticket IDs
  // In a real deployment, this would fetch from your database
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  // For static export, remove authentication checks
  // const session = await getSession();
  // if (!session) {
  //   redirect('/api/auth/login');
  // }

  const id = params.id;
  if (!id) {
    notFound();
  }

  // Demo data for static export
  const demoTickets = {
    '1': {
      id: '1',
      title: 'Prayer Request for Healing',
      description: 'Please pray for my grandmother who is in the hospital.',
      status: 'NEW' as const,
      priority: 'NORMAL' as const,
      author: {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      createdAt: '2024-01-10T10:00:00Z',
      comments: [
        {
          id: '1',
          body: "We're praying for your grandmother. Please keep us updated.",
          author: {
            profile: {
              firstName: 'Pastor',
              lastName: 'Smith',
            },
          },
          createdAt: '2024-01-10T11:00:00Z',
        },
      ],
    },
    '2': {
      id: '2',
      title: 'Counseling Request',
      description: 'I would like to speak with someone about some personal challenges.',
      status: 'ASSIGNED' as const,
      priority: 'HIGH' as const,
      author: {
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
      createdAt: '2024-01-09T14:00:00Z',
      comments: [],
    },
    '3': {
      id: '3',
      title: 'Baptism Preparation',
      description: "I'm interested in learning more about baptism.",
      status: 'IN_PROGRESS' as const,
      priority: 'NORMAL' as const,
      author: {
        profile: {
          firstName: 'Bob',
          lastName: 'Johnson',
        },
      },
      createdAt: '2024-01-08T09:00:00Z',
      comments: [
        {
          id: '2',
          body: "I'd be happy to meet with you to discuss baptism. When would be a good time?",
          author: {
            profile: {
              firstName: 'Pastor',
              lastName: 'Smith',
            },
          },
          createdAt: '2024-01-08T10:00:00Z',
        },
      ],
    },
    '4': {
      id: '4',
      title: 'Marriage Counseling',
      description: 'My spouse and I could use some guidance.',
      status: 'RESOLVED' as const,
      priority: 'HIGH' as const,
      author: {
        profile: {
          firstName: 'Alice',
          lastName: 'Davis',
        },
      },
      createdAt: '2024-01-05T16:00:00Z',
      comments: [
        {
          id: '3',
          body: "We've scheduled your first session for next Tuesday at 2 PM.",
          author: {
            profile: {
              firstName: 'Counselor',
              lastName: 'Brown',
            },
          },
          createdAt: '2024-01-06T09:00:00Z',
        },
      ],
    },
    '5': {
      id: '5',
      title: 'Financial Assistance',
      description: "We're going through a difficult time financially.",
      status: 'NEW' as const,
      priority: 'URGENT' as const,
      author: {
        profile: {
          firstName: 'Charlie',
          lastName: 'Davis',
        },
      },
      createdAt: '2024-01-12T08:00:00Z',
      comments: [],
    },
  };

  const ticket = demoTickets[id as keyof typeof demoTickets];
  if (!ticket) {
    notFound();
  }

  return <TicketDetailClientPage ticket={ticket} />;
}
