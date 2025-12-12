import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
};

export type CompatLoginPayload = {
  email: string;
  role: 'student' | 'admin';
  name?: string;
  studentId?: string;
  phone?: string;
};

export type EventDto = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  status: 'draft' | 'published';
  bannerUrl?: string;
};

export type EventRegistrationPayload = {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
};

export function setAuthHeaders(role?: 'student' | 'admin', email?: string) {
  if (role && email) {
    api.defaults.headers.common['x-user-role'] = role;
    api.defaults.headers.common['x-user-email'] = email;
  } else {
    delete api.defaults.headers.common['x-user-role'];
    delete api.defaults.headers.common['x-user-email'];
  }
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post('/auth/signup/', payload);
  return data;
}

export async function login(payload: LoginPayload) {
  // Send both username and email with the same value to support either auth mode server-side
  const body: any = { 
    username: payload.email,
    email: payload.email,
    password: payload.password 
  };
  const { data } = await api.post('/auth/login/', body);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
  return data as { access: string; refresh: string; user: any };
}

export async function compatLogin(payload: CompatLoginPayload) {
  // Use Django compatibility login that accepts { email, role, name?, studentId?, phone? }
  const { data } = await api.post('/auth/compat-login/', payload);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
  return data as { access: string; refresh: string; user: any };
}

export async function fetchEvents(status?: 'published' | 'draft' | 'approved' | 'rejected' | 'pending') {
  const { data } = await api.get<EventDto[]>('/events/', { params: status ? { status } : undefined });
  return data;
}

export type EventCreatePayload = {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or HH:mm:ss
  location: string;
  category: string;
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected';
  bannerUrl?: string;
};

export async function createEvent(payload: EventCreatePayload) {
  const { data } = await api.post('/events/', payload);
  return data as EventDto;
}

