import { create } from 'zustand';
import { BuilderProject, BuilderSection, BuilderTheme, BuilderNode } from '@craftsite/shared';

interface BuilderState {
  projectId: string | null;
  builderData: BuilderProject | null;
  activePageId: string | null;
  selectedSectionId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile' | 'full';
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  history: BuilderProject[];
  historyIndex: number;
  previewMode: boolean;
  
  // Phase 29: AI Memory & Context
  aiMemory: Record<string, any>;
  chatHistory: { role: 'user' | 'assistant'; text: string; diff?: any }[];
  pendingAiDiff: any | null;

  setProjectId: (id: string) => void;
  setBuilderData: (data: BuilderProject) => void;
  setActivePageId: (id: string | null) => void;
  selectSection: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile' | 'full') => void;
  setPreviewMode: (mode: boolean) => void;
  
  // Phase 29 Actions
  addChatMessage: (msg: { role: 'user' | 'assistant'; text: string; diff?: any }) => void;
  applyAiDiff: (diff: any) => void;
  setPendingAiDiff: (diff: any | null) => void;
  
  updateTheme: (theme: Partial<BuilderTheme>) => void;
  updateSectionProps: (id: string, props: any) => void;
  updateSectionStyles: (id: string, styles: any) => void;
  addSection: (section: Omit<BuilderSection, 'id' | 'order'>, afterId?: string) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  toggleVisibility: (id: string) => void;
  
  // Phase 28 Node operations
  addNode: (node: BuilderNode, parentId?: string) => void;
  updateNodeProps: (id: string, props: any) => void;
  removeNode: (id: string) => void;
  
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
}

const pushHistory = (state: BuilderState, newData: BuilderProject) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(newData);
  if (newHistory.length > 30) newHistory.shift(); // Keep bounded history
  return {
    builderData: newData,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    dirty: true
  };
};

const updateSections = (state: BuilderState, updater: (sections: BuilderSection[]) => BuilderSection[]) => {
  if (!state.builderData) return state.builderData;
  const newData = { ...state.builderData };
  
  if (state.activePageId && newData.pages) {
    newData.pages = newData.pages.map(p => 
      p.id === state.activePageId ? { ...p, sections: updater(p.sections) } : p
    );
  } else {
    newData.sections = updater(newData.sections);
  }
  return newData;
};

