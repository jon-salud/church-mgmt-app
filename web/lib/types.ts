export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  prayerCount: number;
}

export interface PastoralCareTicket {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  author: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  comments: PastoralCareComment[];
}

export interface PastoralCareComment {
  id: string;
  body: string;
  author: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}
