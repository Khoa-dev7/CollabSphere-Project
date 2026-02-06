import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import TaskModal from "../components/TaskModal";
import api from "../api";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Task Card Component
function SortableTaskCard({ task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        High: '#ef4444',
        Medium: '#f59e0b',
        Low: '#22c55e'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card task-card"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ flex: 1 }}>{task.title}</strong>
                <button
                    title="Hỏi trợ lý AI về nhiệm vụ này"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px', opacity: 0.6
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Call global AI handler in Workspace
                        window.askAIGuidance(task);
                    }}
                >
                    ✨
                </button>
            </div>
            {task.description && (
                <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{task.description}</p>
            )}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: priorityColors[task.priority] || '#94a3b8' }}>
                    ● {task.priority}
                </span>
                <small style={{ opacity: 0.6 }}>#{task.id}</small>
            </div>
        </div>
    );
}

// Droppable Column Container
function DroppableColumn({ id, title, children, count }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const columnStyle = {
        background: isOver ? '#f1f5f9' : '#f8fafc',
        borderRadius: 12,
        padding: 12,
        minHeight: 400,
        transition: 'background-color 0.2s',
        border: isOver ? '2px dashed #94a3b8' : '2px solid transparent'
    };

    const statusDotColor = {
        Done: '#22c55e',
        Doing: '#3b82f6',
        Todo: '#94a3b8'
    };

    return (
        <div ref={setNodeRef} className="kanban-col" style={columnStyle}>
            <h5 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusDotColor[id] || '#94a3b8'
                }}></span>
                {title} ({count})
            </h5>
            {children}
        </div>
    );
}

