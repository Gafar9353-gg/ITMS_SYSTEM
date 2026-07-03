import { FiX } from 'react-icons/fi';

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (e: React.FormEvent) => void;
  newTicket: any;
  setNewTicket: (ticket: any) => void;
}

const AddTicketModal = ({ isOpen, onClose, onAdd, newTicket, setNewTicket }: AddTicketModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
          <button onClick={onClose}><FiX className="text-slate-400 text-xl" /></button>
        </div>
        <form onSubmit={onAdd} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Title *</label>
            <input type="text" required value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Enter ticket title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Category</label>
              <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option>Hardware Issues</option>
                <option>Printer Issues</option>
                <option>Internet Issues</option>
                <option>Software Issues</option>
                <option>Projector Issues</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Priority</label>
              <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option>low</option>
                <option>medium</option>
                <option>high</option>
                <option>urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Description *</label>
            <textarea required value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} rows={3} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Describe the issue" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Location</label>
            <input type="text" value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., Room 201, IT Block" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketModal;