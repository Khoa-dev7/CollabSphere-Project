import { Checkbox } from "antd";
import { useState } from "react";

export default function TaskChecklist() {
  const [items, setItems] = useState([
    { text: "Design UI", done: false },
    { text: "Implement Modal", done: true },
  ]);

  const toggle = (index) => {
    const newItems = [...items];
    newItems[index].done = !newItems[index].done;
    setItems(newItems);
  };

  return (
    <>
      {items.map((item, index) => (
        <div key={index}>
          <Checkbox
            checked={item.done}
            onChange={() => toggle(index)}
          >
            {item.text}
          </Checkbox>
        </div>
      ))}
    </>
  );
}