export type EventRegistration = {
  id: number;
  event: number;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export async function listEventRegistrations(eventId: string | number) {
  const { data } = await api.get<EventRegistration[]>(`/events/${eventId}/registrations/`);
  return data;
}

export async function approveEventRegistration(eventId: string | number, registrationId: string | number) {
  const { data } = await api.post<EventRegistration>(`/events/${eventId}/registrations/${registrationId}/approve/`);
  return data;
}

export async function rejectEventRegistration(eventId: string | number, registrationId: string | number) {
  const { data } = await api.post<EventRegistration>(`/events/${eventId}/registrations/${registrationId}/reject/`);
  return data;
}

export async function registerForEvent(eventId: string, payload: EventRegistrationPayload) {
  const { data } = await api.post(`/events/${eventId}/register/`, payload);
  return data as { registrationId: string; registration: unknown };
}

// Clubs
export type ClubDto = {
  id: number;
  name: string;
  description: string;
  created_by: number | null;
  created_at: string;
};

export type ClubJoinRequestPayload = {
  fullName: string;
  email: string;
  studentId: string;
  phone?: string;
  reason?: string;
};

export type ClubJoinRequest = {
  id: number;
  club: number;
  fullName: string;
  email: string;
  studentId: string;
  phone: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export async function fetchClubs() {
  const { data } = await api.get<ClubDto[]>('/clubs/');
  return data;
}

export async function createClub(payload: { name: string; description?: string }) {
  const { data } = await api.post<ClubDto>('/clubs/', payload);
  return data;
}

export async function joinClub(clubId: string | number, payload: ClubJoinRequestPayload) {
  const { data } = await api.post(`/clubs/${clubId}/join/`, payload);
  return data as { requestId: number; request: ClubJoinRequest };
}

export async function listClubRequests(clubId: string | number) {
  const { data } = await api.get<ClubJoinRequest[]>(`/clubs/${clubId}/requests/`);
  return data;
}

export async function approveClubRequest(clubId: string | number, requestId: string | number) {
  const { data } = await api.post<ClubJoinRequest>(`/clubs/${clubId}/requests/${requestId}/approve/`);
  return data;
}

export async function rejectClubRequest(clubId: string | number, requestId: string | number) {
  const { data } = await api.post<ClubJoinRequest>(`/clubs/${clubId}/requests/${requestId}/reject/`);
  return data;
}

// Volunteering
export type VolunteeringOpportunityDto = {
  id: number;
  title: string;
  description: string;
  organization: string;
  location: string;
  date: string;
  time: string;
  durationHours: number;
  requiredVolunteers: number;
  category: string;
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected' | 'closed';
  bannerUrl?: string;
  created_at: string;
};

export type VolunteeringApplicationPayload = {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  motivation?: string;
};

export type VolunteeringApplication = {
  id: number;
  opportunity: number;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export async function fetchVolunteeringOpportunities(status?: string) {
  const { data } = await api.get<VolunteeringOpportunityDto[]>('/volunteering/', { params: status ? { status } : undefined });
  return data;
}

export async function createVolunteeringOpportunity(payload: Partial<VolunteeringOpportunityDto>) {
  const { data } = await api.post<VolunteeringOpportunityDto>('/volunteering/', payload);
  return data;
}

export async function applyForVolunteering(opportunityId: string | number, payload: VolunteeringApplicationPayload) {
  const { data } = await api.post(`/volunteering/${opportunityId}/apply/`, payload);
  return data as { applicationId: number; application: VolunteeringApplication };
}

export async function listVolunteeringApplications(opportunityId: string | number) {
  const { data } = await api.get<VolunteeringApplication[]>(`/volunteering/${opportunityId}/applications/`);
  return data;
}

export async function approveVolunteeringApplication(opportunityId: string | number, applicationId: string | number) {
  const { data } = await api.post<VolunteeringApplication>(`/volunteering/${opportunityId}/applications/${applicationId}/approve/`);
  return data;
}

export async function rejectVolunteeringApplication(opportunityId: string | number, applicationId: string | number) {
  const { data } = await api.post<VolunteeringApplication>(`/volunteering/${opportunityId}/applications/${applicationId}/reject/`);
  return data;
}

// Internships
export type InternshipDto = {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  internshipType: 'full-time' | 'part-time' | 'remote' | 'hybrid';
  durationMonths: number;
  stipend: string;
  applicationDeadline: string;
  category: string;
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected' | 'closed';
  bannerUrl?: string;
  created_at: string;
};

export type InternshipApplicationPayload = {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
};

export type InternshipApplication = {
  id: number;
  internship: number;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: 'pending' | 'approved' | 'rejected' | 'shortlisted';
  created_at: string;
};

export async function fetchInternships(status?: string) {
  const { data } = await api.get<InternshipDto[]>('/internships/', { params: status ? { status } : undefined });
  return data;
}

export async function createInternship(payload: Partial<InternshipDto>) {
  const { data } = await api.post<InternshipDto>('/internships/', payload);
  return data;
}

export async function applyForInternship(internshipId: string | number, payload: InternshipApplicationPayload) {
  const { data } = await api.post(`/internships/${internshipId}/apply/`, payload);
  return data as { applicationId: number; application: InternshipApplication };
}

export async function listInternshipApplications(internshipId: string | number) {
  const { data } = await api.get<InternshipApplication[]>(`/internships/${internshipId}/applications/`);
  return data;
}

export async function approveInternshipApplication(internshipId: string | number, applicationId: string | number) {
  const { data } = await api.post<InternshipApplication>(`/internships/${internshipId}/applications/${applicationId}/approve/`);
  return data;
}

export async function rejectInternshipApplication(internshipId: string | number, applicationId: string | number) {
  const { data } = await api.post<InternshipApplication>(`/internships/${internshipId}/applications/${applicationId}/reject/`);
  return data;
}

export async function shortlistInternshipApplication(internshipId: string | number, applicationId: string | number) {
  const { data } = await api.post<InternshipApplication>(`/internships/${internshipId}/applications/${applicationId}/shortlist/`);
  return data;
}

// Workshops
export type WorkshopDto = {
  id: number;
  title: string;
  description: string;
  instructor: string;
  organization: string;
  date: string;
  time: string;
  durationHours: number;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  maxParticipants: number;
  fee: string;
  category: string;
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected' | 'completed';
  bannerUrl?: string;
  created_at: string;
};

export type WorkshopRegistrationPayload = {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  expectations?: string;
};

export type WorkshopRegistration = {
  id: number;
  workshop: number;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  expectations: string;
  status: 'pending' | 'approved' | 'rejected' | 'attended';
  created_at: string;
};

export async function fetchWorkshops(status?: string) {
  const { data } = await api.get<WorkshopDto[]>('/workshops/', { params: status ? { status } : undefined });
  return data;
}

export async function createWorkshop(payload: Partial<WorkshopDto>) {
  const { data } = await api.post<WorkshopDto>('/workshops/', payload);
  return data;
}

export async function registerForWorkshop(workshopId: string | number, payload: WorkshopRegistrationPayload) {
  const { data } = await api.post(`/workshops/${workshopId}/register/`, payload);
  return data as { registrationId: number; registration: WorkshopRegistration };
}

export async function listWorkshopRegistrations(workshopId: string | number) {
  const { data } = await api.get<WorkshopRegistration[]>(`/workshops/${workshopId}/registrations/`);
  return data;
}

export async function approveWorkshopRegistration(workshopId: string | number, registrationId: string | number) {
  const { data } = await api.post<WorkshopRegistration>(`/workshops/${workshopId}/registrations/${registrationId}/approve/`);
  return data;
}

export async function rejectWorkshopRegistration(workshopId: string | number, registrationId: string | number) {
  const { data } = await api.post<WorkshopRegistration>(`/workshops/${workshopId}/registrations/${registrationId}/reject/`);
  return data;
}

export async function markWorkshopAttended(workshopId: string | number, registrationId: string | number) {
  const { data } = await api.post<WorkshopRegistration>(`/workshops/${workshopId}/registrations/${registrationId}/mark-attended/`);
  return data;
}

export default api;

