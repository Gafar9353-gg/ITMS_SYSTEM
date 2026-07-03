import { FiX } from 'react-icons/fi';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (e: React.FormEvent) => void;
  staffFormData: any;
  setStaffFormData: (data: any) => void;
}

const AddStaffModal = ({ isOpen, onClose, onAdd, staffFormData, setStaffFormData }: AddStaffModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
          <button onClick={onClose}><FiX className="text-slate-400 text-xl" /></button>
        </div>
        <form onSubmit={onAdd} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Name *</label>
            <input type="text" required value={staffFormData.name} onChange={e => setStaffFormData({...staffFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Role</label>
            <input type="text" required value={staffFormData.role} onChange={e => setStaffFormData({...staffFormData, role: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Department</label>
            <input type="text" required value={staffFormData.department} onChange={e => setStaffFormData({...staffFormData, department: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Email</label>
            <input type="email" required value={staffFormData.email} onChange={e => setStaffFormData({...staffFormData, email: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Phone</label>
            <input type="tel" required value={staffFormData.phone} onChange={e => setStaffFormData({...staffFormData, phone: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select value={staffFormData.status} onChange={e => setStaffFormData({...staffFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
              <option>available</option><option>busy</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Expertise (comma separated)</label>
            <input type="text" value={staffFormData.expertise.join(', ')} onChange={e => setStaffFormData({...staffFormData, expertise: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., Hardware Issues, Network Issues" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;