import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SortableSectionItem({ id, section }: { id: string, section: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const { selectSection, selectedSectionId, toggleVisibility, removeSection, duplicateSection } = useBuilderStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedSectionId === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-2 mb-2 rounded border bg-zinc-900/50 ${isSelected ? 'border-violet-500' : 'border-zinc-800'} hover:border-zinc-700 transition-colors cursor-pointer`}
      onClick={() => selectSection(id)}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-zinc-500">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className={`text-sm truncate ${!section.visible ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
          {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={(e) => { e.stopPropagation(); toggleVisibility(id); }}>
          {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={(e) => { e.stopPropagation(); duplicateSection(id); }}>
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeSection(id); }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function SectionList() {
  const { builderData, reorderSections } = useBuilderStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!builderData) return null;

  const sections = [...builderData.sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {sections.map(section => (
            <SortableSectionItem key={section.id} id={section.id} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
