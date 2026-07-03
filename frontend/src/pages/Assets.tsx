import { FiX } from 'react-icons/fi';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: any) => void;
  newAsset: any;
  setNewAsset: (asset: any) => void;
}

const AddAssetModal = ({ isOpen, onClose, onAdd, newAsset, setNewAsset }: AddAssetModalProps) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Add New Asset</h2>
          <button type="button" onClick={onClose} className="hover:text-white transition-colors">
            <FiX className="text-slate-400 text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Asset Name *</label>
            <input 
              type="text" 
              required 
              value={newAsset.name} 
              onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter asset name"
              autoComplete="off"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Type</label>
              <select 
                value={newAsset.type} 
                onChange={(e) => setNewAsset({...newAsset, type: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Desktop">Desktop</option>
                <option value="Laptop">Laptop</option>
                <option value="Printer">Printer</option>
                <option value="Projector">Projector</option>
                <option value="Switch">Switch</option>
                <option value="Router">Router</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Department</label>
              <select 
                value={newAsset.department} 
                onChange={(e) => setNewAsset({...newAsset, department: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Network">Network</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Serial Number</label>
            <input 
              type="text" 
              value={newAsset.serialNumber} 
              onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter serial number"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Vendor</label>
            <input 
              type="text" 
              value={newAsset.vendor} 
              onChange={(e) => setNewAsset({...newAsset, vendor: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter vendor name"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Cost (₹)</label>
              <input 
                type="number" 
                value={newAsset.cost} 
                onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="Enter cost"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Location</label>
              <input 
                type="text" 
                value={newAsset.location} 
                onChange={(e) => setNewAsset({...newAsset, location: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="Enter location"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Purchase Date</label>
              <input 
                type="date" 
                value={newAsset.purchaseDate} 
                onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Warranty End Date</label>
              <input 
                type="date" 
                value={newAsset.warrantyEnd} 
                onChange={(e) => setNewAsset({...newAsset, warrantyEnd: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Assigned To</label>
            <input 
              type="text" 
              value={newAsset.assignedTo} 
              onChange={(e) => setNewAsset({...newAsset, assignedTo: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter assigned person"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Invoice Number</label>
            <input 
              type="text" 
              value={newAsset.invoiceNumber} 
              onChange={(e) => setNewAsset({...newAsset, invoiceNumber: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter invoice number"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select 
              value={newAsset.status} 
              onChange={(e) => setNewAsset({...newAsset, status: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition-all"
            >
              Add Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;