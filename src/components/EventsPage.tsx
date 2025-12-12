import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { EventDto, fetchEvents, registerForEvent } from '../lib/api';

interface EventsPageProps {
  userEmail?: string;
}

type UiEvent = EventDto & { attendees?: number; image?: string; color?: string };

export default function EventsPage({ userEmail }: EventsPageProps) {
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    studentId: '',
    email: userEmail || '',
    phone: '',
  });

  useEffect(() => {
    if (userEmail) {
      setRegisterForm((prev) => ({ ...prev, email: prev.email || userEmail }));
    }
  }, [userEmail]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Try fetching published first
        let data = await fetchEvents('published');
        if ((!data || data.length === 0)) {
          // Fallback: fetch all without status filter
          data = await fetchEvents();
        }
        if (!active) return;
        const normalized: UiEvent[] = (data || []).map((evt, idx) => ({
          ...evt,
          attendees: 100 + idx * 50,
          image: ['🎭', '🎨', '⚽'][idx % 3],
          color: ['from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500', 'from-yellow-500 to-orange-500'][idx % 3],
        }));
        setEvents(normalized);
      } catch (err) {
        console.error(err);
        setEvents([]);
        toast.error('Could not load events.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const upcomingEvents = useMemo(() => events, [events]);

  const handleRegister = () => {
    if (!selectedEvent) return;
    const { fullName, studentId, email, phone } = registerForm;
    if (!fullName || !studentId || !email || !phone) {
      toast.error('Please fill all fields');
      return;
    }
    registerForEvent(selectedEvent.id, { fullName, studentId, email, phone })
      .then((res) => {
        setQrToken(String(res.registrationId));
        toast.success('Registration successful!');
        setShowRegistration(false);
        setShowQR(true);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Registration failed. Try again.');
      });
  };

  return (
    <div className="min-h-screen pb-24 pt-20 px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-800 mb-1">Events</h1>
        <p className="text-purple-600">Discover amazing experiences</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white rounded-2xl shadow-md p-1">
          <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            Past
          </TabsTrigger>
          <TabsTrigger value="recommended" className="rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-0">
          {loading && (
            <div className="text-center py-12 text-gray-400">Loading events...</div>
          )}
          {!loading && upcomingEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400">No events found</div>
          )}
          {!loading && upcomingEvents.length > 0 && upcomingEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              <div className={`h-32 bg-gradient-to-br ${event.color} flex items-center justify-center text-6xl`}>
                {event.image}
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-gray-800">{event.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const evt = upcomingEvents.find((e) => e.id === event.id) || null;
                    setSelectedEvent(evt);
                    setShowRegistration(true);
                    setRegisterForm((prev) => ({
                      ...prev,
                      email: prev.email || userEmail || '',
                    }));
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-md"
                >
                  Register Now
                </Button>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="past">
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No past events to show</p>
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Recommendations coming soon!</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Event Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full Name"
              className="rounded-xl"
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
            />
            <Input
              placeholder="Student ID"
              className="rounded-xl"
              value={registerForm.studentId}
              onChange={(e) => setRegisterForm({ ...registerForm, studentId: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              className="rounded-xl"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              className="rounded-xl"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
            <Button
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl"
            >
              Confirm Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="rounded-3xl text-center">
          <DialogHeader>
            <DialogTitle>Registration Successful! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-purple-600" />
            </div>
            <p className="text-gray-600">
              Show this QR code at the event entrance
            </p>
            {qrToken && (
              <p className="text-purple-600 mt-2 break-all">
                QR Token: {qrToken}
              </p>
            )}
            <p className="text-purple-600 mt-2">A reminder will be sent before the event</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
