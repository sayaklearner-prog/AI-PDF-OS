import { create } from 'zustand';

export type ToolType = 'select' | 'text' | 'draw' | 'shape' | 'stamp' | 'signature' | 'watermark' | 'eraser' | 'qr';
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'arrow' | 'line';
export type SidebarTab = 'pages' | 'ai' | 'signatures' | 'qr' | 'workflows' | 'intelligence' | 'versions' | 'collab' | 'format' | 'summary' | 'compare';

export interface CanvasItem {
  id: string;
  type: 'draw' | 'shape' | 'text' | 'stamp' | 'signature' | 'qr';
  page: number;
  color?: string;
  points?: { x: number; y: number }[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  shapeType?: ShapeType;
  stampType?: string;
  sigDataUrl?: string;
  qrDataUrl?: string;
  fontFamily?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  rotation?: number;
  opacity?: number;
  letterSpacing?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface CoCollaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
  activePage: number;
  isWriting?: boolean;
}

export interface PDFDocument {
  id: string;
  title: string;
  fileSize: string;
  pageCount: number;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
  versionsCount: number;
  fileData?: ArrayBuffer;
}

export interface GraphNodeData {
  id: string;
  label: string;
  type: 'Person' | 'Org' | 'Date' | 'Amount' | 'Law' | 'Risk';
  page: number;
  details?: string;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  references?: { page: number; text: string }[];
  actionPreview?: {
    type: 'signature' | 'highlight' | 'text' | 'comment';
    payload: any;
  };
  actionApplied?: boolean;
}

export interface WorkflowActionData {
  id: string;
  type: 'ocr' | 'extract' | 'qr' | 'email' | 'webhook';
  name: string;
  config: Record<string, any>;
}

export interface WorkflowData {
  id: string;
  name: string;
  trigger: 'upload' | 'sign' | 'manual';
  isEnabled: boolean;
  actions: WorkflowActionData[];
}

interface EditorState {
  // Document state
  currentDocument: PDFDocument | null;
  setCurrentDocument: (doc: PDFDocument | null) => void;
  documentsList: PDFDocument[];
  setDocumentsList: (docs: PDFDocument[]) => void;
  
  // Apryse WebViewer Instance
  webViewerInstance: any | null;
  setWebViewerInstance: (instance: any | null) => void;
  
  // UI Panels
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Canvas Tools
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  selectedShape: ShapeType;
  setSelectedShape: (shape: ShapeType) => void;
  
  // Brush properties
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  
  // Text formatting
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontColor: string;
  setFontColor: (color: string) => void;
  isBold: boolean;
  toggleBold: () => void;
  isItalic: boolean;
  toggleItalic: () => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (align: 'left' | 'center' | 'right') => void;
  
  // Signature & Stamps
  savedSignatures: { id: string; dataUrl: string; type: string }[];
  addSignature: (sig: { dataUrl: string; type: string }) => void;
  removeSignature: (id: string) => void;
  activeStamp: string | null;
  setActiveStamp: (stamp: string | null) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (opacity: number) => void;
  
  // Real-time Collaboration & Presence
  collaborators: CoCollaborator[];
  updateCollaborator: (id: string, updates: Partial<CoCollaborator>) => void;
  addCollaborator: (collab: CoCollaborator) => void;
  removeCollaborator: (id: string) => void;
  
  // AI Panel State
  aiMessages: Message[];
  addAiMessage: (msg: Message) => void;
  updateAiMessage: (id: string, updates: Partial<Message>) => void;
  clearAiMessages: () => void;
  isAiGenerating: boolean;
  setAiGenerating: (val: boolean) => void;
  
  // Knowledge Graph Data
  graphNodes: GraphNodeData[];
  graphEdges: GraphEdgeData[];
  setGraphData: (nodes: GraphNodeData[], edges: GraphEdgeData[]) => void;
  
  // Workflows
  workflows: WorkflowData[];
  addWorkflow: (wf: WorkflowData) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowData>) => void;
  
