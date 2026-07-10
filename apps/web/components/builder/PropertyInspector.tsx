import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderNode } from "@craftsite/shared";
import { X } from "lucide-react";
import { Button } from "../ui/button";

export default function PropertyInspector() {
  const { builderData, activePageId, selectedNodeId, selectNode, updateNodeProps } = useBuilderStore();

  if (!builderData || !selectedNodeId || !activePageId) return null;

  const activePage = builderData.pages?.find(p => p.id === activePageId);
  if (!activePage) return null;

  const findNode = (nodes: BuilderNode[]): BuilderNode | null => {
    for (const n of nodes) {
      if (n.id === selectedNodeId) {
        return n;
      }
      const found = findNode(n.children);
      if (found) return found;
    }
    return null;
  };
  const selectedNode = findNode(activePage.nodes || []);

  if (!selectedNode) return null;

  const handleChange = (key: string, value: string) => {
    updateNodeProps(selectedNodeId, { [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">
          {selectedNode.type} Properties
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => selectNode(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="mb-4">
          <label className="text-xs text-zinc-400 mb-2 block">Name / Identifier</label>
          <input 
            type="text"
            className="w-full h-8 px-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-violet-500 transition-colors"
            value={selectedNode.name || ''}
            readOnly
          />
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Attributes</h4>
          
          <div className="flex flex-col gap-3">
            {/* Generic key-value props editor */}
            {Object.entries(selectedNode.props).length === 0 ? (
              <div className="text-xs text-zinc-500 italic">No specific properties for this component type yet.</div>
            ) : (
              Object.entries(selectedNode.props).map(([key, value]) => (
                <div key={key}>
                  <label className="text-xs text-zinc-400 mb-1 block capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input 
                    type="text"
                    className="w-full h-8 px-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-violet-500 transition-colors"
                    value={value as string}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              ))
            )}
            
            {/* Provide a way to add new generic props for testing Phase 28 */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
               <button 
                 className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                 onClick={() => {
                   const key = prompt("Property Name:");
                   if (key) handleChange(key, "New Value");
                 }}
               >
                 + Add Custom Property
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
