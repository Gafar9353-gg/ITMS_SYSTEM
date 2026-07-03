import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import mitkLogo from '../assets/mitk_logo.png';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  FiUsers, FiMonitor, FiHome, FiBarChart2, FiCalendar, 
  FiBell, FiSearch, FiLogOut, FiTrendingUp, FiTrendingDown, 
  FiCheckCircle, FiAlertCircle, FiClock, FiDownload, 
  FiRefreshCw, FiUserPlus, FiPrinter, FiServer, FiX, FiChevronRight,
  FiPlus, FiEye, FiWifi, FiBox, FiFileText, FiMapPin, FiPhone, FiMail, FiHash,
  FiEdit2, FiSave, FiPower, FiActivity, FiMinus, FiPlus as FiPlusIcon, FiTrash2, FiFolder
} from 'react-icons/fi';
import { 
  MdConfirmationNumber, MdLocalOffer, MdSchool, MdSpeed
} from 'react-icons/md';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper Components
const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
    urgent: "bg-purple-500/20 text-purple-400"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`}>{priority}</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    maintenance: "bg-yellow-500/20 text-yellow-400",
    pending: "bg-orange-500/20 text-orange-400",
    resolved: "bg-green-500/20 text-green-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    good: "bg-green-500/20 text-green-400",
    low: "bg-red-500/20 text-red-400",
    working: "bg-green-500/20 text-green-400",
    "not-working": "bg-red-500/20 text-red-400",
    operational: "bg-green-500/20 text-green-400",
    expiring: "bg-red-500/20 text-red-400"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>{status}</span>;
};

const StatCard = ({ title, value, icon, color, trend, onClick }: any) => (
  <div onClick={onClick} className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 ${onClick ? 'cursor-pointer' : ''}`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-${color}-500/20`}>
          <span className={`text-${color}-400 text-xl`}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className={`text-3xl font-bold mt-2 text-${color}-400`}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal states
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [showAllTicketsModal, setShowAllTicketsModal] = useState(false);
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);
  const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [editingPc, setEditingPc] = useState<any>(null);
  const [showEditPcModal, setShowEditPcModal] = useState(false);
  const [showAddPcModal, setShowAddPcModal] = useState(false);
  const [showEventLogModal, setShowEventLogModal] = useState(false);
  const [selectedPcEvents, setSelectedPcEvents] = useState<any[]>([]);

  // Asset Edit States
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editAssetFormData, setEditAssetFormData] = useState({
    name: '', type: 'Desktop', serialNumber: '', department: 'IT', 
    status: 'active', vendor: '', cost: '', purchaseDate: '', 
    warrantyEnd: '', location: '', assignedTo: '', invoiceNumber: '',
    quantity: ''
  });

  // Lab Add States
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '', location: '', capacity: 0, computers: 0,
    status: 'operational', nextMaintenance: '', software: '', hardware: ''
  });
  
  // Inventory Modal States
  const [showEditInventoryModal, setShowEditInventoryModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '', type: 'Cartridge', currentStock: 0, minStock: 0, unit: 'pcs'
  });
  
  // Staff Modal States
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '', role: '', department: '', email: '', phone: '', status: 'available', expertise: [] as string[]
  });

  // Lab Modal States
  const [showEditLabModal, setShowEditLabModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [labFormData, setLabFormData] = useState({
    name: '', location: '', capacity: 0, computers: 0, status: 'operational', nextMaintenance: '', software: '', hardware: ''
  });
  
  // Network Modal States
  const [showEditNetworkModal, setShowEditNetworkModal] = useState(false);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [networkFormData, setNetworkFormData] = useState({
    name: '', ssid: '', speed: '300 Mbps', type: 'Fiber Optic', routerIp: '', status: 'active', locations: '', coverage: '', connectedDevices: 0, lastMaintenance: ''
  });

  // Software License Modal States
  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [licenseFormData, setLicenseFormData] = useState({
    name: '', type: 'OS', totalLicenses: 0, usedLicenses: 0, expiryDate: '', vendor: '', cost: 0, status: 'active'
  });

  // Form states
  const [newAsset, setNewAsset] = useState({
    name: '', type: 'Desktop', serialNumber: '', department: 'IT', 
    status: 'active', vendor: '', cost: '', purchaseDate: '', 
    warrantyEnd: '', location: '', assignedTo: '', invoiceNumber: '',
    quantity: '1'
  });
  
  const [newTicket, setNewTicket] = useState({
    title: '', category: 'Hardware Issues', priority: 'medium', 
    department: 'IT', description: '', contactPerson: '', contactEmail: '', 
    contactPhone: '', location: ''
  });

  const [newPc, setNewPc] = useState({
    name: '', location: '', status: 'working',
    assignedTo: 'Student Use', specs: '', os: 'Windows 11', issue: ''
  });

  // Staff members data
  const [staffMembers, setStaffMembers] = useState<any[]>(() => {
    const saved = localStorage.getItem('staffMembers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Gafar H', role: 'Senior IT Support', department: 'IT', expertise: ['Hardware ', 'Network','Software'], email: 'systemadmin@mitkundapura.com', phone: '9353194797', status: 'available', ticketsAssigned: 3 },
      { id: 2, name: 'Bharath Kumar', role: 'Senior IT Support', department: 'IT', expertise: ['Hardware', 'Network'], email: 'Systemadmin@mitkundapura.com', phone: '9353711466', status: 'available', ticketsAssigned: 3 },
    ];
  });

  // Laboratories data
  const [laboratories, setLaboratories] = useState<any[]>(() => {
    const saved = localStorage.getItem('laboratories');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Computer Lab 204', location: ' 1st Floor', capacity: 35, computers: 35, status: 'operational', nextMaintenance: '2024-06-10', software: 'Windows 11, Office 2021, VS Code', hardware: 'Intel i7, 16GB RAM, 512GB SSD' },
      { id: 2, name: 'Computer Lab 203', location: '1st Floor', capacity: 35, computers: 35, status: 'operational', nextMaintenance: '2024-06-05', software: 'Windows 11, Office 2021, Photoshop', hardware: 'AMD Ryzen 5, 16GB RAM, 512GB SSD' },
      { id: 3, name: 'Computer Lab 205', location: 'Block C - Ground Floor', capacity: 30, computers: 28, status: 'operational', nextMaintenance: '2024-06-12', software: 'Raspberry Pi OS, Arduino IDE', hardware: 'Raspberry Pi 4, Sensors Kit' },
      { id: 4, name: 'MCA Lab', location: 'Ground-Floar', capacity: 30, computers: 30, status: 'operational', nextMaintenance: '2026-06-15', software: 'Windows 10,Java,Python', hardware: 'Intel i7, 8GB RAM, 512GB SSD' },
      { id: 5, name: 'Computer Lab 201', location: '1st Floor', capacity: 35, computers: 35, status: 'operational', nextMaintenance: '2026-06-18', software: 'Ubnatu,Python,C,java,Mysql', hardware: 'Intel i5, 8GB RAM, 512 SSD, RTX 3060' },
      { id: 6, name: 'Computer Lab 202', location: '1st Floor', capacity: 35, computers: 35, status: 'operational', nextMaintenance: '2026-06-18', software: 'Ubnatu,Python,C,java,Mysql', hardware: 'Intel i5, 8GB RAM, 512 SSD, RTX 3060' },
      { id: 7, name: 'Computer Lab 208', location: '1st Floor', capacity: 35, computers: 35, status: 'operational', nextMaintenance: '2026-06-18', software: 'Ubnatu,Python,C,java,Mysql', hardware: 'Intel i5, 8GB RAM, 512 SSD, RTX 3060' },
      { id: 8, name: 'Computer Lab 209', location: '1st Floor', capacity: 32, computers: 32, status: 'operational', nextMaintenance: '2026-06-18', software: 'Ubnatu,Redhat', hardware: 'Intel i5, 8GB RAM, 512 SSD, RTX 3060' },
    ];
  });

  // Network Connections Data
  const [networkConnections, setNetworkConnections] = useState<any[]>(() => {
    const saved = localStorage.getItem('networkConnections');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'NW-CONN-001', 
        name: 'MITK_College_Main1', 
        ssid: 'MITK_College_Main1',
        speed: '300 Mbps',
        type: 'Fiber Optic',
        routerIp: '10.10.1.1',
        status: 'active',
        locations: ['All Departments', 'MCA Lab', 'Administrative Block'],
        coverage: ['CS Department', 'IT Department', 'MCA Lab'],
        connectedDevices: 245,
        lastMaintenance: '2024-05-15'
      },
      { 
        id: 'NW-CONN-002', 
        name: 'ckmitcollege4_Main2', 
        ssid: 'ckmitcollege4_Main2',
        speed: '200 Mbps',
        type: 'Fiber Optic',
        routerIp: '10.10.2.1',
        status: 'active',
        locations: ['All Laboratories', 'Computer Lab A', 'Computer Lab B'],
        coverage: ['Computer Lab A', 'Computer Lab B', 'IoT Lab'],
        connectedDevices: 180,
        lastMaintenance: '2024-05-10'
      },
      { 
        id: 'NW-CONN-003', 
        name: 'ckmitcollege_Main3', 
        ssid: 'ckmitcollege_Main3',
        speed: '200 Mbps',
        type: 'Fiber Optic',
        routerIp: '10.10.3.1',
        status: 'active',
        locations: ['Degree College', 'AIML Labs', 'Science Block'],
        coverage: ['Degree College', 'AIML Research Lab', 'Data Science Lab'],
        connectedDevices: 320,
        lastMaintenance: '2024-05-18'
      },
      { 
        id: 'NW-CONN-004', 
        name: 'ckmitcollege5_Main4', 
        ssid: 'ckmitcollege5_Main4',
        speed: '300 Mbps',
        type: 'Fiber Optic',
        routerIp: '10.10.4.1',
        status: 'active',
        locations: ['Placement Cell', 'Training & Placement Office', 'Seminar Hall'],
        coverage: ['Placement Office', 'Training Hub', 'Seminar Hall'],
        connectedDevices: 95,
        lastMaintenance: '2024-05-20'
      }
    ];
  });

  // PCs DATA
  const [pcs, setPcs] = useState<any[]>(() => {
    const saved = localStorage.getItem('pcs');
    return saved ? JSON.parse(saved) : [];
  });

  // ASSETS DATA
  const [assets, setAssets] = useState<any[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : [
      { id: 'AST-001', name: 'Dell Optiplex 7090', type: 'Desktop', serial: 'DL-001', department: 'IT', status: 'active', purchaseDate: '2023-01-15', warrantyEnd: '2026-01-15', vendor: 'Dell India', cost: 85000, assignedTo: 'John Doe', location: 'Lab A', invoiceNumber: 'INV-2023-001', quantity: 1 },
      { id: 'AST-002', name: 'MacBook Pro M3', type: 'Laptop', serial: 'AP-002', department: 'HR', status: 'active', purchaseDate: '2024-02-20', warrantyEnd: '2027-02-20', vendor: 'Apple Store', cost: 189000, assignedTo: 'Sarah Chen', location: 'HR Office', invoiceNumber: 'INV-2024-045', quantity: 1 },
      { id: 'AST-003', name: 'HP LaserJet MFP', type: 'Printer', serial: 'HP-003', department: 'Finance', status: 'maintenance', purchaseDate: '2022-06-10', warrantyEnd: '2025-06-10', vendor: 'HP', cost: 45000, assignedTo: 'Finance Dept', location: 'Finance Office', invoiceNumber: 'INV-2022-789', quantity: 1 },
      { id: 'AST-004', name: 'Cisco Switch 2960', type: 'Switch', serial: 'CS-004', department: 'Network', status: 'active', purchaseDate: '2023-03-05', warrantyEnd: '2028-03-05', vendor: 'Cisco', cost: 125000, assignedTo: 'Network Team', location: 'Server Room', invoiceNumber: 'INV-2023-112', quantity: 1 },
      { id: 'AST-005', name: 'Epson Projector', type: 'Projector', serial: 'EP-005', department: 'Admin', status: 'active', purchaseDate: '2023-08-12', warrantyEnd: '2026-08-12', vendor: 'Epson', cost: 65000, assignedTo: 'Conference Room', location: 'Admin Building', invoiceNumber: 'INV-2023-556', quantity: 1 },
      { id: 'AST-006', name: 'TP-Link Router', type: 'Router', serial: 'TL-006', department: 'Network', status: 'active', purchaseDate: '2024-01-20', warrantyEnd: '2027-01-20', vendor: 'TP-Link', cost: 25000, assignedTo: 'Network Team', location: 'Server Room', invoiceNumber: 'INV-2024-023', quantity: 1 },
    ];
  });

  // INVENTORY / CONSUMABLES DATA
  const [consumables, setConsumables] = useState<any[]>(() => {
    const saved = localStorage.getItem('consumables');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Assembled CPU', type: 'Computer ', currentStock: 10, minStock: 5, unit: 'pcs', status: 'good', lastUpdated: '2024-06-10', location: 'Store Room A' },
      { id: 2, name: 'USB Mouse', type: 'Peripheral', currentStock: 12, minStock: 5, unit: 'pcs', status: 'low', lastUpdated: '2024-06-09', location: 'Store Room A' },
      { id: 3, name: 'USB Keyboard', type: 'Peripheral', currentStock: 8, minStock: 5, unit: 'pcs', status: 'low', lastUpdated: '2024-06-08', location: 'Store Room A' },
      { id: 4, name: 'HDMI Cable', type: 'Cable', currentStock: 25, minStock: 10, unit: 'pcs', status: 'good', lastUpdated: '2024-06-10', location: 'Store Room B' },
      { id: 5, name: 'Power Cord', type: 'Cable', currentStock: 18, minStock: 8, unit: 'pcs', status: 'good', lastUpdated: '2024-06-10', location: 'Store Room B' },
      { id: 6, name: 'Projector ', type: 'Consumable', currentStock: 15, minStock: 2, unit: 'pcs', status: 'low', lastUpdated: '2024-06-07', location: 'Store Room C' },
    ];
  });

  // TICKETS DATA
  const [tickets, setTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('tickets');
    return saved ? JSON.parse(saved) : [
      { id: "TKT-001", title: "Printer not responding", category: "Printer Issues", priority: "high", dept: "IT", status: "in-progress", assignedTo: "Sarah Chen", assignedById: 2, createdAt: "2024-05-20T10:30:00", resolvedAt: null, description: "Printer in room 201 is not responding", contactPerson: "John Doe", contactEmail: "john@college.edu", contactPhone: "+1 234 567 8900", location: "Room 201, IT Block", resolution: null },
      { id: "TKT-002", title: "Software installation failed", category: "Software Issues", priority: "medium", dept: "HR", status: "pending", assignedTo: "Sarah Chen", assignedById: 2, createdAt: "2024-05-19T14:20:00", resolvedAt: null, description: "Unable to install HR management software", contactPerson: "HR Manager", contactEmail: "hr@college.edu", contactPhone: "+1 234 567 8901", location: "HR Office, 2nd Floor", resolution: null },
      { id: "TKT-003", title: "Internet connectivity slow", category: "Internet Issues", priority: "high", dept: "Network", status: "urgent", assignedTo: "Mike Johnson", assignedById: 3, createdAt: "2024-05-20T09:15:00", resolvedAt: null, description: "Finance department internet is very slow", contactPerson: "Finance Head", contactEmail: "finance@college.edu", contactPhone: "+1 234 567 8902", location: "Finance Dept, Block B", resolution: null },
      { id: "TKT-004", title: "Computer not booting", category: "Hardware Issues", priority: "urgent", dept: "Admin", status: "resolved", assignedTo: "Alex Kumar", assignedById: 4, createdAt: "2024-05-18T11:00:00", resolvedAt: "2024-05-19T16:30:00", description: "System fails to start", contactPerson: "Admin Office", contactEmail: "admin@college.edu", contactPhone: "+1 234 567 8903", location: "Admin Block, Ground Floor", resolution: "Replaced faulty RAM module" },
      { id: "TKT-005", title: "Projector not displaying", category: "Projector Issues", priority: "medium", dept: "Teaching", status: "pending", assignedTo: "Priya Sharma", assignedById: 5, createdAt: "2024-05-19T13:45:00", resolvedAt: null, description: "Projector in Lecture Hall 1 not working", contactPerson: "Prof. Williams", contactEmail: "williams@college.edu", contactPhone: "+1 234 567 8904", location: "Lecture Hall 1, Academic Block", resolution: null },
    ];
  });

  // Software Licenses Data
  const [softwareLicenses, setSoftwareLicenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('softwareLicenses');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Windows 11 Pro', type: 'OS', totalLicenses: 150, usedLicenses: 142, expiryDate: '2025-12-31', vendor: 'Microsoft', cost: 15000, status: 'active' },
      { id: 2, name: 'Microsoft Office 2021', type: 'Office Suite', totalLicenses: 150, usedLicenses: 140, expiryDate: '2025-12-31', vendor: 'Microsoft', cost: 25000, status: 'active' },
      { id: 3, name: 'Quick Heal Antivirus', type: 'Security', totalLicenses: 200, usedLicenses: 185, expiryDate: '2024-08-15', vendor: 'Quick Heal', cost: 50000, status: 'expiring' },
    ];
  });

  const [networkDevices] = useState([
    { id: 'NW-001', name: 'Main Core Switch', type: 'Switch', ipAddress: '10.0.0.1', location: 'Server Room', status: 'active' },
    { id: 'NW-002', name: 'Router Gateway', type: 'Router', ipAddress: '10.0.0.254', location: 'Server Room', status: 'active' },
    { id: 'NW-003', name: 'Access Point - Lab A', type: 'Access Point', ipAddress: '10.0.1.10', location: 'Computer Lab A', status: 'active' },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, text: "New Asset Added: Dell Optiplex 7090", time: "2 minutes ago", icon: "💻", user: "Admin" },
    { id: 2, text: "Ticket TKT-001 Assigned to Sarah Chen", time: "1 hour ago", icon: "🎫", user: "System" },
    { id: 3, text: "License Expiring: Antivirus (30 days left)", time: "3 hours ago", icon: "⚠️", user: "System" },
    { id: 4, text: "Low Stock Alert: USB Keyboard", time: "5 hours ago", icon: "📦", user: "System" },
  ]);

  // Chart Data
  const assetDistributionData = [
    { name: 'Laptops', value: 35, color: '#06b6d4' },
    { name: 'Desktops', value: 28, color: '#6366f1' },
    { name: 'Printers', value: 12, color: '#f59e0b' },
    { name: 'Network Devices', value: 18, color: '#10b981' },
    { name: 'Projectors', value: 7, color: '#8b5cf6' },
  ];

  const ticketTrendData = [
    { name: 'Mon', tickets: 12, resolved: 10 },
    { name: 'Tue', tickets: 19, resolved: 15 },
    { name: 'Wed', tickets: 15, resolved: 13 },
    { name: 'Thu', tickets: 22, resolved: 18 },
    { name: 'Fri', tickets: 28, resolved: 24 },
    { name: 'Sat', tickets: 18, resolved: 16 },
    { name: 'Sun', tickets: 8, resolved: 7 },
  ];

  const statusDistributionData = [
    { name: 'Working', value: pcs.filter(p => p.status === 'working').length, color: '#10b981' },
    { name: 'Not Working', value: pcs.filter(p => p.status === 'not-working').length, color: '#ef4444' },
    { name: 'Maintenance', value: pcs.filter(p => p.status === 'maintenance').length, color: '#f59e0b' },
  ];

  const departmentStats = [
    { name: 'Computer Science', assets: 45, tickets: 8, users: 120, health: 94 },
    { name: 'Information Technology', assets: 38, tickets: 5, users: 95, health: 96 },
    { name: 'Electronics', assets: 32, tickets: 12, users: 80, health: 88 },
    { name: 'Mechanical', assets: 28, tickets: 6, users: 75, health: 92 },
    { name: 'Administration', assets: 30, tickets: 3, users: 45, health: 98 },
  ];

  const notifications = [
    { id: 1, title: "License Expiring Soon", message: "Antivirus expires in 30 days", time: "5 min ago", read: false },
    { id: 2, title: "Low Stock Alert", message: `${consumables.filter(c => c.status === 'low').length} items low in stock`, time: "1 hour ago", read: false },
    { id: 3, title: "Not Working PCs", message: `${pcs.filter(p => p.status === 'not-working').length} PCs reported not working`, time: "2 hours ago", read: false },
  ];

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('staffMembers', JSON.stringify(staffMembers));
  }, [staffMembers]);

  useEffect(() => {
    localStorage.setItem('laboratories', JSON.stringify(laboratories));
  }, [laboratories]);

  useEffect(() => {
    localStorage.setItem('networkConnections', JSON.stringify(networkConnections));
  }, [networkConnections]);

  useEffect(() => {
    localStorage.setItem('pcs', JSON.stringify(pcs));
  }, [pcs]);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('consumables', JSON.stringify(consumables));
  }, [consumables]);

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('softwareLicenses', JSON.stringify(softwareLicenses));
  }, [softwareLicenses]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const assignTicketToStaff = (category: string, department: string) => {
    const availableStaff = staffMembers.filter(s => 
      s.status === 'available' && 
      s.expertise.some(exp => category.toLowerCase().includes(exp.toLowerCase()))
    );
    if (availableStaff.length > 0) {
      return availableStaff.sort((a, b) => a.ticketsAssigned - b.ticketsAssigned)[0];
    }
    return staffMembers.find(s => s.department === department && s.status === 'available') || staffMembers.find(s => s.status === 'available');
  };

  // ==================== INVENTORY MANAGEMENT FUNCTIONS ====================
  const updateInventoryStock = (item: any, newStock: number, note?: string) => {
    const newStatus = newStock <= item.minStock ? 'low' : 'good';
    const updatedItem = {
      ...item,
      currentStock: newStock,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setConsumables(consumables.map(c => c.id === item.id ? updatedItem : c));
    showToast(`${item.name} stock updated to ${newStock} ${item.unit}! ✅`);
  };

  const addInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryFormData.name.trim()) {
      showToast('Please enter item name', 'error');
      return;
    }
    const newId = Math.max(...consumables.map(c => c.id), 0) + 1;
    const newStatus = inventoryFormData.currentStock <= inventoryFormData.minStock ? 'low' : 'good';
    const newItem = {
      id: newId,
      name: inventoryFormData.name,
      type: inventoryFormData.type,
      currentStock: inventoryFormData.currentStock,
      minStock: inventoryFormData.minStock,
      unit: inventoryFormData.unit,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      location: 'Store Room'
    };
    setConsumables([...consumables, newItem]);
    setShowAddInventoryModal(false);
    setInventoryFormData({ name: '', type: 'Cartridge', currentStock: 0, minStock: 0, unit: 'pcs' });
    showToast(`${newItem.name} added to inventory! ✅`);
  };

  const deleteInventoryItem = (id: number) => {
    const item = consumables.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete ${item?.name}?`)) {
      setConsumables(consumables.filter(c => c.id !== id));
      showToast(`${item?.name} removed from inventory! 🗑️`);
    }
  };

  const openEditInventoryModal = (item: any) => {
    setSelectedInventoryItem(item);
    setInventoryFormData({
      name: item.name,
      type: item.type,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit
    });
    setShowEditInventoryModal(true);
  };

  const updateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryItem) return;
    const newStatus = inventoryFormData.currentStock <= inventoryFormData.minStock ? 'low' : 'good';
    const updatedItem = {
      ...selectedInventoryItem,
      name: inventoryFormData.name,
      type: inventoryFormData.type,
      currentStock: inventoryFormData.currentStock,
      minStock: inventoryFormData.minStock,
      unit: inventoryFormData.unit,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setConsumables(consumables.map(c => c.id === selectedInventoryItem.id ? updatedItem : c));
    setShowEditInventoryModal(false);
    setSelectedInventoryItem(null);
    showToast(`${updatedItem.name} updated successfully! ✅`);
  };

  // ==================== STAFF MANAGEMENT FUNCTIONS ====================
  const openEditStaffModal = (staff: any) => {
    setSelectedStaff(staff);
    setStaffFormData({
      name: staff.name,
      role: staff.role,
      department: staff.department,
      email: staff.email,
      phone: staff.phone,
      status: staff.status,
      expertise: [...staff.expertise]
    });
    setShowEditStaffModal(true);
  };

  const updateStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const updatedStaff = {
      ...selectedStaff,
      name: staffFormData.name,
      role: staffFormData.role,
      department: staffFormData.department,
      email: staffFormData.email,
      phone: staffFormData.phone,
      status: staffFormData.status,
      expertise: staffFormData.expertise
    };
    setStaffMembers(staffMembers.map(s => s.id === selectedStaff.id ? updatedStaff : s));
    setShowEditStaffModal(false);
    setSelectedStaff(null);
    showToast(`${updatedStaff.name} updated successfully! ✅`);
  };

  const addStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name.trim()) {
      showToast('Please enter staff name', 'error');
      return;
    }
    const newId = Math.max(...staffMembers.map(s => s.id), 0) + 1;
    const newStaff = {
      id: newId,
      name: staffFormData.name,
      role: staffFormData.role,
      department: staffFormData.department,
      email: staffFormData.email,
      phone: staffFormData.phone,
      status: staffFormData.status,
      expertise: staffFormData.expertise,
      ticketsAssigned: 0
    };
    setStaffMembers([...staffMembers, newStaff]);
    setShowAddStaffModal(false);
    setStaffFormData({ name: '', role: '', department: '', email: '', phone: '', status: 'available', expertise: [] });
    showToast(`${newStaff.name} added to staff! ✅`);
  };

  const deleteStaffMember = (id: number) => {
    const staff = staffMembers.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to delete ${staff?.name}?`)) {
      setStaffMembers(staffMembers.filter(s => s.id !== id));
      showToast(`${staff?.name} removed from staff! 🗑️`);
    }
  };

  // ==================== LABORATORY MANAGEMENT FUNCTIONS ====================
  const openEditLabModal = (lab: any) => {
    setSelectedLab(lab);
    setLabFormData({
      name: lab.name,
      location: lab.location,
      capacity: lab.capacity,
      computers: lab.computers,
      status: lab.status,
      nextMaintenance: lab.nextMaintenance,
      software: lab.software,
      hardware: lab.hardware
    });
    setShowEditLabModal(true);
  };

  const updateLaboratory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab) return;
    const updatedLab = {
      ...selectedLab,
      name: labFormData.name,
      location: labFormData.location,
      capacity: labFormData.capacity,
      computers: labFormData.computers,
      status: labFormData.status,
      nextMaintenance: labFormData.nextMaintenance,
      software: labFormData.software,
      hardware: labFormData.hardware
    };
    setLaboratories(laboratories.map(l => l.id === selectedLab.id ? updatedLab : l));
    setShowEditLabModal(false);
    setSelectedLab(null);
    showToast(`${updatedLab.name} updated successfully! ✅`);
  };

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLab.name.trim()) {
      showToast('Please enter Lab name', 'error');
      return;
    }
    const newId = laboratories.length > 0 ? Math.max(...laboratories.map(l => l.id)) + 1 : 1;
    const newLabObj = {
      id: newId,
      name: newLab.name.trim(),
      location: newLab.location || 'Unknown',
      capacity: Number(newLab.capacity) || 0,
      computers: Number(newLab.computers) || 0,
      status: newLab.status,
      nextMaintenance: newLab.nextMaintenance || new Date().toISOString().split('T')[0],
      software: newLab.software || 'N/A',
      hardware: newLab.hardware || 'N/A'
    };
    setLaboratories(prevLabs => [...prevLabs, newLabObj]);
    setShowAddLabModal(false);
    setNewLab({
      name: '',
      location: '',
      capacity: 0,
      computers: 0,
      status: 'operational',
      nextMaintenance: '',
      software: '',
      hardware: ''
    });
    showToast(`Laboratory ${newLabObj.name} added successfully! ✅`);
  };

  // ==================== NETWORK MANAGEMENT FUNCTIONS ====================
  const openEditNetworkModal = (network: any) => {
    setSelectedNetwork(network);
    setNetworkFormData({
      name: network.name,
      ssid: network.ssid,
      speed: network.speed,
      type: network.type,
      routerIp: network.routerIp,
      status: network.status,
      locations: network.locations.join(', '),
      coverage: network.coverage.join(', '),
      connectedDevices: network.connectedDevices,
      lastMaintenance: network.lastMaintenance
    });
    setShowEditNetworkModal(true);
  };

  const updateNetworkConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNetwork) return;
    const updatedNetwork = {
      ...selectedNetwork,
      name: networkFormData.name,
      ssid: networkFormData.ssid,
      speed: networkFormData.speed,
      type: networkFormData.type,
      routerIp: networkFormData.routerIp,
      status: networkFormData.status,
      locations: networkFormData.locations.split(',').map(s => s.trim()),
      coverage: networkFormData.coverage.split(',').map(s => s.trim()),
      connectedDevices: networkFormData.connectedDevices,
      lastMaintenance: networkFormData.lastMaintenance
    };
    setNetworkConnections(networkConnections.map(n => n.id === selectedNetwork.id ? updatedNetwork : n));
    setShowEditNetworkModal(false);
    setSelectedNetwork(null);
    showToast(`${updatedNetwork.name} updated successfully! ✅`);
  };

  const addNetworkConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!networkFormData.name.trim()) {
      showToast('Please enter network name', 'error');
      return;
    }
    const newId = `NW-CONN-${String(networkConnections.length + 1).padStart(3, '0')}`;
    const newNetwork = {
      id: newId,
      name: networkFormData.name,
      ssid: networkFormData.ssid || networkFormData.name,
      speed: networkFormData.speed,
      type: networkFormData.type,
      routerIp: networkFormData.routerIp,
      status: networkFormData.status,
      locations: networkFormData.locations.split(',').map(s => s.trim()),
      coverage: networkFormData.coverage.split(',').map(s => s.trim()),
      connectedDevices: networkFormData.connectedDevices,
      lastMaintenance: networkFormData.lastMaintenance || new Date().toISOString().split('T')[0]
    };
    setNetworkConnections([...networkConnections, newNetwork]);
    setShowAddNetworkModal(false);
    setNetworkFormData({ name: '', ssid: '', speed: '300 Mbps', type: 'Fiber Optic', routerIp: '', status: 'active', locations: '', coverage: '', connectedDevices: 0, lastMaintenance: '' });
    showToast(`${newNetwork.name} added successfully! ✅`);
  };

  const deleteNetworkConnection = (id: string) => {
    const network = networkConnections.find(n => n.id === id);
    if (window.confirm(`Are you sure you want to delete ${network?.name}?`)) {
      setNetworkConnections(networkConnections.filter(n => n.id !== id));
      showToast(`${network?.name} removed! 🗑️`);
    }
  };

  // ==================== SOFTWARE LICENSE FUNCTIONS ====================
  const openEditLicenseModal = (license: any) => {
    setSelectedLicense(license);
    setLicenseFormData({
      name: license.name,
      type: license.type,
      totalLicenses: license.totalLicenses,
      usedLicenses: license.usedLicenses,
      expiryDate: license.expiryDate,
      vendor: license.vendor,
      cost: license.cost,
      status: license.status
    });
    setShowEditLicenseModal(true);
  };

  const updateSoftwareLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;
    const updatedLicense = {
      ...selectedLicense,
      name: licenseFormData.name,
      type: licenseFormData.type,
      totalLicenses: licenseFormData.totalLicenses,
      usedLicenses: licenseFormData.usedLicenses,
      expiryDate: licenseFormData.expiryDate,
      vendor: licenseFormData.vendor,
      cost: licenseFormData.cost,
      status: licenseFormData.status
    };
    setSoftwareLicenses(softwareLicenses.map(l => l.id === selectedLicense.id ? updatedLicense : l));
    setShowEditLicenseModal(false);
    setSelectedLicense(null);
    showToast(`${updatedLicense.name} updated successfully! ✅`);
  };

  const addSoftwareLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFormData.name.trim()) {
      showToast('Please enter license name', 'error');
      return;
    }
    const newId = Math.max(...softwareLicenses.map(l => l.id), 0) + 1;
    const newLicense = {
      id: newId,
      name: licenseFormData.name,
      type: licenseFormData.type,
      totalLicenses: licenseFormData.totalLicenses,
      usedLicenses: licenseFormData.usedLicenses,
      expiryDate: licenseFormData.expiryDate,
      vendor: licenseFormData.vendor,
      cost: licenseFormData.cost,
      status: licenseFormData.status
    };
    setSoftwareLicenses([...softwareLicenses, newLicense]);
    setShowAddLicenseModal(false);
    setLicenseFormData({ name: '', type: 'OS', totalLicenses: 0, usedLicenses: 0, expiryDate: '', vendor: '', cost: 0, status: 'active' });
    showToast(`${newLicense.name} added successfully! ✅`);
  };

  const deleteSoftwareLicense = (id: number) => {
    const license = softwareLicenses.find(l => l.id === id);
    if (window.confirm(`Are you sure you want to delete ${license?.name}?`)) {
      setSoftwareLicenses(softwareLicenses.filter(l => l.id !== id));
      showToast(`${license?.name} removed! 🗑️`);
    }
  };

  // ==================== ASSET MANAGEMENT FUNCTIONS ====================
const handleAddAsset = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newAsset.name.trim()) {
    showToast('Please enter asset name', 'error');
    return;
  }
  
  // Generate ID based on current length + 1
  const newId = `AST-${String(assets.length + 1).padStart(3, '0')}`;
  
  const newAssetObj = {
    id: newId,
    name: newAsset.name.trim(),
    type: newAsset.type,
    serial: newAsset.serialNumber || `AUTO-${Date.now()}`,
    department: newAsset.department,
    status: newAsset.status,
    purchaseDate: newAsset.purchaseDate || new Date().toISOString().split('T')[0],
    warrantyEnd: newAsset.warrantyEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vendor: newAsset.vendor || 'Unknown',
    cost: parseInt(newAsset.cost) || 0,
    assignedTo: newAsset.assignedTo || 'Unassigned',
    location: newAsset.location || 'Main Store',
    invoiceNumber: newAsset.invoiceNumber || `INV-${Date.now()}`,
    quantity: parseInt(newAsset.quantity) || 1
  };
  
  // Update state with new asset
  setAssets(prevAssets => [...prevAssets, newAssetObj]);
  
  // Close modal and reset form
  setShowAddAssetModal(false);
  setNewAsset({ 
    name: '', 
    type: 'Desktop', 
    serialNumber: '', 
    department: 'IT', 
    status: 'active', 
    vendor: '', 
    cost: '', 
    purchaseDate: '', 
    warrantyEnd: '', 
    location: '', 
    assignedTo: '', 
    invoiceNumber: '',
    quantity: '1'
  });
  
  showToast(`Asset ${newAsset.name} added successfully! ✅`);
}; 

  const deleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (window.confirm(`Are you sure you want to delete ${asset?.name}?`)) {
      setAssets(assets.filter(a => a.id !== id));
      showToast(`${asset?.name} removed! 🗑️`);
    }
  };

  const openEditAssetModal = (asset: any) => {
    setEditingAsset(asset);
    setEditAssetFormData({
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serial,
      department: asset.department,
      status: asset.status,
      vendor: asset.vendor || '',
      cost: String(asset.cost),
      purchaseDate: asset.purchaseDate,
      warrantyEnd: asset.warrantyEnd,
      location: asset.location || '',
      assignedTo: asset.assignedTo || '',
      invoiceNumber: asset.invoiceNumber || '',
      quantity: String(asset.quantity || 1)
    });
    setShowEditAssetModal(true);
  };

  const handleUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const updatedAsset = {
      ...editingAsset,
      name: editAssetFormData.name.trim(),
      type: editAssetFormData.type,
      serial: editAssetFormData.serialNumber,
      department: editAssetFormData.department,
      status: editAssetFormData.status,
      vendor: editAssetFormData.vendor,
      cost: parseInt(editAssetFormData.cost) || 0,
      purchaseDate: editAssetFormData.purchaseDate,
      warrantyEnd: editAssetFormData.warrantyEnd,
      location: editAssetFormData.location,
      assignedTo: editAssetFormData.assignedTo,
      invoiceNumber: editAssetFormData.invoiceNumber,
      quantity: parseInt(editAssetFormData.quantity) || 1
    };
    setAssets(assets.map(a => a.id === editingAsset.id ? updatedAsset : a));
    setShowEditAssetModal(false);
    setEditingAsset(null);
    showToast(`Asset ${updatedAsset.name} updated successfully! ✅`);
  };

  // ==================== TICKET FUNCTIONS ====================
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const assignedStaff = assignTicketToStaff(newTicket.category, newTicket.department);
    const assignedToName = assignedStaff ? assignedStaff.name : 'Unassigned';
    
    const newTicketObj = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicket.title,
      category: newTicket.category,
      priority: newTicket.priority,
      dept: newTicket.department,
      status: "pending",
      assignedTo: assignedToName,
      assignedById: assignedStaff?.id || 0,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      description: newTicket.description,
      contactPerson: newTicket.contactPerson || 'Not provided',
      contactEmail: newTicket.contactEmail || 'Not provided',
      contactPhone: newTicket.contactPhone || 'Not provided',
      location: newTicket.location || 'Not specified',
      resolution: null
    };
    setTickets([...tickets, newTicketObj]);
    setShowAddTicketModal(false);
    setNewTicket({ title: '', category: 'Hardware Issues', priority: 'medium', department: 'IT', description: '', contactPerson: '', contactEmail: '', contactPhone: '', location: '' });
    showToast(`Ticket created and assigned to ${assignedToName}! ✅`, 'success');
  };

  const handleResolveTicket = (ticketId: string) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticketId ? { ...t, status: 'resolved', resolvedAt: new Date().toISOString(), resolution: 'Issue resolved successfully' } : t
    );
    setTickets(updatedTickets);
    showToast(`Ticket ${ticketId} resolved successfully! ✅`, 'success');
  };

  const deleteTicket = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (window.confirm(`Are you sure you want to delete ticket ${ticket?.id}?`)) {
      setTickets(tickets.filter(t => t.id !== id));
      showToast(`Ticket ${ticket?.id} deleted! 🗑️`);
    }
  };

  // ==================== PC MANAGEMENT FUNCTIONS ====================
  const handleAddPc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPc.name.trim()) {
      showToast('Please enter PC name', 'error');
      return;
    }
    const newId = `PC-${String(pcs.length + 1).padStart(3, '0')}`;
    const newPcObj = {
      id: newId,
      name: newPc.name.trim(),
      location: newPc.location || 'Unknown',
      status: newPc.status,
      lastChecked: new Date().toISOString().split('T')[0],
      assignedTo: newPc.assignedTo,
      specs: newPc.specs || 'N/A',
      os: newPc.os,
      issue: newPc.issue || '',
      events: []
    };
    setPcs(prevPcs => [...prevPcs, newPcObj]);
    setShowAddPcModal(false);
    setNewPc({
      name: '',
      location: '',
      status: 'working',
      assignedTo: 'Student Use',
      specs: '',
      os: 'Windows 11',
      issue: ''
    });
    showToast(`PC ${newPcObj.name} added successfully! ✅`);
  };

  const handleUpdatePcStatus = (pc: any, newStatus: string, issue?: string) => {
    const eventLog = {
      action: `Status changed from ${pc.status} to ${newStatus}`,
      date: new Date().toLocaleString(),
      user: user?.name || 'Admin'
    };
    const updatedPcs = pcs.map(p => 
      p.id === pc.id 
        ? { ...p, status: newStatus, lastChecked: new Date().toISOString().split('T')[0], issue: issue || p.issue, events: [...(p.events || []), eventLog] }
        : p
    );
    setPcs(updatedPcs);
    showToast(`PC ${pc.name} status updated to ${newStatus}! ✅`, 'success');
  };

  const deletePc = (id: string) => {
    const pc = pcs.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete PC ${pc?.name}?`)) {
      setPcs(pcs.filter(p => p.id !== id));
      showToast(`${pc?.name} removed! 🗑️`);
    }
  };

  const viewPcEvents = (pc: any) => {
    setSelectedPcEvents(pc.events || []);
    setShowEventLogModal(true);
  };

  // ==================== REPORT FUNCTIONS ====================
  const handleExportJSON = (type: string) => {
    let reportData: any = {};
    switch(type) {
      case 'assets': reportData = { assets, generatedAt: new Date().toISOString() }; break;
      case 'tickets': reportData = { tickets, generatedAt: new Date().toISOString() }; break;
      case 'inventory': reportData = { consumables, generatedAt: new Date().toISOString() }; break;
      default: reportData = { assets, tickets, consumables, generatedAt: new Date().toISOString() };
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${type.toUpperCase()} report downloaded! 📊`);
  };

  const handleExportExcel = (type: string) => {
    let worksheet;
    switch(type) {
      case 'assets':
        worksheet = XLSX.utils.json_to_sheet(assets.map(a => ({ ID: a.id, Name: a.name, Type: a.type, Department: a.department, Status: a.status, Cost: a.cost })));
        break;
      case 'tickets':
        worksheet = XLSX.utils.json_to_sheet(tickets.map(t => ({ ID: t.id, Title: t.title, Category: t.category, Priority: t.priority, Status: t.status, AssignedTo: t.assignedTo })));
        break;
      default:
        worksheet = XLSX.utils.json_to_sheet(consumables.map(c => ({ Name: c.name, Type: c.type, 'Current Stock': c.currentStock, 'Min Stock': c.minStock, Status: c.status })));
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type.toUpperCase());
    XLSX.writeFile(workbook, `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(`${type.toUpperCase()} exported as Excel! 📄`);
  };

  const handleExportPDF = (type: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${type.toUpperCase()} Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    
    let tableData: any[][] = [];
    let headers: string[] = [];
    
    switch(type) {
      case 'assets':
        headers = ['ID', 'Name', 'Type', 'Department', 'Status', 'Cost'];
        tableData = assets.map(a => [a.id, a.name, a.type, a.department, a.status, `₹${a.cost}`]);
        break;
      case 'tickets':
        headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To'];
        tableData = tickets.map(t => [t.id, t.title, t.category, t.priority, t.status, t.assignedTo]);
        break;
      default:
        headers = ['Name', 'Type', 'Current Stock', 'Min Stock', 'Status'];
        tableData = consumables.map(c => [c.name, c.type, c.currentStock, c.minStock, c.status]);
    }
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [6, 182, 212] }
    });
    
    doc.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast(`${type.toUpperCase()} exported as PDF! 📑`);
  };

  const handleExportWord = (type: string) => {
    let content = `
      <html>
      <head>
        <title>${type.toUpperCase()} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #06b6d4; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #06b6d4; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${type.toUpperCase()} Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    `;
    
    if (type === 'assets') {
      content += `<table><tr><th>ID</th><th>Name</th><th>Type</th><th>Department</th><th>Status</th><th>Cost</th></tr>`;
      assets.forEach(a => {
        content += `<tr><td>${a.id}</td><td>${a.name}</td><td>${a.type}</td><td>${a.department}</td><td>${a.status}</td><td>₹${a.cost}</td></tr>`;
      });
    } else if (type === 'tickets') {
      content += `<table><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned To</th></tr>`;
      tickets.forEach(t => {
        content += `<tr><td>${t.id}</td><td>${t.title}</td><td>${t.category}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.assignedTo}</td></tr>`;
      });
    } else {
      content += `<table><tr><th>Name</th><th>Type</th><th>Current Stock</th><th>Min Stock</th><th>Status</th></tr>`;
      consumables.forEach(c => {
        content += `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.currentStock}</td><td>${c.minStock}</td><td>${c.status}</td></tr>`;
      });
    }
    
    content += `</table></body></html>`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${type.toUpperCase()} exported as Word! 📝`);
  };

  // Helper Components are now declared outside the Dashboard function to prevent recreation during re-renders.

  // ==================== MENU ITEMS ====================
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FiHome size={20} /> },
    { id: 'assets', name: 'Asset Management', icon: <FiMonitor size={20} /> },
    { id: 'tickets', name: 'Help Desk', icon: <MdConfirmationNumber size={20} /> },
    { id: 'staff', name: 'Staff Management', icon: <FiUsers size={20} /> },
    { id: 'network', name: 'Network Infrastructure', icon: <FiWifi size={20} /> },
    { id: 'pcs', name: 'PC Management', icon: <FiMonitor size={20} /> },
    { id: 'labs', name: 'Laboratories', icon: <MdSchool size={20} /> },
    { id: 'licenses', name: 'Software Licenses', icon: <MdLocalOffer size={20} /> },
    { id: 'consumables', name: 'Inventory', icon: <FiBox size={20} /> },
    { id: 'reports', name: 'Reports', icon: <FiFileText size={20} /> },
  ];

  // ==================== RENDER FUNCTIONS ====================
  
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assets" value={assets.length} icon={<FiMonitor />} color="cyan" trend={12} onClick={() => setActiveMenu('assets')} />
        <StatCard title="Open Tickets" value={tickets.filter(t => t.status !== 'resolved').length} icon={<MdConfirmationNumber />} color="red" trend={-3} onClick={() => setActiveMenu('tickets')} />
        <StatCard title="Active Networks" value={networkConnections.length} icon={<FiWifi />} color="green" trend={0} onClick={() => setActiveMenu('network')} />
        <StatCard title="Not Working PCs" value={pcs.filter(p => p.status === 'not-working').length} icon={<FiAlertCircle />} color="red" trend={5} onClick={() => setActiveMenu('pcs')} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><FiBarChart2 className="text-cyan-400" /> Ticket Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Area type="monotone" dataKey="tickets" stroke="#06b6d4" fill="#06b6d430" name="New Tickets" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b98130" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><FiServer className="text-purple-400" /> Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={assetDistributionData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {assetDistributionData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><FiBarChart2 className="text-cyan-400" /> PC Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="value" name="PC Count">
                {statusDistributionData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><FiTrendingUp className="text-green-400" /> Department Performance</h3>
          <div className="space-y-4">
            {departmentStats.map((dept, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{dept.name}</span><span className="text-slate-400">{dept.health}%</span></div>
                <div className="w-full bg-white/10 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: `${dept.health}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssetManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">IT Asset Management</h2>
        <button onClick={() => setShowAddAssetModal(true)} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add Asset
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Assets (Qty)</p><p className="text-2xl font-bold text-white">{assets.reduce((sum, a) => sum + (a.quantity || 1), 0)}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Active Assets (Qty)</p><p className="text-2xl font-bold text-green-400">{assets.filter(a => a.status === 'active').reduce((sum, a) => sum + (a.quantity || 1), 0)}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Under Maintenance (Qty)</p><p className="text-2xl font-bold text-yellow-400">{assets.filter(a => a.status === 'maintenance').reduce((sum, a) => sum + (a.quantity || 1), 0)}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Value</p><p className="text-2xl font-bold text-purple-400">₹{assets.reduce((s, a) => s + a.cost, 0).toLocaleString()}</p></div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-slate-400 text-sm">
              <th className="pb-3">ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Cost</th>
              <th className="pb-3">Qty</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 text-white text-sm">{asset.id}</td>
                <td className="py-3 text-slate-300 text-sm">{asset.name}</td>
                <td className="py-3 text-slate-300 text-sm">{asset.type}</td>
                <td className="py-3 text-slate-300 text-sm">{asset.department}</td>
                <td className="py-3"><StatusBadge status={asset.status} /></td>
                <td className="py-3 text-slate-300 text-sm">₹{asset.cost.toLocaleString()}</td>
                <td className="py-3 text-slate-300 text-sm">{asset.quantity || 1}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => { setSelectedAsset(asset); setShowAssetDetailsModal(true); }} className="text-cyan-400 hover:text-cyan-300"><FiEye /></button>
                  <button onClick={() => openEditAssetModal(asset)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 /></button>
                  <button onClick={() => deleteAsset(asset.id)} className="text-red-400 hover:text-red-300"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTicketManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Help Desk & Support Tickets</h2>
        <button onClick={() => setShowAddTicketModal(true)} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> New Ticket
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Tickets</p><p className="text-2xl font-bold text-white">{tickets.length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Open Tickets</p><p className="text-2xl font-bold text-red-400">{tickets.filter(t => t.status !== 'resolved').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Resolved</p><p className="text-2xl font-bold text-green-400">{tickets.filter(t => t.status === 'resolved').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Resolution Rate</p><p className="text-2xl font-bold text-blue-400">{Math.round(tickets.filter(t => t.status === 'resolved').length / tickets.length * 100)}%</p></div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-slate-400 text-sm">
              <th className="pb-3">ID</th>
              <th className="pb-3">Title</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Priority</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Assigned To</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 text-white text-sm">{ticket.id}</td>
                <td className="py-3 text-slate-300 text-sm">{ticket.title}</td>
                <td className="py-3 text-slate-300 text-sm">{ticket.category}</td>
                <td className="py-3"><PriorityBadge priority={ticket.priority} /></td>
                <td className="py-3"><StatusBadge status={ticket.status} /></td>
                <td className="py-3 text-slate-300 text-sm">{ticket.assignedTo}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => { setSelectedTicket(ticket); setShowTicketDetailsModal(true); }} className="text-cyan-400 hover:text-cyan-300"><FiEye /></button>
                  {ticket.status !== 'resolved' && <button onClick={() => handleResolveTicket(ticket.id)} className="text-green-400 hover:text-green-300"><FiCheckCircle /></button>}
                  <button onClick={() => deleteTicket(ticket.id)} className="text-red-400 hover:text-red-300"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Staff Management</h2>
        <button onClick={() => { setStaffFormData({ name: '', role: '', department: '', email: '', phone: '', status: 'available', expertise: [] }); setShowAddStaffModal(true); }} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiUserPlus /> Add Staff
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffMembers.map(staff => (
          <div key={staff.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xl text-white">{staff.name.charAt(0)}</div>
                <div><h3 className="text-white font-semibold">{staff.name}</h3><p className="text-slate-400 text-sm">{staff.role}</p></div>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={staff.status} />
                <button onClick={() => openEditStaffModal(staff)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
                <button onClick={() => deleteStaffMember(staff.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-4"><p className="text-slate-400 text-xs mb-2">Expertise:</p><div className="flex flex-wrap gap-2">{staff.expertise.map((exp, i) => (<span key={i} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs">{exp}</span>))}</div></div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between"><span className="text-slate-400 text-sm">Tickets: <span className="text-white">{staff.ticketsAssigned}</span></span><span className="text-slate-400 text-sm">{staff.email}</span></div>
            <div className="mt-2 text-slate-400 text-sm flex items-center gap-2"><FiPhone size={12} /> {staff.phone}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNetworkInfrastructure = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Network Infrastructure</h2>
        <button onClick={() => { setNetworkFormData({ name: '', ssid: '', speed: '300 Mbps', type: 'Fiber Optic', routerIp: '', status: 'active', locations: '', coverage: '', connectedDevices: 0, lastMaintenance: '' }); setShowAddNetworkModal(true); }} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add Network
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {networkConnections.map(conn => (
          <div key={conn.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">{conn.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MdSpeed className="text-cyan-400" size={16} />
                  <span className="text-cyan-400 text-sm font-medium">{conn.speed}</span>
                  <StatusBadge status={conn.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditNetworkModal(conn)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
                <button onClick={() => deleteNetworkConnection(conn.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-slate-400 text-xs mb-2">📍 Locations Covered</p><div className="flex flex-wrap gap-1">{conn.locations.slice(0, 3).map((loc, i) => (<span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300">{loc}</span>))}</div></div>
              <div><p className="text-slate-400 text-xs mb-2">🎯 Coverage Areas</p><div className="flex flex-wrap gap-1">{conn.coverage.slice(0, 3).map((cov, i) => (<span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300">{cov}</span>))}</div></div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between">
              <div><span className="text-slate-400 text-xs">Connected Devices</span><p className="text-white text-sm">{conn.connectedDevices}</p></div>
              <div><span className="text-slate-400 text-xs">Router IP</span><p className="text-white text-sm font-mono">{conn.routerIp}</p></div>
              <div><span className="text-slate-400 text-xs">Last Maintenance</span><p className="text-white text-sm">{conn.lastMaintenance}</p></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Network Devices</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10"><tr className="text-left text-slate-400 text-sm"><th className="pb-3">Device</th><th className="pb-3">IP Address</th><th className="pb-3">Status</th></tr></thead>
            <tbody>
              {networkDevices.map(device => (<tr key={device.id} className="border-b border-white/5"><td className="py-3 text-white text-sm">{device.name}</td><td className="py-3 text-slate-300 text-sm font-mono">{device.ipAddress}</td><td className="py-3"><StatusBadge status={device.status} /></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPCManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">PC Management</h2>
        <button onClick={() => setShowAddPcModal(true)} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add PC
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total PCs</p><p className="text-2xl font-bold text-white">{pcs.length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Working</p><p className="text-2xl font-bold text-green-400">{pcs.filter(p => p.status === 'working').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Not Working</p><p className="text-2xl font-bold text-red-400">{pcs.filter(p => p.status === 'not-working').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Maintenance</p><p className="text-2xl font-bold text-yellow-400">{pcs.filter(p => p.status === 'maintenance').length}</p></div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-slate-400 text-sm">
              <th className="pb-3">PC Name</th>
              <th className="pb-3">Location</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Issue</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pcs.map(pc => (
              <tr key={pc.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 text-slate-300 text-sm">{pc.name}</td>
                <td className="py-3 text-slate-300 text-sm">{pc.location}</td>
                <td className="py-3"><StatusBadge status={pc.status} /></td>
                <td className="py-3 text-slate-300 text-sm">{pc.issue || '-'}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => { setEditingPc(pc); setShowEditPcModal(true); }} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
                  <button onClick={() => viewPcEvents(pc)} className="text-blue-400 hover:text-blue-300"><FiFolder size={16} /></button>
                  <button onClick={() => deletePc(pc.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLaboratories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Computer Laboratories</h2>
        <button onClick={() => setShowAddLabModal(true)} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add Lab
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {laboratories.map(lab => (
          <div key={lab.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-white">{lab.name}</h3>
              <button onClick={() => openEditLabModal(lab)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
            </div>
            <p className="text-slate-400 text-sm mt-1"><FiMapPin className="inline mr-1" size={14} /> {lab.location}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><p className="text-slate-400 text-xs">Capacity</p><p className="text-white">{lab.capacity} seats</p></div>
              <div><p className="text-slate-400 text-xs">Computers</p><p className="text-white">{lab.computers} units</p></div>
              <div><p className="text-slate-400 text-xs">Status</p><StatusBadge status={lab.status} /></div>
              <div><p className="text-slate-400 text-xs">Next Maintenance</p><p className="text-white text-sm">{lab.nextMaintenance}</p></div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10"><p className="text-slate-400 text-xs">Software</p><p className="text-white text-sm">{lab.software}</p></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLicenses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Software License Management</h2>
        <button onClick={() => { setLicenseFormData({ name: '', type: 'OS', totalLicenses: 0, usedLicenses: 0, expiryDate: '', vendor: '', cost: 0, status: 'active' }); setShowAddLicenseModal(true); }} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add License
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Licenses</p><p className="text-2xl font-bold text-white">{softwareLicenses.length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Expiring Soon</p><p className="text-2xl font-bold text-red-400">{softwareLicenses.filter(l => l.status === 'expiring').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Cost</p><p className="text-2xl font-bold text-green-400">₹{softwareLicenses.reduce((s, l) => s + l.cost, 0).toLocaleString()}</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-slate-400 text-sm">
              <th className="pb-3">License Name</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Total/Used</th>
              <th className="pb-3">Expiry Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {softwareLicenses.map(license => {
              const daysLeft = Math.ceil((new Date(license.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <tr key={license.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 text-white">{license.name}</td>
                  <td className="py-3 text-slate-300">{license.type}</td>
                  <td className="py-3 text-slate-300">{license.usedLicenses}/{license.totalLicenses}</td>
                  <td className="py-3 text-slate-300">{license.expiryDate} ({daysLeft} days left)</td>
                  <td className="py-3">{license.status === 'expiring' ? <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Expiring</span> : <StatusBadge status="active" />}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => openEditLicenseModal(license)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
                    <button onClick={() => deleteSoftwareLicense(license.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConsumables = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Inventory & Consumables</h2>
        <button onClick={() => { setInventoryFormData({ name: '', type: 'Cartridge', currentStock: 0, minStock: 0, unit: 'pcs' }); setShowAddInventoryModal(true); }} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2">
          <FiPlus /> Add Item
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Items</p><p className="text-2xl font-bold text-white">{consumables.length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Low Stock Items</p><p className="text-2xl font-bold text-red-400">{consumables.filter(c => c.status === 'low').length}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-slate-400 text-sm">Total Units</p><p className="text-2xl font-bold text-green-400">{consumables.reduce((sum, c) => sum + c.currentStock, 0)}</p></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiBox /> Current Stock</h3>
          <div className="space-y-3">
            {consumables.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div><p className="text-white">{item.name}</p><p className="text-slate-500 text-xs">{item.type}</p></div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-medium ${item.currentStock <= item.minStock ? 'text-red-400' : 'text-green-400'}`}>{item.currentStock} {item.unit}</p>
                  <button onClick={() => openEditInventoryModal(item)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button>
                  <button onClick={() => deleteInventoryItem(item.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiAlertCircle className="text-red-400" /> Low Stock Alerts</h3>
          <div className="space-y-3">
            {consumables.filter(c => c.status === 'low').map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div><span className="text-white">{item.name}</span><p className="text-slate-400 text-xs">Min Stock: {item.minStock} {item.unit}</p></div>
                <div className="flex items-center gap-3"><span className="text-red-400 text-sm font-medium">Stock: {item.currentStock} {item.unit}</span><button onClick={() => openEditInventoryModal(item)} className="text-cyan-400 hover:text-cyan-300"><FiEdit2 size={16} /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiRefreshCw /> Quick Stock Update</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consumables.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateInventoryStock(item, Math.max(0, item.currentStock - 1))} className="p-1 bg-red-500/20 rounded text-red-400 hover:bg-red-500/30"><FiMinus size={14} /></button>
                <span className="text-white text-sm w-8 text-center">{item.currentStock}</span>
                <button onClick={() => updateInventoryStock(item, item.currentStock + 1)} className="p-1 bg-green-500/20 rounded text-green-400 hover:bg-green-500/30"><FiPlusIcon size={14} /></button>
                <button onClick={() => openEditInventoryModal(item)} className="p-1 bg-cyan-500/20 rounded text-cyan-400 hover:bg-cyan-500/30"><FiEdit2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Asset Distribution Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={assetDistributionData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {assetDistributionData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Ticket Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Area type="monotone" dataKey="tickets" stroke="#06b6d4" fill="#06b6d430" name="New Tickets" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b98130" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Asset Reports</h3>
          <button onClick={() => handleExportJSON('assets')} className="w-full mb-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">📊 Export JSON</button>
          <button onClick={() => handleExportExcel('assets')} className="w-full mb-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">📄 Export Excel</button>
          <button onClick={() => handleExportPDF('assets')} className="w-full mb-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">📑 Export PDF</button>
          <button onClick={() => handleExportWord('assets')} className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">📝 Export Word</button>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Ticket Reports</h3>
          <button onClick={() => handleExportJSON('tickets')} className="w-full mb-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">📊 Export JSON</button>
          <button onClick={() => handleExportExcel('tickets')} className="w-full mb-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">📄 Export Excel</button>
          <button onClick={() => handleExportPDF('tickets')} className="w-full mb-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">📑 Export PDF</button>
          <button onClick={() => handleExportWord('tickets')} className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">📝 Export Word</button>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Inventory Reports</h3>
          <button onClick={() => handleExportJSON('inventory')} className="w-full mb-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">📊 Export JSON</button>
          <button onClick={() => handleExportExcel('inventory')} className="w-full mb-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">📄 Export Excel</button>
          <button onClick={() => handleExportPDF('inventory')} className="w-full mb-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">📑 Export PDF</button>
          <button onClick={() => handleExportWord('inventory')} className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">📝 Export Word</button>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER CONTENT ====================
  const renderContent = () => {
    switch(activeMenu) {
      case 'assets': return renderAssetManagement();
      case 'tickets': return renderTicketManagement();
      case 'staff': return renderStaffManagement();
      case 'network': return renderNetworkInfrastructure();
      case 'pcs': return renderPCManagement();
      case 'labs': return renderLaboratories();
      case 'licenses': return renderLicenses();
      case 'consumables': return renderConsumables();
      case 'reports': return renderReports();
      default: return renderDashboard();
    }
  };

  // ==================== MODAL COMPONENTS ====================
const renderAddAssetModal = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddAssetModal(false)}>
    <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
        <h2 className="text-2xl font-bold text-white">Add New Asset</h2>
        <button type="button" onClick={() => setShowAddAssetModal(false)} className="hover:text-white transition-colors">
          <FiX className="text-slate-400 text-xl" />
        </button>
      </div>
      
      <form onSubmit={handleAddAsset} className="p-6 space-y-4">
        {/* Asset Name */}
        <div>
          <label className="block text-slate-300 mb-2">Asset Name *</label>
          <input 
            type="text" 
            name="name"
            required 
            value={newAsset.name} 
            onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter asset name"
          />
        </div>
        
        {/* Type and Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Type</label>
            <input 
              type="text" 
              name="type"
              value={newAsset.type} 
              onChange={(e) => setNewAsset({...newAsset, type: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter type"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Department</label>
            <input 
              type="text" 
              name="department"
              value={newAsset.department} 
              onChange={(e) => setNewAsset({...newAsset, department: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="Enter department"
            />
          </div>
        </div>

        {/* Serial Number */}
        <div>
          <label className="block text-slate-300 mb-2">Serial Number</label>
          <input 
            type="text" 
            name="serialNumber"
            value={newAsset.serialNumber} 
            onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter serial number"
          />
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-slate-300 mb-2">Vendor</label>
          <input 
            type="text" 
            name="vendor"
            value={newAsset.vendor} 
            onChange={(e) => setNewAsset({...newAsset, vendor: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter vendor name"
          />
        </div>

        {/* Cost */}
        <div>
          <label className="block text-slate-300 mb-2">Cost (₹)</label>
          <input 
            type="number" 
            name="cost"
            value={newAsset.cost} 
            onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter cost"
            min="0"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Purchase Date</label>
            <input 
              type="date" 
              name="purchaseDate"
              value={newAsset.purchaseDate} 
              onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Warranty End Date</label>
            <input 
              type="date" 
              name="warrantyEnd"
              value={newAsset.warrantyEnd} 
              onChange={(e) => setNewAsset({...newAsset, warrantyEnd: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-slate-300 mb-2">Assigned To</label>
          <input 
            type="text" 
            name="assignedTo"
            value={newAsset.assignedTo} 
            onChange={(e) => setNewAsset({...newAsset, assignedTo: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter assigned person"
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-slate-300 mb-2">Invoice Number</label>
          <input 
            type="text" 
            name="invoiceNumber"
            value={newAsset.invoiceNumber} 
            onChange={(e) => setNewAsset({...newAsset, invoiceNumber: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter invoice number"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-slate-300 mb-2">Quantity *</label>
          <input 
            type="number" 
            name="quantity"
            required
            min="1"
            value={newAsset.quantity} 
            onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            placeholder="Enter quantity"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-slate-300 mb-2">Status</label>
          <select 
            name="status"
            value={newAsset.status} 
            onChange={(e) => setNewAsset({...newAsset, status: e.target.value})} 
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => {
              setShowAddAssetModal(false);
              setNewAsset({
                name: '', type: 'Desktop', serialNumber: '', department: 'IT', 
                status: 'active', vendor: '', cost: '', purchaseDate: '', 
                warrantyEnd: '', location: '', assignedTo: '', invoiceNumber: ''
              });
            }} 
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
);  const renderAddTicketModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddTicketModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Create Support Ticket</h2><button onClick={() => setShowAddTicketModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={handleAddTicket} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Title *</label><input type="text" required value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Enter ticket title" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Category</label><select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>Hardware Issues</option><option>Printer Issues</option><option>Internet Issues</option><option>Software Issues</option><option>Projector Issues</option></select></div><div><label className="block text-slate-300 mb-2">Priority</label><select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></div></div>
          <div><label className="block text-slate-300 mb-2">Description *</label><textarea required value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} rows={3} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Describe the issue" /></div>
          <div><label className="block text-slate-300 mb-2">Location</label><input type="text" value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., Room 201, IT Block" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddTicketModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Create Ticket</button></div>
        </form>
      </div>
    </div>
  );

  const renderAddStaffModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddStaffModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Add Staff Member</h2><button onClick={() => setShowAddStaffModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={addStaffMember} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Name *</label><input type="text" required value={staffFormData.name} onChange={e => setStaffFormData({...staffFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Role</label><input type="text" required value={staffFormData.role} onChange={e => setStaffFormData({...staffFormData, role: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Department</label><input type="text" required value={staffFormData.department} onChange={e => setStaffFormData({...staffFormData, department: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Email</label><input type="email" required value={staffFormData.email} onChange={e => setStaffFormData({...staffFormData, email: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Phone</label><input type="tel" required value={staffFormData.phone} onChange={e => setStaffFormData({...staffFormData, phone: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={staffFormData.status} onChange={e => setStaffFormData({...staffFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>available</option><option>busy</option></select></div>
          <div><label className="block text-slate-300 mb-2">Expertise (comma separated)</label><input type="text" value={staffFormData.expertise.join(', ')} onChange={e => setStaffFormData({...staffFormData, expertise: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., Hardware Issues, Network Issues" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddStaffModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add Staff</button></div>
        </form>
      </div>
    </div>
  );

  const renderEditStaffModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditStaffModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Edit Staff Member</h2><button onClick={() => setShowEditStaffModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={updateStaffMember} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Name</label><input type="text" required value={staffFormData.name} onChange={e => setStaffFormData({...staffFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Role</label><input type="text" required value={staffFormData.role} onChange={e => setStaffFormData({...staffFormData, role: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Department</label><input type="text" required value={staffFormData.department} onChange={e => setStaffFormData({...staffFormData, department: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Email</label><input type="email" required value={staffFormData.email} onChange={e => setStaffFormData({...staffFormData, email: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Phone</label><input type="tel" required value={staffFormData.phone} onChange={e => setStaffFormData({...staffFormData, phone: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={staffFormData.status} onChange={e => setStaffFormData({...staffFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>available</option><option>busy</option></select></div>
          <div><label className="block text-slate-300 mb-2">Expertise (comma separated)</label><input type="text" value={staffFormData.expertise.join(', ')} onChange={e => setStaffFormData({...staffFormData, expertise: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditStaffModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
        </form>
      </div>
    </div>
  );

  const renderAddNetworkModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddNetworkModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Add Network Connection</h2><button onClick={() => setShowAddNetworkModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={addNetworkConnection} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Network Name *</label><input type="text" required value={networkFormData.name} onChange={e => setNetworkFormData({...networkFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">SSID</label><input type="text" value={networkFormData.ssid} onChange={e => setNetworkFormData({...networkFormData, ssid: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Speed</label><select value={networkFormData.speed} onChange={e => setNetworkFormData({...networkFormData, speed: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>300 Mbps</option><option>500 Mbps</option><option>1 Gbps</option></select></div><div><label className="block text-slate-300 mb-2">Type</label><select value={networkFormData.type} onChange={e => setNetworkFormData({...networkFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>Fiber Optic</option><option>Wireless</option><option>Ethernet</option></select></div></div>
          <div><label className="block text-slate-300 mb-2">Router IP</label><input type="text" value={networkFormData.routerIp} onChange={e => setNetworkFormData({...networkFormData, routerIp: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., 10.10.1.1" /></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={networkFormData.status} onChange={e => setNetworkFormData({...networkFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>active</option><option>maintenance</option><option>inactive</option></select></div>
          <div><label className="block text-slate-300 mb-2">Locations (comma separated)</label><input type="text" value={networkFormData.locations} onChange={e => setNetworkFormData({...networkFormData, locations: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., Lab A, Lab B" /></div>
          <div><label className="block text-slate-300 mb-2">Coverage (comma separated)</label><input type="text" value={networkFormData.coverage} onChange={e => setNetworkFormData({...networkFormData, coverage: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., CS Dept, IT Dept" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Connected Devices</label><input type="number" value={networkFormData.connectedDevices} onChange={e => setNetworkFormData({...networkFormData, connectedDevices: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Last Maintenance</label><input type="date" value={networkFormData.lastMaintenance} onChange={e => setNetworkFormData({...networkFormData, lastMaintenance: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddNetworkModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add Network</button></div>
        </form>
      </div>
    </div>
  );

  const renderEditNetworkModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditNetworkModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Edit Network Connection</h2><button onClick={() => setShowEditNetworkModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={updateNetworkConnection} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Network Name</label><input type="text" required value={networkFormData.name} onChange={e => setNetworkFormData({...networkFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">SSID</label><input type="text" value={networkFormData.ssid} onChange={e => setNetworkFormData({...networkFormData, ssid: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Speed</label><select value={networkFormData.speed} onChange={e => setNetworkFormData({...networkFormData, speed: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>300 Mbps</option><option>500 Mbps</option><option>1 Gbps</option></select></div><div><label className="block text-slate-300 mb-2">Type</label><select value={networkFormData.type} onChange={e => setNetworkFormData({...networkFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>Fiber Optic</option><option>Wireless</option><option>Ethernet</option></select></div></div>
          <div><label className="block text-slate-300 mb-2">Router IP</label><input type="text" value={networkFormData.routerIp} onChange={e => setNetworkFormData({...networkFormData, routerIp: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={networkFormData.status} onChange={e => setNetworkFormData({...networkFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>active</option><option>maintenance</option><option>inactive</option></select></div>
          <div><label className="block text-slate-300 mb-2">Locations (comma separated)</label><input type="text" value={networkFormData.locations} onChange={e => setNetworkFormData({...networkFormData, locations: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Coverage (comma separated)</label><input type="text" value={networkFormData.coverage} onChange={e => setNetworkFormData({...networkFormData, coverage: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Connected Devices</label><input type="number" value={networkFormData.connectedDevices} onChange={e => setNetworkFormData({...networkFormData, connectedDevices: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Last Maintenance</label><input type="date" value={networkFormData.lastMaintenance} onChange={e => setNetworkFormData({...networkFormData, lastMaintenance: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditNetworkModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
        </form>
      </div>
    </div>
  );

  const renderAddLicenseModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddLicenseModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Add Software License</h2><button onClick={() => setShowAddLicenseModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={addSoftwareLicense} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">License Name *</label><input type="text" required value={licenseFormData.name} onChange={e => setLicenseFormData({...licenseFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Type</label><select value={licenseFormData.type} onChange={e => setLicenseFormData({...licenseFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>OS</option><option>Office Suite</option><option>Security</option><option>Development</option></select></div><div><label className="block text-slate-300 mb-2">Vendor</label><input type="text" value={licenseFormData.vendor} onChange={e => setLicenseFormData({...licenseFormData, vendor: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Total Licenses</label><input type="number" value={licenseFormData.totalLicenses} onChange={e => setLicenseFormData({...licenseFormData, totalLicenses: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Used Licenses</label><input type="number" value={licenseFormData.usedLicenses} onChange={e => setLicenseFormData({...licenseFormData, usedLicenses: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Expiry Date</label><input type="date" value={licenseFormData.expiryDate} onChange={e => setLicenseFormData({...licenseFormData, expiryDate: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Cost (₹)</label><input type="number" value={licenseFormData.cost} onChange={e => setLicenseFormData({...licenseFormData, cost: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={licenseFormData.status} onChange={e => setLicenseFormData({...licenseFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>active</option><option>expiring</option><option>expired</option></select></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddLicenseModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add License</button></div>
        </form>
      </div>
    </div>
  );

  const renderEditLicenseModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditLicenseModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Edit Software License</h2><button onClick={() => setShowEditLicenseModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={updateSoftwareLicense} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">License Name</label><input type="text" required value={licenseFormData.name} onChange={e => setLicenseFormData({...licenseFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Type</label><select value={licenseFormData.type} onChange={e => setLicenseFormData({...licenseFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>OS</option><option>Office Suite</option><option>Security</option><option>Development</option></select></div><div><label className="block text-slate-300 mb-2">Vendor</label><input type="text" value={licenseFormData.vendor} onChange={e => setLicenseFormData({...licenseFormData, vendor: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Total Licenses</label><input type="number" value={licenseFormData.totalLicenses} onChange={e => setLicenseFormData({...licenseFormData, totalLicenses: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Used Licenses</label><input type="number" value={licenseFormData.usedLicenses} onChange={e => setLicenseFormData({...licenseFormData, usedLicenses: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Expiry Date</label><input type="date" value={licenseFormData.expiryDate} onChange={e => setLicenseFormData({...licenseFormData, expiryDate: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Cost (₹)</label><input type="number" value={licenseFormData.cost} onChange={e => setLicenseFormData({...licenseFormData, cost: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div><label className="block text-slate-300 mb-2">Status</label><select value={licenseFormData.status} onChange={e => setLicenseFormData({...licenseFormData, status: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>active</option><option>expiring</option><option>expired</option></select></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditLicenseModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
        </form>
      </div>
    </div>
  );

  const renderAddInventoryModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddInventoryModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Add Inventory Item</h2><button onClick={() => setShowAddInventoryModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={addInventoryItem} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Item Name *</label><input type="text" required value={inventoryFormData.name} onChange={e => setInventoryFormData({...inventoryFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Type</label><select value={inventoryFormData.type} onChange={e => setInventoryFormData({...inventoryFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>Cartridge</option><option>Peripheral</option><option>Cable</option><option>Consumable</option><option>Other</option></select></div><div><label className="block text-slate-300 mb-2">Unit</label><select value={inventoryFormData.unit} onChange={e => setInventoryFormData({...inventoryFormData, unit: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>pcs</option><option>kg</option><option>liters</option><option>boxes</option></select></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Current Stock</label><input type="number" value={inventoryFormData.currentStock} onChange={e => setInventoryFormData({...inventoryFormData, currentStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Min Stock Level</label><input type="number" value={inventoryFormData.minStock} onChange={e => setInventoryFormData({...inventoryFormData, minStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddInventoryModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Add Item</button></div>
        </form>
      </div>
    </div>
  );

  const renderEditInventoryModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditInventoryModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Edit Inventory Item</h2><button onClick={() => setShowEditInventoryModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={updateInventoryItem} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Item Name</label><input type="text" required value={inventoryFormData.name} onChange={e => setInventoryFormData({...inventoryFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Type</label><select value={inventoryFormData.type} onChange={e => setInventoryFormData({...inventoryFormData, type: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>Cartridge</option><option>Peripheral</option><option>Cable</option><option>Consumable</option><option>Other</option></select></div><div><label className="block text-slate-300 mb-2">Unit</label><select value={inventoryFormData.unit} onChange={e => setInventoryFormData({...inventoryFormData, unit: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"><option>pcs</option><option>kg</option><option>liters</option><option>boxes</option></select></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Current Stock</label><input type="number" value={inventoryFormData.currentStock} onChange={e => setInventoryFormData({...inventoryFormData, currentStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Min Stock Level</label><input type="number" value={inventoryFormData.minStock} onChange={e => setInventoryFormData({...inventoryFormData, minStock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditInventoryModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
        </form>
      </div>
    </div>
  );

  const renderEditLabModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditLabModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Edit Laboratory</h2><button onClick={() => setShowEditLabModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <form onSubmit={updateLaboratory} className="p-6 space-y-4">
          <div><label className="block text-slate-300 mb-2">Lab Name</label><input type="text" required value={labFormData.name} onChange={e => setLabFormData({...labFormData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Location</label><input type="text" required value={labFormData.location} onChange={e => setLabFormData({...labFormData, location: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-300 mb-2">Capacity</label><input type="number" value={labFormData.capacity} onChange={e => setLabFormData({...labFormData, capacity: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div><div><label className="block text-slate-300 mb-2">Computers</label><input type="number" value={labFormData.computers} onChange={e => setLabFormData({...labFormData, computers: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div></div>
          <div><label className="block text-slate-300 mb-2">Software</label><textarea value={labFormData.software} onChange={e => setLabFormData({...labFormData, software: e.target.value})} rows={2} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div><label className="block text-slate-300 mb-2">Hardware</label><textarea value={labFormData.hardware} onChange={e => setLabFormData({...labFormData, hardware: e.target.value})} rows={2} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditLabModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
        </form>
      </div>
    </div>
  );

  const renderAddPcModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddPcModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Add New PC</h2>
          <button type="button" onClick={() => setShowAddPcModal(false)} className="hover:text-white transition-colors">
            <FiX className="text-slate-400 text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleAddPc} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">PC Name *</label>
            <input 
              type="text" 
              required 
              value={newPc.name} 
              onChange={(e) => setNewPc({...newPc, name: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Lab A - PC4"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Location</label>
            <input 
              type="text" 
              value={newPc.location} 
              onChange={(e) => setNewPc({...newPc, location: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Computer Lab A"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Specifications</label>
            <input 
              type="text" 
              value={newPc.specs} 
              onChange={(e) => setNewPc({...newPc, specs: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Intel i5, 8GB RAM, 256GB SSD"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Operating System</label>
            <input 
              type="text" 
              value={newPc.os} 
              onChange={(e) => setNewPc({...newPc, os: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Windows 11"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Assigned To</label>
            <input 
              type="text" 
              value={newPc.assignedTo} 
              onChange={(e) => setNewPc({...newPc, assignedTo: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select 
              value={newPc.status} 
              onChange={(e) => setNewPc({...newPc, status: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="working">Working</option>
              <option value="not-working">Not Working</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          {newPc.status !== 'working' && (
            <div>
              <label className="block text-slate-300 mb-2">Issue Description</label>
              <textarea 
                value={newPc.issue} 
                onChange={(e) => setNewPc({...newPc, issue: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="Describe the issue..."
                rows={2}
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => {
                setShowAddPcModal(false);
                setNewPc({
                  name: '', location: '', status: 'working',
                  assignedTo: 'Student Use', specs: '', os: 'Windows 11', issue: ''
                });
              }} 
              className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition-all"
            >
              Add PC
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEditPcModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditPcModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Update PC Status</h2><button onClick={() => setShowEditPcModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        {editingPc && (
          <div className="p-6 space-y-4">
            <div><p className="text-slate-400">PC Name</p><p className="text-white font-semibold">{editingPc.name}</p></div>
            <div><p className="text-slate-400">Location</p><p className="text-white">{editingPc.location}</p></div>
            <div><label className="block text-slate-300 mb-2">Update Status</label><select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" value={editingPc.status} onChange={(e) => setEditingPc({...editingPc, status: e.target.value})}><option value="working">Working</option><option value="not-working">Not Working</option><option value="maintenance">Maintenance</option></select></div>
            {(editingPc.status === 'not-working' || editingPc.status === 'maintenance') && (<div><label className="block text-slate-300 mb-2">Issue Description</label><textarea className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" rows={2} placeholder="Describe the issue..." value={editingPc.issue || ''} onChange={(e) => setEditingPc({...editingPc, issue: e.target.value})} /></div>)}
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowEditPcModal(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-lg">Cancel</button><button type="button" onClick={() => { handleUpdatePcStatus(editingPc, editingPc.status, editingPc.issue); setShowEditPcModal(false); }} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg">Save Changes</button></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssetDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAssetDetailsModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Asset Details</h2><button onClick={() => setShowAssetDetailsModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        {selectedAsset && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-slate-400">ID</p><p className="text-white">{selectedAsset.id}</p></div>
              <div><p className="text-slate-400">Name</p><p className="text-white">{selectedAsset.name}</p></div>
              <div><p className="text-slate-400">Type</p><p className="text-white">{selectedAsset.type}</p></div>
              <div><p className="text-slate-400">Department</p><p className="text-white">{selectedAsset.department}</p></div>
              <div><p className="text-slate-400">Status</p><StatusBadge status={selectedAsset.status} /></div>
              <div><p className="text-slate-400">Cost</p><p className="text-white">₹{selectedAsset.cost.toLocaleString()}</p></div>
              <div><p className="text-slate-400">Purchase Date</p><p className="text-white">{selectedAsset.purchaseDate}</p></div>
              <div><p className="text-slate-400">Warranty End</p><p className="text-white">{selectedAsset.warrantyEnd}</p></div>
              <div><p className="text-slate-400">Vendor</p><p className="text-white">{selectedAsset.vendor || 'N/A'}</p></div>
              <div><p className="text-slate-400">Invoice Number</p><p className="text-white">{selectedAsset.invoiceNumber || 'N/A'}</p></div>
              <div><p className="text-slate-400">Quantity</p><p className="text-white">{selectedAsset.quantity || 1}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditAssetModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditAssetModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Edit Asset</h2>
          <button type="button" onClick={() => setShowEditAssetModal(false)} className="hover:text-white transition-colors">
            <FiX className="text-slate-400 text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleUpdateAsset} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Asset Name *</label>
            <input 
              type="text" 
              required 
              value={editAssetFormData.name} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, name: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Type</label>
              <input 
                type="text" 
                value={editAssetFormData.type} 
                onChange={(e) => setEditAssetFormData({...editAssetFormData, type: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="Enter type"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Department</label>
              <input 
                type="text" 
                value={editAssetFormData.department} 
                onChange={(e) => setEditAssetFormData({...editAssetFormData, department: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="Enter department"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Serial Number</label>
            <input 
              type="text" 
              value={editAssetFormData.serialNumber} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, serialNumber: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Vendor</label>
            <input 
              type="text" 
              value={editAssetFormData.vendor} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, vendor: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Cost (₹)</label>
            <input 
              type="number" 
              value={editAssetFormData.cost} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, cost: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Purchase Date</label>
              <input 
                type="date" 
                value={editAssetFormData.purchaseDate} 
                onChange={(e) => setEditAssetFormData({...editAssetFormData, purchaseDate: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Warranty End Date</label>
              <input 
                type="date" 
                value={editAssetFormData.warrantyEnd} 
                onChange={(e) => setEditAssetFormData({...editAssetFormData, warrantyEnd: e.target.value})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Assigned To</label>
            <input 
              type="text" 
              value={editAssetFormData.assignedTo} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, assignedTo: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Invoice Number</label>
            <input 
              type="text" 
              value={editAssetFormData.invoiceNumber} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, invoiceNumber: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Quantity *</label>
            <input 
              type="number" 
              required
              min="1"
              value={editAssetFormData.quantity} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, quantity: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select 
              value={editAssetFormData.status} 
              onChange={(e) => setEditAssetFormData({...editAssetFormData, status: e.target.value})} 
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
              onClick={() => setShowEditAssetModal(false)} 
              className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAddLabModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddLabModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Add New Laboratory</h2>
          <button type="button" onClick={() => setShowAddLabModal(false)} className="hover:text-white transition-colors">
            <FiX className="text-slate-400 text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleAddLab} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Lab Name *</label>
            <input 
              type="text" 
              required 
              value={newLab.name} 
              onChange={(e) => setNewLab({...newLab, name: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Computer Lab 206"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Location</label>
            <input 
              type="text" 
              value={newLab.location} 
              onChange={(e) => setNewLab({...newLab, location: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., 2nd Floor"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2">Capacity</label>
              <input 
                type="number" 
                value={newLab.capacity || ''} 
                onChange={(e) => setNewLab({...newLab, capacity: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="e.g., 35"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Computers</label>
              <input 
                type="number" 
                value={newLab.computers || ''} 
                onChange={(e) => setNewLab({...newLab, computers: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                placeholder="e.g., 35"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Software</label>
            <textarea 
              value={newLab.software} 
              onChange={(e) => setNewLab({...newLab, software: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., VS Code, Node.js"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Hardware</label>
            <textarea 
              value={newLab.hardware} 
              onChange={(e) => setNewLab({...newLab, hardware: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
              placeholder="e.g., Intel i5, 8GB RAM"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Next Maintenance</label>
            <input 
              type="date" 
              value={newLab.nextMaintenance} 
              onChange={(e) => setNewLab({...newLab, nextMaintenance: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select 
              value={newLab.status} 
              onChange={(e) => setNewLab({...newLab, status: e.target.value})} 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => {
                setShowAddLabModal(false);
                setNewLab({
                  name: '', location: '', capacity: 0, computers: 0,
                  status: 'operational', nextMaintenance: '', software: '', hardware: ''
                });
              }} 
              className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg hover:from-cyan-600 hover:to-indigo-600 transition-all"
            >
              Add Lab
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTicketDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowTicketDetailsModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Ticket Details</h2><button onClick={() => setShowTicketDetailsModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        {selectedTicket && (<div className="p-6"><div className="grid grid-cols-2 gap-4"><div><p className="text-slate-400">ID</p><p className="text-white">{selectedTicket.id}</p></div><div><p className="text-slate-400">Title</p><p className="text-white">{selectedTicket.title}</p></div><div><p className="text-slate-400">Category</p><p className="text-white">{selectedTicket.category}</p></div><div><p className="text-slate-400">Priority</p><PriorityBadge priority={selectedTicket.priority} /></div><div><p className="text-slate-400">Status</p><StatusBadge status={selectedTicket.status} /></div><div><p className="text-slate-400">Assigned To</p><p className="text-white">{selectedTicket.assignedTo}</p></div><div><p className="text-slate-400">Location</p><p className="text-white">{selectedTicket.location}</p></div><div><p className="text-slate-400">Description</p><p className="text-white">{selectedTicket.description}</p></div></div></div>)}
      </div>
    </div>
  );

  const renderEventLogModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowEventLogModal(false)}>
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Event Log</h2><button onClick={() => setShowEventLogModal(false)}><FiX className="text-slate-400 text-xl" /></button></div>
        <div className="p-6">
          {selectedPcEvents.length === 0 ? (<p className="text-slate-400 text-center py-4">No events recorded yet</p>) : (selectedPcEvents.map((event, idx) => (<div key={idx} className="bg-white/5 rounded-lg p-3 mb-2"><p className="text-white text-sm">{event.action}</p><p className="text-slate-500 text-xs">{event.date} by {event.user}</p></div>)))}
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RETURN ====================
  return (
    <div className="app-container">
      {showSuccessToast && (<div className="toast"><div className={`toast-${toastType}`}>{toastMessage}</div></div>)}

      {showAddAssetModal && renderAddAssetModal()}
      {showAddTicketModal && renderAddTicketModal()}
      {showAddInventoryModal && renderAddInventoryModal()}
      {showEditInventoryModal && renderEditInventoryModal()}
      {showEditStaffModal && renderEditStaffModal()}
      {showAddStaffModal && renderAddStaffModal()}
      {showEditLabModal && renderEditLabModal()}
      {showEditNetworkModal && renderEditNetworkModal()}
      {showAddNetworkModal && renderAddNetworkModal()}
      {showEditLicenseModal && renderEditLicenseModal()}
      {showAddLicenseModal && renderAddLicenseModal()}
      {showAssetDetailsModal && renderAssetDetailsModal()}
      {showTicketDetailsModal && renderTicketDetailsModal()}
      {showAddPcModal && renderAddPcModal()}
      {showEditPcModal && renderEditPcModal()}
      {showEventLogModal && renderEventLogModal()}
      {showEditAssetModal && renderEditAssetModal()}
      {showAddLabModal && renderAddLabModal()}

      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="logo-container">
              <div className="logo-icon p-1.5 flex items-center justify-center" style={{ background: '#ffffff' }}>
                <img src={mitkLogo} alt="MITK Logo" className="w-full h-full object-contain" />
              </div>
              <div className="logo-text"><h1 className="gradient-text">MITK ITMS</h1><p className="logo-subtitle">Information Technology Management System</p></div>
            </div>
          </div>
          <div className="navbar-center">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search assets, tickets, users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            </div>
          </div>
          <div className="navbar-right">
            <div className="datetime-container">
              <p className="time-text">{currentTime.toLocaleTimeString()}</p>
              <p className="date-text">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="notifications-container">
              <button onClick={() => setShowNotifications(!showNotifications)} className="notifications-btn">
                <FiBell className="text-slate-300 text-xl" />
                {notifications.filter(n => !n.read).length > 0 && <span className="notification-badge" />}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header"><h3>Notifications</h3></div>
                  <div className="dropdown-list">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                        <p className="notification-title">{notif.title}</p>
                        <p className="notification-message">{notif.message}</p>
                        <p className="notification-time">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="user-container">
              <div className="user-info">
                <p className="user-name">{user?.name || 'Admin'}</p>
                <p className="user-role">{user?.role || 'Admin'}</p>
              </div>
              <button onClick={logout} className="logout-btn"><FiLogOut className="text-red-400 text-xl" /></button>
            </div>
          </div>
        </div>
      </nav>

      <aside className="sidebar">
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="content-container">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;