  // QR Analytics State
  qrConfig: {
    isDynamic: boolean;
    expiresAt: string | null;
    passwordHash: string | null;
    qrToken: string;
    redirectUrl: string;
    qrCodeDataUrl?: string | null;
  };
  setQrConfig: (config: Partial<EditorState['qrConfig']>) => void;
  qrScansData: { date: string; scans: number; location: string }[];
  setQrScansData: (data: { date: string; scans: number; location: string }[]) => void;
  
  // Settings State
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  userProfile: {
    name: string;
    email: string;
    apiKey: string;
    role: string;
  };
  setUserProfile: (profile: Partial<EditorState['userProfile']>) => void;

  // Selected Canvas Item
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  
  // Canvas Items global state
  canvasItems: CanvasItem[];
  setCanvasItems: (items: CanvasItem[]) => void;
  addCanvasItem: (item: CanvasItem) => void;
  updateCanvasItem: (id: string, updates: Partial<CanvasItem>) => void;
  removeCanvasItem: (id: string) => void;

  // History state for Undo/Redo
  undoStack: CanvasItem[][];
  redoStack: CanvasItem[][];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Watermark Settings Config
  watermarkConfig: {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    opacity: number;
    rotation: number;
    scale: number;
    location: 'top' | 'behind';
    verticalOffset: number;
    horizontalOffset: number;
    verticalAlign: 'top' | 'bottom' | 'center';
    horizontalAlign: 'left' | 'right' | 'center';
    showModal: boolean;
  };
  setWatermarkConfig: (config: Partial<EditorState['watermarkConfig']>) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Apryse WebViewer Instance
  webViewerInstance: null,
  setWebViewerInstance: (instance) => set({ webViewerInstance: instance }),

  // Document state
  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  documentsList: [
    {
      id: 'doc-1',
      title: 'Commercial_Lease_Agreement.pdf',
      fileSize: '2.4 MB',
      pageCount: 4,
      isStarred: true,
      createdAt: '2026-05-28T10:00:00Z',
      updatedAt: '2026-05-30T12:00:00Z',
      versionsCount: 3,
    },
    {
      id: 'doc-2',
      title: 'Acme_Q1_Financial_Report.pdf',
      fileSize: '4.8 MB',
      pageCount: 8,
      isStarred: false,
      createdAt: '2026-05-29T14:30:00Z',
      updatedAt: '2026-05-29T14:30:00Z',
      versionsCount: 1,
    },
    {
      id: 'doc-3',
      title: 'GDPR_Compliance_Manual_V2.pdf',
      fileSize: '1.2 MB',
      pageCount: 12,
      isStarred: false,
      createdAt: '2026-05-25T09:15:00Z',
      updatedAt: '2026-05-30T08:45:00Z',
      versionsCount: 5,
    }
  ],
  setDocumentsList: (docs) => set({ documentsList: docs }),
  
  // UI Panels
  activeTab: 'pages',
  setActiveTab: (tab) => set({ activeTab: tab }),
  currentPage: 0,
  setCurrentPage: (page) => set({ currentPage: page }),
  zoomLevel: 100,
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  // Canvas Tools
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectedShape: 'rect',
  setSelectedShape: (shape) => set({ selectedShape: shape }),
  
  // Brush properties
  brushColor: '#6366f1',
  setBrushColor: (color) => set({ brushColor: color }),
  brushWidth: 3,
  setBrushWidth: (width) => set({ brushWidth: width }),
  brushOpacity: 1.0,
  setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
  
  // Text formatting
  fontFamily: 'Inter',
  setFontFamily: (font) => set({ fontFamily: font }),
  fontSize: 16,
  setFontSize: (size) => set({ fontSize: size }),
  fontColor: '#0f172a',
  setFontColor: (color) => set({ fontColor: color }),
  isBold: false,
  toggleBold: () => set((state) => ({ isBold: !state.isBold })),
  isItalic: false,
  toggleItalic: () => set((state) => ({ isItalic: !state.isItalic })),
  textAlign: 'left',
  setTextAlign: (align) => set({ textAlign: align }),
  
