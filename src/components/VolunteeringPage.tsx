import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MapPin, Calendar, Users, Award } from 'lucide-react';
import { Button } from './ui/button';
import VolunteerApplicationForm from './VolunteerApplicationForm';
import { fetchVolunteeringOpportunities, type VolunteeringOpportunityDto } from '../lib/api';
import { toast } from 'sonner';

export default function VolunteeringPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<VolunteeringOpportunityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchVolunteeringOpportunities('published');
        if (!active) return;
        setOpportunities(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load volunteering opportunities');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen pb-24 pt-20 px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-800 mb-1">Volunteering</h1>
        <p className="text-purple-600">Make a difference today</p>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12 text-gray-400">Loading opportunities...</div>
        )}
        {!loading && opportunities.length === 0 && (
          <div className="text-center py-12 text-gray-400">No volunteering opportunities found</div>
        )}
        {!loading && opportunities.length > 0 && opportunities.map((opportunity, idx) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
          >
            <div className={`h-20 bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl relative overflow-hidden`}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/10"
              />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                className="relative z-10 text-white font-semibold"
              >
                {opportunity.category || 'Volunteer'}
              </motion.div>
            </div>
            <div className="p-4">
              <h3 className="text-gray-800 mb-1">{opportunity.title}</h3>
              <p className="text-purple-600 mb-3">{opportunity.organization}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>{opportunity.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-yellow-500" />
                  <span>{opportunity.requiredVolunteers} required</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setSelectedOpportunity(opportunity.title)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl shadow-md"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Apply as Volunteer
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Volunteer Application Form Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <VolunteerApplicationForm 
            activityName={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}