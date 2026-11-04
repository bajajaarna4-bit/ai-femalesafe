'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SOSModal from '@/components/SOSModal';
import ProfileModal from '@/components/ProfileModal';
import { TrustedContact } from '@/lib/types';
import { UserProfile, getClientUser, setClientUser } from '@/lib/store';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Phone,
  Trash2,
  CheckCircle2,
  Share2,
  Info,
} from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getClientUser());
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const notifyVia: ('SMS' | 'WHATSAPP')[] = [];
    if (notifySms) notifyVia.push('SMS');
    if (notifyWhatsapp) notifyVia.push('WHATSAPP');

    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        relation,
        priority,
        notifyVia,
      }),
    });

    if (res.ok) {
      setName('');
      setPhone('');
      setIsAdding(false);
      fetchContacts();
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Remove this trusted guardian?')) {
      await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      fetchContacts();
    }
  };

  const handleSimulateInvite = (c: TrustedContact) => {
    const text = `Hi ${c.name}, I have verified you as my Tier ${c.priority} Emergency Guardian on SAATHI AI. In any safety incident, you will receive my real-time GPS coordinates.`;
    navigator.clipboard.writeText(text);
    alert(`Guardian Invitation copied to clipboard!\n\n"${text}"`);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar
        onTriggerSOS={() => setSosModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-stone-700 dark:text-slate-300" />
              <span>Trusted Guardian Circle</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Organized into tiered escalation rings. Live coordinates are only shared upon explicit journey start or SOS.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Add Guardian'}</span>
          </button>
        </div>

        {/* Tier Explanation Strip */}
        <div className="bg-stone-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-semibold text-stone-900 dark:text-white">Tier 1: Immediate Ring</span>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Notified instantly with live tracking stream upon SOS trigger.
            </p>
          </div>
          <div>
            <span className="font-semibold text-stone-900 dark:text-white">Tier 2: Escalation Ring</span>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Activated if Tier 1 contacts do not acknowledge within 3 minutes.
            </p>
          </div>
          <div>
            <span className="font-semibold text-stone-900 dark:text-white">Tier 3: Institutional</span>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Campus security desks, hostel wardens, or housing guards.
            </p>
          </div>
        </div>

        {/* Add Contact Collapsible Form */}
        {isAdding && (
          <form
            onSubmit={handleAddContact}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs animate-fadeIn"
          >
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">
              Add Emergency Guardian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                  Cellular Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 22334"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <select
                  value={relation}
                  onChange={e => setRelation(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Partner">Partner</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Friend">Friend</option>
                  <option value="Hostel Warden">Hostel Warden / Security</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                  Escalation Tier
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value={1}>Tier 1 (Immediate 1st Responder)</option>
                  <option value={2}>Tier 2 (Secondary Escalation)</option>
                  <option value={3}>Tier 3 (Institutional / Security)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={e => setNotifySms(e.target.checked)}
                  className="rounded text-stone-800"
                />
                <span className="text-stone-700 dark:text-slate-300">Simulate SMS</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={e => setNotifyWhatsapp(e.target.checked)}
                  className="rounded text-stone-800"
                />
                <span className="text-stone-700 dark:text-slate-300">WhatsApp Alert</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold shadow-sm"
              >
                Save Guardian
              </button>
            </div>
          </form>
        )}

        {/* Contacts Directory List */}
        <div className="space-y-2.5">
          {contacts.map(c => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    c.priority === 1
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      : c.priority === 2
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300'
                  }`}
                >
                  T{c.priority}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 dark:text-white">
                      {c.name}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400">
                      {c.relation}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <p className="text-stone-400 text-[11px] mt-0.5">
                    {c.phone} • Via {c.notifyVia.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleSimulateInvite(c)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Send Invite</span>
                </button>

                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove Guardian"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-stone-50 dark:bg-slate-900/40 rounded-2xl border border-stone-200/60 dark:border-slate-800/60 flex items-start gap-2 text-xs text-stone-500 dark:text-slate-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400" />
          <p className="text-[11px]">
            Privacy Guarantee: Guardians never receive continuous background location. Coordinates are only streamed when an active journey is launched or during an SOS crisis.
          </p>
        </div>

      </main>

      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        contacts={contacts}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={userProfile}
        onUpdateUser={updated => {
          setUserProfile(updated);
          setClientUser(updated);
        }}
      />
    </div>
  );
}
