import { Card } from "antd";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ column }) {
  return (
    <Card
      title={column.title}
      style={{ width: 300, background: "#f5f5f5" }}
    >
      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
      </SortableContext>
    </Card>
  );
}
