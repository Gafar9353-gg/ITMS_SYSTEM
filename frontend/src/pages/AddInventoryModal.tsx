import { FiX } from 'react-icons/fi';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (e: React.FormEvent) => void;
  inventoryFormData: any;
  setInventoryFormData: (data: any) => void;
}

const AddInventoryModal = ({ isOpen, onClose, onAdd, inventoryFormData, setInventoryFormData }: AddInventoryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add Inventory Item</h2>
          <button onClick={onClose}><FiX className="text-slate-400 text-xl" /></button>
        </div>
        <form onSubmit={onAdd} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Item Name *</label>
            <input type="text" required value={inventoryFormData.name} onChange={e => setInventoryFormData({...inventoryFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Type</label>
              <select value={inventoryFormData.type} onChange={e => setInventoryFormData({...inventoryFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option>Cartridge</option><option>Peripheral</option><option>Cable</option><option>Consumable</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Unit</label>
              <select value={inventoryFormData.unit} onChange={e => setInventoryFormData({...inventoryFormData, unit: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option>pcs</option><option>kg</option><option>liters</option><option>boxes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Current Stock</label>
              <input type="number" value={inventoryFormData.currentStock} onChange={e => setInventoryFormData({...inventoryFormData, currentStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Min Stock Level</label>
              <input type="number" value={inventoryFormData.minStock} onChange={e => setInventoryFormData({...inventoryFormData, minStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;