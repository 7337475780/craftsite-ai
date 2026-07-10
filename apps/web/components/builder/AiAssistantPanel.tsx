import React, { useState } from "react";
import { Send, Sparkles, AlertCircle, Check, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useBuilderStore } from "@/stores/builder-store";

export default function AiAssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { selectedNodeId, builderData, activePageId, chatHistory, addChatMessage, applyAiDiff } = useBuilderStore();

  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    const userMsg = prompt;
    setPrompt("");
    addChatMessage({ role: 'user', text: userMsg });
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          builderData,
          activePageId,
          selectedNodeId
        })
      });

      if (!response.ok) throw new Error("Failed to communicate with AI Engineer.");
      
      const data = await response.json();
      
      addChatMessage({ 
        role: data.role || 'assistant', 
        text: data.text || "I've analyzed your request.",
        diff: data.diff || null
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
      addChatMessage({ role: 'assistant', text: "Sorry, I encountered an error connecting to the AI brain." });
      setLoading(false);
    }
  };

  const suggestions = [
    "Make this section more premium",
    "Add a pricing table",
    "Improve SEO and Accessibility",
    "Change the theme to Dark Mode"
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-wide">AI Engineer</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-xs px-3 py-2 rounded-lg max-w-[90%] ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-none' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
            }`}>
              {msg.text}
            </div>
            {msg.diff && (
              <div className="mt-2 w-full max-w-[90%] p-2 rounded bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                <div className="text-[10px] text-zinc-400">Proposed structural change</div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-6 text-[10px] w-full" onClick={() => applyAiDiff(msg.diff)}>
                    <Check className="w-3 h-3 mr-1" /> Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-zinc-800 text-zinc-400 text-xs px-3 py-2 rounded-lg rounded-bl-none border border-zinc-700 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900 shrink-0 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setPrompt(s)}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full border border-zinc-700 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
            placeholder={selectedNodeId ? "Modify this component..." : "Tell me what to build..."}
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1.5 bottom-1.5 h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
            onClick={handleSend}
            disabled={!prompt.trim() || loading}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