const updateNodes = (state: BuilderState, updater: (nodes: BuilderNode[]) => BuilderNode[]) => {
  if (!state.builderData) return state.builderData;
  const newData = { ...state.builderData };
  
  if (state.activePageId && newData.pages) {
    newData.pages = newData.pages.map(p => 
      p.id === state.activePageId ? { ...p, nodes: updater(p.nodes || []) } : p
    );
  }
  return newData;
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  projectId: null,
  builderData: null,
  activePageId: null,
  selectedSectionId: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  viewport: 'desktop',
  dirty: false,
  saving: false,
  lastSavedAt: null,
  history: [],
  historyIndex: -1,
  previewMode: false,
  aiMemory: {},
  chatHistory: [{ role: 'assistant', text: "Hi! I'm your AI Website Engineer. What would you like to build or change?" }],
  pendingAiDiff: null,

  setProjectId: (id) => set({ projectId: id }),
  
  setBuilderData: (data) => set({ 
    builderData: data,
    history: [data],
    historyIndex: 0,
    dirty: false
  }),

  setActivePageId: (id) => set({ activePageId: id, selectedSectionId: null, selectedNodeId: null }),
  selectSection: (id) => set({ selectedSectionId: id, selectedNodeId: null }),
  selectNode: (id) => set({ selectedNodeId: id, selectedSectionId: null }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setViewport: (viewport) => set({ viewport }),
  setPreviewMode: (mode) => set({ previewMode: mode }),

  addChatMessage: (msg) => set((state) => ({ 
    chatHistory: [...state.chatHistory, msg] 
  })),

  setPendingAiDiff: (diff) => set({ pendingAiDiff: diff }),

  applyAiDiff: (diff) => set((state) => {
    if (!state.builderData) return state;
    // Simple naive optimistic update simulation (replace node completely)
    // In a real structural diff app, this would deeply merge diffs via JSONPatch or custom tree diffing.
    if (diff.type === 'replace_node' && diff.node && diff.nodeId) {
      const updateRecursive = (nodes: BuilderNode[]): BuilderNode[] => {
        return nodes.map(n => 
          n.id === diff.nodeId ? diff.node : { ...n, children: updateRecursive(n.children) }
        );
      };
      const newData = updateNodes(state, updateRecursive);
      return pushHistory(state, newData as BuilderProject);
    }
    return state;
  }),

  updateTheme: (themeUpdate) => set((state) => {
    if (!state.builderData) return state;
    const newData = {
      ...state.builderData,
      theme: { ...state.builderData.theme, ...themeUpdate }
    };
    return pushHistory(state, newData);
  }),

  updateSectionProps: (id, props) => set((state) => {
    if (!state.builderData) return state;
    const newData = updateSections(state, sections => 
      sections.map(s => s.id === id ? { ...s, props: { ...s.props, ...props } } : s)
    );
    return pushHistory(state, newData as BuilderProject);
  }),

  updateSectionStyles: (id, styles) => set((state) => {
    if (!state.builderData) return state;
    const newData = updateSections(state, sections => 
      sections.map(s => s.id === id ? { ...s, styles: { ...s.styles, ...styles } } : s)
    );
    return pushHistory(state, newData as BuilderProject);
  }),

  addSection: (sectionTemplate, afterId) => set((state) => {
    if (!state.builderData) return state;
    
    const newData = updateSections(state, sections => {
      const newSection: BuilderSection = {
        ...sectionTemplate,
        id: crypto.randomUUID(),
        order: 0
      };
      
      let newSections = [...sections];
      if (afterId) {
        const idx = newSections.findIndex(s => s.id === afterId);
        if (idx !== -1) {
          newSections.splice(idx + 1, 0, newSection);
        } else {
          newSections.push(newSection);
        }
      } else {
        newSections.push(newSection);
      }
      return newSections.map((s, i) => ({ ...s, order: i }));
    });

    return pushHistory(state, newData as BuilderProject);
  }),

  duplicateSection: (id) => set((state) => {
    if (!state.builderData) return state;
    
    const newData = updateSections(state, sections => {
      const idx = sections.findIndex(s => s.id === id);
      if (idx === -1) return sections;
      
      const original = sections[idx];
      const duplicate: BuilderSection = {
        ...original,
        id: crypto.randomUUID(),
      };
      
      const newSections = [...sections];
      newSections.splice(idx + 1, 0, duplicate);
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
    
    return pushHistory(state, newData as BuilderProject);
  }),

  removeSection: (id) => set((state) => {
    if (!state.builderData) return state;
    const newData = updateSections(state, sections => 
      sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }))
    );
    return pushHistory(state, newData as BuilderProject);
  }),

  reorderSections: (activeId, overId) => set((state) => {
    if (!state.builderData) return state;
    
    const newData = updateSections(state, sections => {
      const oldIndex = sections.findIndex(s => s.id === activeId);
      const newIndex = sections.findIndex(s => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return sections;
      
      const newSections = [...sections];
      const [moved] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, moved);
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
    
    return pushHistory(state, newData as BuilderProject);
  }),

  toggleVisibility: (id) => set((state) => {
    if (!state.builderData) return state;
    const newData = updateSections(state, sections => 
      sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    );
    return pushHistory(state, newData as BuilderProject);
  }),

  addNode: (node, parentId) => set((state) => {
    if (!state.builderData) return state;
    const addRecursive = (nodes: BuilderNode[]): BuilderNode[] => {
      if (!parentId) return [...nodes, node];
      return nodes.map(n => 
        n.id === parentId 
          ? { ...n, children: [...n.children, node] }
          : { ...n, children: addRecursive(n.children) }
      );
    };
    const newData = updateNodes(state, addRecursive);
    return pushHistory(state, newData as BuilderProject);
  }),

  updateNodeProps: (id, props) => set((state) => {
    if (!state.builderData) return state;
    const updateRecursive = (nodes: BuilderNode[]): BuilderNode[] => {
      return nodes.map(n => 
        n.id === id 
          ? { ...n, props: { ...n.props, ...props } }
          : { ...n, children: updateRecursive(n.children) }
      );
    };
    const newData = updateNodes(state, updateRecursive);
    return pushHistory(state, newData as BuilderProject);
  }),

  removeNode: (id) => set((state) => {
    if (!state.builderData) return state;
    const removeRecursive = (nodes: BuilderNode[]): BuilderNode[] => {
      return nodes.filter(n => n.id !== id).map(n => ({
        ...n,
        children: removeRecursive(n.children)
      }));
    };
    const newData = updateNodes(state, removeRecursive);
    return pushHistory(state, newData as BuilderProject);
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        historyIndex: state.historyIndex - 1,
        builderData: state.history[state.historyIndex - 1],
        dirty: true
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        historyIndex: state.historyIndex + 1,
        builderData: state.history[state.historyIndex + 1],
        dirty: true
      };
    }
    return state;
  }),

  markSaved: () => set({ dirty: false, lastSavedAt: new Date(), saving: false }),
  setSaving: (saving) => set({ saving })
}));
