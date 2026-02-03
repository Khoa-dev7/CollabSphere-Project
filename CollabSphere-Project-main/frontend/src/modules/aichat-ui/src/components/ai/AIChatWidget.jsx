import { Button, Input, Card, Avatar } from "antd";
import { MessageOutlined, SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello 👋 I’m CollabSphere AI Assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const aiText =
        "I understand your question. For Project-Based Learning, I suggest breaking tasks into milestones and tracking individual contributions clearly.";
      typeEffect(aiText);
    }, 1000);
  };

 
  const typeEffect = (text) => {
    let i = 0;
    let current = "";
    setTyping(true);

    const interval = setInterval(() => {
      current += text[i];
      i++;

      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.from === "ai_typing") {
          newMessages.pop();
        }
        return [...newMessages, { from: "ai_typing", text: current }];
      });

      if (i === text.length) {
        clearInterval(interval);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages.pop();
          return [...newMessages, { from: "ai", text }];
        });
        setTyping(false);
      }
    }, 30);
  };

  return (
    <>
      {/* Floating button */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      />

      {/* Chat box */}
      {open && (
        <Card
          title="AI Assistant"
          size="small"
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 320,
            height: 420,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
          bodyStyle={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
          }}
        >
          {/* Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                marginBottom: 8,
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.from !== "user" && (
                <Avatar icon={<RobotOutlined />} size="small" />
              )}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "6px 10px",
                  borderRadius: 8,
                  marginLeft: msg.from !== "user" ? 6 : 0,
                  marginRight: msg.from === "user" ? 6 : 0,
                  background:
                    msg.from === "user" ? "#1677ff" : "#f5f5f5",
                  color: msg.from === "user" ? "#fff" : "#000",
                  fontSize: 13,
                }}
              >
                {msg.text}
              </div>
              {msg.from === "user" && (
                <Avatar icon={<UserOutlined />} size="small" />
              )}
            </div>
          ))}

          {typing && (
            <div style={{ fontStyle: "italic", fontSize: 12 }}>
              AI is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </Card>
      )}

      {/* Input */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 320,
            display: "flex",
            gap: 8,
            zIndex: 1001,
          }}
        >
          <Input
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={sendMessage}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
        </div>
      )}
    </>
  );
}
