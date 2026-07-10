import { create } from 'zustand';
import { BuilderProject, BuilderSection, BuilderTheme } from '@craftsite/shared';

interface BuilderState {
  projectId: string | null;
  builderData: BuilderProject | null;
  selectedSectionId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile' | 'full';
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  history: BuilderProject[];
  historyIndex: number;
  previewMode: boolean;

  setProjectId: (id: string) => void;
  setBuilderData: (data: BuilderProject) => void;
  selectSection: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile' | 'full') => void;
  setPreviewMode: (mode: boolean) => void;
  
  updateTheme: (theme: Partial<BuilderTheme>) => void;
  updateSectionProps: (id: string, props: any) => void;
  updateSectionStyles: (id: string, styles: any) => void;
  addSection: (section: Omit<BuilderSection, 'id' | 'order'>, afterId?: string) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  toggleVisibility: (id: string) => void;
  
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

export const useBuilderStore = create<BuilderState>((set, get) => ({
  projectId: null,
  builderData: null,
  selectedSectionId: null,
  viewport: 'desktop',
  dirty: false,
  saving: false,
  lastSavedAt: null,
  history: [],
  historyIndex: -1,
  previewMode: false,

  setProjectId: (id) => set({ projectId: id }),
  
  setBuilderData: (data) => set({ 
    builderData: data,
    history: [data],
    historyIndex: 0,
    dirty: false
  }),

  selectSection: (id) => set({ selectedSectionId: id }),
  setViewport: (viewport) => set({ viewport }),
  setPreviewMode: (mode) => set({ previewMode: mode }),

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
    const newData = {
      ...state.builderData,
      sections: state.builderData.sections.map(s => 
        s.id === id ? { ...s, props: { ...s.props, ...props } } : s
      )
    };
    return pushHistory(state, newData);
  }),

  updateSectionStyles: (id, styles) => set((state) => {
    if (!state.builderData) return state;
    const newData = {
      ...state.builderData,
      sections: state.builderData.sections.map(s => 
        s.id === id ? { ...s, styles: { ...s.styles, ...styles } } : s
      )
    };
    return pushHistory(state, newData);
  }),

  addSection: (sectionTemplate, afterId) => set((state) => {
    if (!state.builderData) return state;
    const newSection: BuilderSection = {
      ...sectionTemplate,
      id: crypto.randomUUID(),
      order: 0
    };
    
    let newSections = [...state.builderData.sections];
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
    
    // Re-order sequentially
    newSections = newSections.map((s, i) => ({ ...s, order: i }));

    return pushHistory(state, { ...state.builderData, sections: newSections });
  }),

  duplicateSection: (id) => set((state) => {
    if (!state.builderData) return state;
    const idx = state.builderData.sections.findIndex(s => s.id === id);
    if (idx === -1) return state;
    
    const original = state.builderData.sections[idx];
    const duplicate: BuilderSection = {
      ...original,
      id: crypto.randomUUID(),
    };
    
    const newSections = [...state.builderData.sections];
    newSections.splice(idx + 1, 0, duplicate);
    
    // Re-order sequentially
    const orderedSections = newSections.map((s, i) => ({ ...s, order: i }));
    return pushHistory(state, { ...state.builderData, sections: orderedSections });
  }),

  removeSection: (id) => set((state) => {
    if (!state.builderData) return state;
    const newSections = state.builderData.sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    return pushHistory(state, { ...state.builderData, sections: newSections });
  }),

  reorderSections: (activeId, overId) => set((state) => {
    if (!state.builderData) return state;
    const oldIndex = state.builderData.sections.findIndex(s => s.id === activeId);
    const newIndex = state.builderData.sections.findIndex(s => s.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return state;
    
    const newSections = [...state.builderData.sections];
    const [moved] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, moved);
    
    const orderedSections = newSections.map((s, i) => ({ ...s, order: i }));
    return pushHistory(state, { ...state.builderData, sections: orderedSections });
  }),

  toggleVisibility: (id) => set((state) => {
    if (!state.builderData) return state;
    const newData = {
      ...state.builderData,
      sections: state.builderData.sections.map(s => 
        s.id === id ? { ...s, visible: !s.visible } : s
      )
    };
    return pushHistory(state, newData);
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
