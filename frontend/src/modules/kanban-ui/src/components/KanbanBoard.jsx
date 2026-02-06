import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";

const initialColumns = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "1", title: "Define project scope" },
      { id: "2", title: "Create UML diagrams" },
    ],
  },
  {
    id: "doing",
    title: "In Progress",
    cards: [{ id: "3", title: "Develop Kanban UI" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "4", title: "Requirement analysis" }],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const fromCol = columns.find((c) =>
      c.cards.some((card) => card.id === active.id)
    );
    const toCol = columns.find((c) =>
      c.cards.some((card) => card.id === over.id)
    );

    if (!fromCol || !toCol) return;

    if (fromCol.id === toCol.id) {
      const oldIndex = fromCol.cards.findIndex(c => c.id === active.id);
      const newIndex = fromCol.cards.findIndex(c => c.id === over.id);

      const newCards = arrayMove(fromCol.cards, oldIndex, newIndex);

      setColumns(columns.map(c =>
        c.id === fromCol.id ? { ...c, cards: newCards } : c
      ));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 16 }}>
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