export default function Workspace() {
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [aiGuidance, setAiGuidance] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Global handler for task guidance (called from child component)
    window.askAIGuidance = async (task) => {
        setLoadingAI(true);
        setAiGuidance({ title: task.title, response: "Đang yêu cầu AI hướng dẫn..." });
        try {
            const res = await api.post("/ai/task-guidance", {
                context: task.description || task.title,
                team_id: team?.id
            });
            setAiGuidance({ title: task.title, response: res.data.response });
        } catch (err) {
            setAiGuidance({ title: task.title, response: "Có lỗi xảy ra khi lấy hướng dẫn từ AI." });
        } finally {
            setLoadingAI(false);
        }
    };

    const userId = parseInt(localStorage.getItem("user_id"));
    const role = localStorage.getItem("role") || "";
    const r = role.toLowerCase();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            // Fetch team info with milestones
            const teamResponse = await api.get("/workspace/teams/me");
            setTeam(teamResponse.data);
            setMilestones(teamResponse.data.milestones || []);

            // Fetch team tasks
            const tasksResponse = await api.get(`/workspace/teams/${teamResponse.data.id}/tasks`);
            setTasks(tasksResponse.data);

            // Fetch team members
            const membersResponse = await api.get(`/workspace/teams/${teamResponse.data.id}/members`);
            setTeamMembers(membersResponse.data);

        } catch (err) {
            console.error("Workspace fetch error", err);
            if (err.response?.status === 404) {
                setError("Bạn chưa được phân vào nhóm nào. Vui lòng liên hệ giảng viên.");
            } else {
                setError("Không thể tải dữ liệu workspace. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isLeader = team && (team.leader_id === userId || r === "lecturer" || r === "head" || r === "admin");

    const toggleMilestone = async (m) => {
        if (!isLeader) return;
        try {
            await api.put(`/workspace/teams/${team.id}/milestones/${m.id}/status`, { is_done: !m.is_done });
            setMilestones(milestones.map(item => item.id === m.id ? { ...item, is_done: !item.is_done } : item));
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái milestone.");
        }
    };

    const handleTaskCreated = (newTask) => {
        setTasks([...tasks, newTask]);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id;
        const overIdStr = over.id;

        const activeTask = tasks.find(t => t.id === activeIdStr || t.id.toString() === activeIdStr.toString());
        if (!activeTask) return;

        let newStatus = activeTask.status;
        let newOrder = activeTask.order;

        const validColumns = ['Todo', 'Doing', 'Done'];

        if (validColumns.includes(overIdStr)) {
            // Dropped on a column
            newStatus = overIdStr;
            const tasksInColumn = tasks.filter(t => t.status === newStatus && t.id !== activeIdStr);
            newOrder = tasksInColumn.length;
        } else {
            // Dropped on another task
            const overTask = tasks.find(t => t.id === overIdStr || t.id.toString() === overIdStr.toString());
            if (overTask) {
                newStatus = overTask.status;
                const tasksInColumn = tasks.filter(t => t.status === newStatus);
                const overIndex = tasksInColumn.findIndex(t => t.id === overIdStr || t.id.toString() === overIdStr.toString());
                newOrder = overIndex;
            }
        }

        if (activeTask.status === newStatus && activeTask.order === newOrder) return;

        // Optimistic update
        const updatedTasks = tasks.map(t => {
            if (t.id === activeTask.id) {
                return { ...t, status: newStatus, order: newOrder };
            }
            return t;
        });
        setTasks(updatedTasks);

        // API call
        try {
            await api.put(`/workspace/tasks/${activeTask.id}/move`, {
                new_status: newStatus,
                new_order: newOrder
            });
            // Refresh to get correct order from backend
            const tasksResponse = await api.get(`/workspace/teams/${team.id}/tasks`);
            setTasks(tasksResponse.data);
        } catch (err) {
            console.error("Error moving task:", err);
            // Revert on error
            setTasks(tasks);
            alert("Không thể di chuyển nhiệm vụ. Vui lòng thử lại.");
        }
    };

    const handleDragOver = (event) => {
        // Optional: Add visual feedback during drag
    };

    if (loading) {
        return (
            <Layout title="Workspace">
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Workspace">
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <button className="btn primary" onClick={fetchData} style={{ marginTop: 16 }}>
                        Thử lại
                    </button>
                </div>
            </Layout>
        );
    }

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

    return (
        <Layout title="Workspace">
            <div className="workspace-header" style={{ marginBottom: 24 }}>
                <h2>{team?.name || "Team Workspace"}</h2>
                <p style={{ opacity: 0.7 }}>Quản lý tiến độ, công việc và mục tiêu của nhóm.</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                    {/* Main Content: Kanban Board */}
                    <div className="kanban">
                        <div className="row-between" style={{ marginBottom: 16 }}>
                            <h3>Bảng công việc</h3>
                            <button className="btn primary btn-sm" onClick={() => setShowTaskModal(true)}>
                                + Thêm nhiệm vụ
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            {['Todo', 'Doing', 'Done'].map(status => {
                                const columnTasks = getTasksByStatus(status);
                                return (
                                    <DroppableColumn
                                        key={status}
                                        id={status}
                                        title={status}
                                        count={columnTasks.length}
                                    >
                                        <SortableContext
                                            items={columnTasks.map(t => t.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div style={{ minHeight: 300 }}>
                                                {columnTasks.map(task => (
                                                    <SortableTaskCard key={task.id} task={task} />
                                                ))}
                                                {columnTasks.length === 0 && (
                                                    <div style={{
                                                        padding: 20,
                                                        textAlign: 'center',
                                                        opacity: 0.4,
                                                        fontSize: 13,
                                                        border: '1px dashed #e2e8f0',
                                                        borderRadius: 8,
                                                        marginTop: 10
                                                    }}>
                                                        Kéo thả nhiệm vụ vào đây
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DroppableColumn>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar: Milestones & Checkpoints */}
                    <div className="side-tools">
                        <div className="card" style={{ marginBottom: 24 }}>
                            <h4>Lộ trình (Milestones)</h4>
                            <div style={{ marginTop: 16 }}>
                                {milestones.length === 0 ? (
                                    <p style={{ fontSize: 13, opacity: 0.6 }}>Chưa có milestone nào</p>
                                ) : (
                                    milestones.map(m => (
                                        <div key={m.id} className="milestone-item" style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                                            <div
                                                onClick={() => toggleMilestone(m)}
                                                style={{
                                                    width: 20, height: 20, borderRadius: 4, border: '2px solid #3b82f6',
                                                    background: m.is_done ? '#3b82f6' : 'transparent',
                                                    cursor: isLeader ? 'pointer' : 'default',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12
                                                }}
                                            >
                                                {m.is_done && "✓"}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 14, textDecoration: m.is_done ? 'line-through' : 'none', opacity: m.is_done ? 0.6 : 1 }}>
                                                    {m.title}
                                                </div>
                                                {m.description && (
                                                    <small style={{ opacity: 0.6 }}>{m.description}</small>
                                                )}
                                                {isLeader && !m.is_done && <small style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => toggleMilestone(m)}>Đánh dấu hoàn thành</small>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h4>Checkpoints</h4>
                            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>Nộp báo cáo định kỳ cho Giảng viên.</p>
                            {isLeader && (
                                <button className="btn outline w-full" style={{ marginBottom: 12 }}>+ Tạo Checkpoint</button>
                            )}
                            <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
                                Chưa có checkpoint nào được tạo.
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="card task-card" style={{ opacity: 0.8 }}>
                            <strong>{tasks.find(t => t.id === activeId)?.title}</strong>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <TaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onTaskCreated={handleTaskCreated}
                teamId={team?.id}
                teamMembers={teamMembers}
            />

            <style>{`
                .task-card {
                    margin-bottom: 12px;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    cursor: grab;
                    background: white;
                    border-radius: 8px;
                }
                .task-card:active {
                    cursor: grabbing;
                }
                .task-card:hover {
                    border-color: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                .btn-sm {
                    padding: 4px 12px;
                    font-size: 13px;
                }
                .kanban-col {
                    transition: background-color 0.2s;
                }
            `}</style>
            {/* AI Guidance Modal */}
            {aiGuidance && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: 20
                }} onClick={() => setAiGuidance(null)}>
                    <div style={{
                        background: '#fff', padding: 30, borderRadius: 16, maxWidth: 600, width: '100%',
                        maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setAiGuidance(null)} style={{ position: 'absolute', top: 15, right: 15, border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
                        <h3 style={{ marginBottom: 15, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
                            ✨ Hướng dẫn từ AI cho: {aiGuidance.title}
                        </h3>
                        {loadingAI ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <div className="spinner-small" style={{ margin: '0 auto 10px', width: 30, height: 30, border: '3px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p>AI đang phân tích nhiệm vụ...</p>
                            </div>
                        ) : (
                            <div style={{ lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-wrap' }}>
                                {aiGuidance.response}
                            </div>
                        )}
                        <div style={{ marginTop: 25, textAlign: 'right' }}>
                            <button className="btn primary" onClick={() => setAiGuidance(null)}>Đã rõ</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </Layout>
    );
}
