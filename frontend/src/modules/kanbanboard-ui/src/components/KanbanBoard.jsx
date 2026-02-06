import { Card, Col, Row, Button, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useState } from "react";

const initialColumns = {
  todo: {
    title: "To Do",
    items: ["Define requirements", "Create wireframe"]
  },
  doing: {
    title: "In Progress",
    items: ["Design Kanban UI"]
  },
  done: {
    title: "Done",
    items: ["Project approved"]
  }
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState("");

  const handleDragEnd = (event, columnKey) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumns((prev) => {
        const items = prev[columnKey].items;
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return {
          ...prev,
          [columnKey]: {
            ...prev[columnKey],
            items: arrayMove(items, oldIndex, newIndex)
          }
        };
      });
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setColumns({
      ...columns,
      todo: {
        ...columns.todo,
        items: [...columns.todo.items, newTask]
      }
    });
    setNewTask("");
  };

  return (
    <>
      <div className="add-task">
        <Input
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addTask}
        >
          Add Task
        </Button>
      </div>

      <Row gutter={16}>
        {Object.entries(columns).map(([key, column]) => (
          <Col span={8} key={key}>
            <Card title={column.title} className="kanban-column">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, key)}
              >
                <SortableContext
                  items={column.items}
                  strategy={verticalListSortingStrategy}
                >
                  {column.items.map((item) => (
                    <Card
                      key={item}
                      style={{ marginBottom: 8 }}
                      draggable
                    >
                      {item}
                    </Card>
                  ))}
                </SortableContext>
              </DndContext>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