  // Signature & Stamps
  savedSignatures: [],
  addSignature: (sig) => set((state) => ({
    savedSignatures: [...state.savedSignatures, { id: `sig-${Date.now()}`, ...sig }]
  })),
  removeSignature: (id) => set((state) => ({
    savedSignatures: state.savedSignatures.filter((s) => s.id !== id)
  })),
  activeStamp: null,
  setActiveStamp: (stamp) => set({ activeStamp: stamp }),
  watermarkText: '',
  setWatermarkText: (text) => set({ watermarkText: text }),
  watermarkOpacity: 0.2,
  setWatermarkOpacity: (opacity) => set({ watermarkOpacity: opacity }),
  
  // Real-time Collaboration
  collaborators: [
    {
      id: 'user-2',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      color: '#ec4899',
      x: 120,
      y: 350,
      activePage: 0,
    },
    {
      id: 'user-3',
      name: 'Marcus Miller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      color: '#10b981',
      x: 480,
      y: 180,
      activePage: 0,
      isWriting: true,
    }
  ],
  updateCollaborator: (id, updates) => set((state) => ({
    collaborators: state.collaborators.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),
  addCollaborator: (collab) => set((state) => ({
    collaborators: [...state.collaborators, collab]
  })),
  removeCollaborator: (id) => set((state) => ({
    collaborators: state.collaborators.filter((c) => c.id !== id)
  })),
  
  // AI Panel
  aiMessages: [
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your AI Document Assistant. I have indexed this contract. Here is a quick summary:\n\n• **Parties:** Landlord (Acme Properties Ltd) & Tenant (Lexington Tech LLC)\n• **Premises:** Suite 404, 500 Sand Hill Road, CA\n• **Term:** 36 months starting June 1, 2026\n• **Rent:** $12,500/month\n\nHow can I help you analyze, verify, or rewrite this document today?",
      timestamp: '2:45 PM'
    }
  ],
  addAiMessage: (msg) => set((state) => ({
    aiMessages: [...state.aiMessages, msg]
  })),
  updateAiMessage: (id, updates) => set((state) => ({
    aiMessages: state.aiMessages.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
  })),
  clearAiMessages: () => set({ aiMessages: [] }),
  isAiGenerating: false,
  setAiGenerating: (val) => set({ isAiGenerating: val }),
  
  // Knowledge Graph Data
  graphNodes: [
    { id: 'n1', label: 'Commercial Lease Agreement.pdf', type: 'Org', page: 0, details: 'Main Document Source' },
    { id: 'n2', label: 'Acme Properties Ltd', type: 'Org', page: 1, details: 'Landlord party' },
    { id: 'n3', label: 'Lexington Tech LLC', type: 'Org', page: 1, details: 'Tenant party' },
    { id: 'n4', label: '$12,500/month', type: 'Amount', page: 2, details: 'Base rent fee' },
    { id: 'n5', label: 'June 1, 2026', type: 'Date', page: 1, details: 'Lease Commencement' },
    { id: 'n6', label: 'Indemnification Clause', type: 'Law', page: 3, details: 'Liability risk coverage' },
    { id: 'n7', label: 'Unlimited Liability Exemption', type: 'Risk', page: 3, details: 'High risk rating detected by AI' },
  ],
  graphEdges: [
    { id: 'e1', source: 'n1', target: 'n2', relation: 'Signed By' },
    { id: 'e2', source: 'n1', target: 'n3', relation: 'Signed By' },
    { id: 'e3', source: 'n3', target: 'n4', relation: 'Pays' },
    { id: 'e4', source: 'n1', target: 'n5', relation: 'Starts On' },
    { id: 'e5', source: 'n1', target: 'n6', relation: 'Contains' },
    { id: 'e6', source: 'n6', target: 'n7', relation: 'Triggers' },
  ],
  setGraphData: (nodes, edges) => set({ graphNodes: nodes, graphEdges: edges }),
  
  // Workflows
  workflows: [
    {
      id: 'wf-1',
      name: 'Auto-OCR & Extract Invoices',
      trigger: 'upload',
      isEnabled: true,
      actions: [
        { id: 'act-1', type: 'ocr', name: 'Optical Character Recognition', config: { lang: 'en', engine: 'high-accuracy' } },
        { id: 'act-2', type: 'extract', name: 'Extract Tables & Metadata', config: { schema: ['Date', 'InvoiceNumber', 'TotalAmount', 'Vendor'] } },
        { id: 'act-3', type: 'qr', name: 'Attach Trackable QR Stamp', config: { position: 'top-right' } },
        { id: 'act-4', type: 'email', name: 'Email Accounting Department', config: { recipient: 'finance@acme.com', subject: 'New Invoice Processed' } }
      ]
    }
  ],
  addWorkflow: (wf) => set((state) => ({ workflows: [...state.workflows, wf] })),
  updateWorkflow: (id, updates) => set((state) => ({
    workflows: state.workflows.map((w) => w.id === id ? { ...w, ...updates } : w)
  })),
  
  // QR Config
  qrConfig: {
    isDynamic: true,
    expiresAt: null,
    passwordHash: null,
    qrToken: 'qr_lease_agreement_2026',
    redirectUrl: 'http://localhost:3001/qr/s/qr_lease_agreement_2026',
    qrCodeDataUrl: null
  },
  setQrConfig: (config) => set((state) => ({ qrConfig: { ...state.qrConfig, ...config } })),
  qrScansData: [
    { date: 'May 24', scans: 12, location: 'New York, US' },
    { date: 'May 25', scans: 18, location: 'London, UK' },
    { date: 'May 26', scans: 45, location: 'San Francisco, US' },
    { date: 'May 27', scans: 30, location: 'Tokyo, JP' },
    { date: 'May 28', scans: 60, location: 'Berlin, DE' },
    { date: 'May 29', scans: 95, location: 'New York, US' },
    { date: 'May 30', scans: 140, location: 'San Francisco, US' }
  ],
  setQrScansData: (data) => set({ qrScansData: data }),
  
  // Settings Implementation
  showSettings: false,
  setShowSettings: (val) => set({ showSettings: val }),
  userProfile: {
    name: 'Alex Parker',
    email: 'alex.parker@company.com',
    apiKey: 'sk-proj-••••••••••••••••••••',
    role: 'Admin Owner'
  },
  setUserProfile: (profile) => set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
  
  // Canvas editing implementation
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  canvasItems: [],
  setCanvasItems: (items) => set({ canvasItems: items }),
  addCanvasItem: (item) => set((state) => {
    state.pushHistory();
    return { canvasItems: [...state.canvasItems, item] };
  }),
  updateCanvasItem: (id, updates) => set((state) => {
    // Only push history for non-continuous drag updates if we wanted strictly, but basic is fine
    // Or we rely on components to call pushHistory manually before dragging begins.
    return {
      canvasItems: state.canvasItems.map((item) => item.id === id ? { ...item, ...updates } : item)
    };
  }),
  removeCanvasItem: (id) => set((state) => {
    state.pushHistory();
    return {
      canvasItems: state.canvasItems.filter((item) => item.id !== id),
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId
    };
  }),

  // History implementation
  undoStack: [],
  redoStack: [],
  pushHistory: () => set((state) => ({
    undoStack: [...state.undoStack, state.canvasItems],
    redoStack: [] // clear redo stack on new action
  })),
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previousState = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    return {
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, state.canvasItems],
      canvasItems: previousState
    };
  }),
  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const nextState = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    return {
      undoStack: [...state.undoStack, state.canvasItems],
      redoStack: newRedoStack,
      canvasItems: nextState
    };
  }),

  // Watermark Settings Config
  watermarkConfig: {
    text: '',
    fontFamily: 'Inter',
    fontSize: 48,
    color: '#94a3b8',
    opacity: 0.15,
    rotation: -45,
    scale: 100,
    location: 'top',
    verticalOffset: 0,
    horizontalOffset: 0,
    verticalAlign: 'center',
    horizontalAlign: 'center',
    showModal: false
  },
  setWatermarkConfig: (config) => set((state) => ({
    watermarkConfig: { ...state.watermarkConfig, ...config }
  })),
}));
