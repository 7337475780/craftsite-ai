"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRealtime } from "../providers/RealtimeProvider";
import { REALTIME_EVENTS } from "@/types/realtime";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MessageSquare, Check, RotateCcw, Trash2, Edit2, Send } from "lucide-react";

interface UserInfo {
  id: string;
  name?: string | null;
  image?: string | null;
  email: string;
}

interface CommentReply {
  id: string;
  parentId: string;
  authorId: string;
  author: UserInfo;
  body: string;
  createdAt: string;
}

interface CommentThread {
  id: string;
  projectId: string;
  authorId: string;
  author: UserInfo;
  body: string;
  parentId?: string | null;
  isResolved: boolean;
  resolvedById?: string | null;
  resolvedBy?: { id: string; name: string } | null;
  resolvedAt?: string | null;
  createdAt: string;
  replies: CommentReply[];
}

interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

interface ProjectCommentsProps {
  projectId: string;
  workspaceId?: string | null;
  projectOwnerId?: string;
  currentUserRole?: string | null;
  onClose?: () => void;
}

export function ProjectComments({
  projectId,
  workspaceId,
  projectOwnerId,
  currentUserRole,
  onClose,
}: ProjectCommentsProps) {
  const { user } = useAuth();
  const { socket, addToast } = useRealtime();
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");
  const [loading, setLoading] = useState(true);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // New thread inputs
  const [newCommentBody, setNewCommentBody] = useState("");
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);
  
  // Workspace members for mention dropdown
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [pickerIndex, setPickerIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reply inputs indexed by parent comment id
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyMentionedIds, setReplyMentionedIds] = useState<Record<string, string[]>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Load comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/projects/${projectId}/comments`);
      if (res.success && Array.isArray(res.data)) {
        setThreads(res.data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load members for mentions
  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await apiGet(`/api/workspaces/${workspaceId}/members`);
      if (Array.isArray(res)) {
        setMembers(res);
      }
    } catch (err) {
      console.error("Failed to load workspace members for mentions:", err);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchComments();
    fetchMembers();
  }, [fetchComments, fetchMembers]);

  // Real-time updates handler
  useEffect(() => {
    if (!socket) return;

    const onCommentCreated = (data: { comment: CommentThread }) => {
      setThreads((prev) => {
        // Double-check if thread already exists
        if (prev.find((t) => t.id === data.comment.id)) return prev;
        return [...prev, { ...data.comment, replies: [] }];
      });
    };

    const onReplyCreated = (data: { comment: CommentReply }) => {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === data.comment.parentId) {
            // Avoid duplicates
            if (thread.replies.find((r) => r.id === data.comment.id)) return thread;
            return {
              ...thread,
              replies: [...thread.replies, data.comment],
            };
          }
          return thread;
        })
      );
    };

    const onCommentUpdated = (data: { comment: any }) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === data.comment.id ? { ...t, ...data.comment } : t))
      );
    };

    const onCommentDeleted = (data: { commentId: string }) => {
      setThreads((prev) => prev.filter((t) => t.id !== data.commentId));
    };

    const onCommentResolved = (data: { comment: any }) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === data.comment.id ? { ...t, ...data.comment } : t))
      );
    };

    socket.on(REALTIME_EVENTS.COMMENT_CREATED, onCommentCreated);
    socket.on(REALTIME_EVENTS.COMMENT_REPLY_CREATED, onReplyCreated);
    socket.on(REALTIME_EVENTS.COMMENT_UPDATED, onCommentUpdated);
    socket.on(REALTIME_EVENTS.COMMENT_DELETED, onCommentDeleted);
    socket.on(REALTIME_EVENTS.COMMENT_RESOLVED, onCommentResolved);

    return () => {
      socket.off(REALTIME_EVENTS.COMMENT_CREATED, onCommentCreated);
      socket.off(REALTIME_EVENTS.COMMENT_REPLY_CREATED, onReplyCreated);
      socket.off(REALTIME_EVENTS.COMMENT_UPDATED, onCommentUpdated);
      socket.off(REALTIME_EVENTS.COMMENT_DELETED, onCommentDeleted);
      socket.off(REALTIME_EVENTS.COMMENT_RESOLVED, onCommentResolved);
    };
  }, [socket]);

  // Mention autocomplete logic
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, isReplyId?: string) => {
    const text = e.target.value;
    if (isReplyId) {
      setReplyInputs((prev) => ({ ...prev, [isReplyId]: text }));
    } else {
      setNewCommentBody(text);
    }

    const words = text.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const q = lastWord.slice(1);
      setMentionQuery(q);
      setShowMentionPicker(true);
      setPickerIndex(0);
      if (isReplyId) setActiveReplyId(isReplyId);
      else setActiveReplyId(null);
    } else {
      setShowMentionPicker(false);
    }
  };

  const selectMention = (member: WorkspaceMember, isReplyId?: string) => {
    const displayName = member.user.name || member.user.email.split("@")[0];
    const text = isReplyId ? replyInputs[isReplyId] || "" : newCommentBody;
    const words = text.split(/\s/);
    words[words.length - 1] = `@${displayName} `;
    const newText = words.join(" ");

    if (isReplyId) {
      setReplyInputs((prev) => ({ ...prev, [isReplyId]: newText }));
      setReplyMentionedIds((prev) => ({
        ...prev,
        [isReplyId]: [...(prev[isReplyId] || []), member.userId],
      }));
    } else {
      setNewCommentBody(newText);
      setMentionedIds((prev) => [...prev, member.userId]);
    }

    setShowMentionPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Submit root comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    try {
      const res = await apiPost(`/api/projects/${projectId}/comments`, {
        body: newCommentBody,
        mentionedUserIds: mentionedIds,
      });

      if (res.success) {
        setNewCommentBody("");
        setMentionedIds([]);
      } else {
        addToast({ title: "Error", message: res.message || "Failed to post comment", type: "error" });
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Error", message: "Rate limit exceeded or error occurred while comment post", type: "error" });
    }
  };

  // Submit reply comment
  const handleSubmitReply = async (parentId: string) => {
    const body = replyInputs[parentId];
    if (!body || !body.trim()) return;

    try {
      const res = await apiPost(`/api/projects/${projectId}/comments`, {
        body,
        parentId,
        mentionedUserIds: replyMentionedIds[parentId] || [],
      });

      if (res.success) {
        setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
        setReplyMentionedIds((prev) => ({ ...prev, [parentId]: [] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve comment thread
  const handleResolve = async (commentId: string) => {
    try {
      await apiPost(`/api/projects/${projectId}/comments/${commentId}/resolve`);
    } catch (err) {
      console.error(err);
    }
  };

  // Reopen comment thread
  const handleReopen = async (commentId: string) => {
    try {
      await apiPost(`/api/projects/${projectId}/comments/${commentId}/reopen`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete comment
  const handleDelete = async () => {
    if (!commentToDelete) return;
    try {
      await apiDelete(`/api/projects/${projectId}/comments/${commentToDelete}`);
      addToast({ title: "Deleted", message: "Comment deleted successfully.", type: "success" });
    } catch (err) {
      console.error(err);
      addToast({ title: "Error", message: "Failed to delete comment.", type: "error" });
    } finally {
      setCommentToDelete(null);
    }
  };

  // Filters threads
  const filteredThreads = threads.filter((thread) => {
    if (filter === "active") return !thread.isResolved;
    if (filter === "resolved") return thread.isResolved;
    return true;
  });

  // Filter members list by query
  const filteredMembers = members.filter((m) => {
    const name = (m.user.name || "").toLowerCase();
    const email = m.user.email.toLowerCase();
    const q = mentionQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="flex h-full w-80 flex-col border-l border-white/10 bg-zinc-950/70 backdrop-blur-xl transition-all duration-300">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-zinc-200">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-sm">Project Comments</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 p-2 gap-1">
        {(["active", "resolved", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 rounded-md py-1 text-xs font-semibold capitalize transition-all ${
              filter === t
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading comments...</div>
        ) : filteredThreads.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">No {filter} comments.</div>
        ) : (
          filteredThreads.map((thread) => {
            const threadInitials = thread.author.name
              ? thread.author.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : thread.author.email.slice(0, 2).toUpperCase();

            return (
              <div
                key={thread.id}
                className="flex flex-col gap-2 rounded-lg border border-white/5 bg-zinc-900/40 p-3"
              >
                {/* Main Comment Head */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {thread.author.image ? (
                      <img
                        src={thread.author.image}
                        alt="Author"
                        className="h-6 w-6 rounded-full bg-zinc-800"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700 text-[10px] font-bold text-white">
                        {threadInitials}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-200">
                        {thread.author.name || thread.author.email.split("@")[0]}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {thread.isResolved ? (
                      <button
                        onClick={() => handleReopen(thread.id)}
                        title="Reopen Comment"
                        className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResolve(thread.id)}
                        title="Resolve Comment"
                        className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {(user?.id === thread.authorId ||
                      user?.id === projectOwnerId ||
                      ["owner", "admin"].includes(currentUserRole || "")) && (
                      <button
                        onClick={() => setCommentToDelete(thread.id)}
                        title="Delete Thread"
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-zinc-300 pl-8 leading-relaxed break-words whitespace-pre-line">
                  {thread.body}
                </p>

                {thread.isResolved && (
                  <div className="ml-8 mt-1 rounded bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400">
                    Resolved by {thread.resolvedBy?.name || "Member"}
                  </div>
                )}

                {/* Replies */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2 border-l border-white/5 pl-3">
                    {thread.replies.map((reply) => {
                      const repInitials = reply.author.name
                        ? reply.author.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : reply.author.email.slice(0, 2).toUpperCase();

                      return (
                        <div key={reply.id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {reply.author.image ? (
                                <img
                                  src={reply.author.image}
                                  alt="Replier"
                                  className="h-4.5 w-4.5 rounded-full bg-zinc-800"
                                />
                              ) : (
                                <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-700 text-[8px] font-bold text-white">
                                  {repInitials}
                                </div>
                              )}
                              <span className="text-[10px] font-semibold text-zinc-300">
                                {reply.author.name || reply.author.email.split("@")[0]}
                              </span>
                            </div>
                            {(user?.id === reply.authorId ||
                              user?.id === projectOwnerId ||
                              ["owner", "admin"].includes(currentUserRole || "")) && (
                              <button
                                onClick={() => setCommentToDelete(reply.id)}
                                className="text-zinc-600 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 pl-6 leading-relaxed break-words whitespace-pre-line">
                            {reply.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Form */}
                {!thread.isResolved && (
                  <div className="ml-8 mt-2 flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="Reply..."
                      value={replyInputs[thread.id] || ""}
                      onChange={(e) => {
                        // Mimic mention search in reply inputs
                        const text = e.target.value;
                        setReplyInputs((prev) => ({ ...prev, [thread.id]: text }));
                        
                        const words = text.split(/\s/);
                        const lastWord = words[words.length - 1];
                        if (lastWord.startsWith("@")) {
                          setMentionQuery(lastWord.slice(1));
                          setShowMentionPicker(true);
                          setPickerIndex(0);
                          setActiveReplyId(thread.id);
                        } else {
                          // Hide if not typing mention
                          if (activeReplyId === thread.id) setShowMentionPicker(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmitReply(thread.id);
                        }
                      }}
                      className="flex-1 rounded-md bg-zinc-950 border border-white/10 px-2 py-1 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSubmitReply(thread.id)}
                      className="p-1 rounded-md bg-zinc-850 hover:bg-indigo-600 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Mention Picker (Absolute relative to footer form or active component) */}
      {showMentionPicker && filteredMembers.length > 0 && (
        <div className="absolute bottom-20 left-4 z-[9999] max-h-40 w-72 overflow-y-auto rounded-lg border border-white/10 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md">
          {filteredMembers.map((member, idx) => (
            <button
              key={member.id}
              onClick={() => selectMention(member, activeReplyId || undefined)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-zinc-200 transition-colors ${
                pickerIndex === idx ? "bg-indigo-600 text-white" : "hover:bg-white/5"
              }`}
            >
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name || "Member"}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[8px] font-bold">
                  {member.user.name ? member.user.name[0].toUpperCase() : "M"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold">
                  {member.user.name || member.user.email.split("@")[0]}
                </span>
                <span className="text-[10px] text-zinc-400">{member.user.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sidebar Footer Form */}
      <form onSubmit={handleSubmitComment} className="border-t border-white/10 p-4 flex flex-col gap-2 bg-zinc-900/30">
        <textarea
          ref={textareaRef}
          placeholder="Type a comment... Use @ to mention"
          value={newCommentBody}
          onChange={(e) => handleTextareaChange(e)}
          className="w-full resize-none rounded-lg border border-white/10 bg-zinc-950/80 p-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none h-16"
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-zinc-500">
            {mentionedIds.length > 0 ? `${mentionedIds.length} users mentioned` : ""}
          </span>
          <button
            type="submit"
            disabled={!newCommentBody.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3 w-3" />
            <span>Comment</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={!!commentToDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
}
