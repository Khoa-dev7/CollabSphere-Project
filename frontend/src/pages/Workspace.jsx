import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

/**
 * Component thẻ nhiệm vụ (Task Card) có khả năng sắp xếp (Sortable).
 * Sử dụng thư viện dnd-kit để xử lý kéo thả.
 */
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
                {/* Nút bấm để hỏi AI hướng dẫn thực hiện nhiệm vụ này */}
                <button
                    title="Hỏi trợ lý AI về nhiệm vụ này"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px', opacity: 0.6
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Gọi hàm xử lý AI toàn cục được định nghĩa trong Workspace
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

/**
 * Component cột Kanban (Droppable Column) nơi có thể thả các nhiệm vụ vào.
 */
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

/**
 * Trang Workspace Dự án - Trái tim của việc quản lý dự án nhóm.
 * Bao gồm bảng Kanban, quản lý Milestone và tích hợp Trợ lý AI.
 */
export default function Workspace() {
    // 1. State quản lý dữ liệu chính
    const [searchParams] = useSearchParams();
    const urlTeamId = searchParams.get("teamId");

    const [team, setTeam] = useState(null); // Thông tin nhóm hiện tại
    const [tasks, setTasks] = useState([]); // Toàn bộ nhiệm vụ của nhóm
    const [columns, setColumns] = useState({ // Cấu trúc cột Kanban và các nhiệm vụ trong mỗi cột
        Todo: { id: 'Todo', title: 'Cần làm', taskIds: [] },
        Doing: { id: 'Doing', title: 'Đang làm', taskIds: [] },
        Done: { id: 'Done', title: 'Hoàn thành', taskIds: [] },
    });
    const [teamMembers, setTeamMembers] = useState([]); // Thành viên trong nhóm
    const [milestones, setMilestones] = useState([]); // Các mốc quan trọng của dự án
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(""); // Thông báo lỗi
    const [teamId, setTeamId] = useState(null); // ID của nhóm hiện tại
    const [teamInfo, setTeamInfo] = useState(null); // Thông tin chi tiết của nhóm

    // 2. State điều khiển UI (Modal và Phân loại)
    const [showTaskModal, setShowTaskModal] = useState(false); // Trạng thái hiển thị modal thêm task
    const [activeId, setActiveId] = useState(null); // ID của task đang được kéo
    const [selectedTask, setSelectedTask] = useState(null); // Task đang được chọn để chỉnh sửa
    const [filterPriority, setFilterPriority] = useState('All'); // Lọc theo độ ưu tiên

    // 3. State cho Trợ lý AI
    const [aiGuidance, setAiGuidance] = useState(null); // Nội dung hướng dẫn từ AI
    const [loadingAI, setLoadingAI] = useState(false); // Trạng thái đang đợi AI phản hồi
    const [showAIModal, setShowAIModal] = useState(false); // Trạng thái hiển thị modal AI
    const [currentAITask, setCurrentAITask] = useState(null); // Nhiệm vụ hiện tại đang hỏi AI

    // Cấu hình các cảm biến cho kéo thả (chuột và bàn phím)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Tránh việc vô tình kéo khi chỉ nhấn click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Lấy toàn bộ dữ liệu cần thiết cho Workspace từ API khi component mount
    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    // Hàm global để các Component con có thể gọi trợ lý AI
    useEffect(() => {
        window.askAIGuidance = (task) => {
            setCurrentAITask(task);
            handleAIGuidance(task); // Gọi hàm xử lý AI
        };
    }, []);

    // Hàm để lấy tất cả dữ liệu cần thiết cho workspace
    const fetchWorkspaceData = async () => {
        setLoading(true);
        setError("");
        try {
            // 1. Lấy thông tin nhóm và lộ trình (milestones)
            const teamResponse = await api.get(`/workspace/teams/me${urlTeamId ? `?team_id=${urlTeamId}` : ""}`);
            setTeam(teamResponse.data);
            setMilestones(teamResponse.data.milestones || []);
            const tId = teamResponse.data.id;
            setTeamId(tId);
            setTeamInfo(teamResponse.data);

            // 2. Lấy danh sách nhiệm vụ của nhóm
            const tasksResponse = await api.get(`/workspace/teams/${teamResponse.data.id}/tasks`);
            const allTasks = tasksResponse.data || [];
            setTasks(allTasks);

            // 3. Lấy thông tin thành viên nhóm
            const membersResponse = await api.get(`/workspace/teams/${teamResponse.data.id}/members`);
            setTeamMembers(membersResponse.data);

            // 4. Phân loại nhiệm vụ vào các cột Kanban
            updateColumns(allTasks);

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

    // Hàm cập nhật cấu trúc cột Kanban dựa trên danh sách nhiệm vụ
    const updateColumns = (allTasks) => {
        const newColumns = {
            Todo: { id: 'Todo', title: 'Cần làm', taskIds: [] },
            Doing: { id: 'Doing', title: 'Đang làm', taskIds: [] },
            Done: { id: 'Done', title: 'Hoàn thành', taskIds: [] },
        };

        allTasks.sort((a, b) => a.order - b.order).forEach(task => {
            const statusKey = task.status; // Giữ nguyên cách viết (Todo, Doing, Done)
            if (newColumns[statusKey]) {
                newColumns[statusKey].taskIds.push(task.id);
            }
        });
        setColumns(newColumns);
    };

    // Hàm xử lý yêu cầu hướng dẫn từ AI
    const handleAIGuidance = async (task) => {
        setLoadingAI(true);
        setAiGuidance({ title: task.title, response: "Đang yêu cầu AI hướng dẫn..." });
        setShowAIModal(true); // Hiển thị modal AI
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

    // Kiểm tra xem người dùng có quyền quản lý hay không
    const isLeader = team && (team.leader_id === userId || r === "lecturer" || r === "head" || r === "admin");

    // Đánh dấu hoàn thành hoặc chưa hoàn thành một Milestone
    const toggleMilestone = async (m) => {
        if (!isLeader) return;
        try {
            await api.put(`/workspace/teams/${team.id}/milestones/${m.id}/status`, { is_done: !m.is_done });
            setMilestones(milestones.map(item => item.id === m.id ? { ...item, is_done: !item.is_done } : item));
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái milestone.");
        }
    };

    // Callback khi một nhiệm vụ mới được tạo thành công từ modal
    const handleTaskCreated = (newTask) => {
        setTasks([...tasks, newTask]);
        updateColumns([...tasks, newTask]); // Cập nhật lại cột Kanban
    };

    // Hàm tìm cột chứa một task cụ thể
    const findContainer = (id) => {
        if (id in columns) {
            return id;
        }
        return Object.keys(columns).find((key) => columns[key].taskIds.includes(id));
    };

    const [startContainer, setStartContainer] = useState(null); // Container ban đầu khi bắt đầu kéo

    const handleDragStart = (event) => {
        const id = event.active.id;
        setActiveId(id);
        setStartContainer(findContainer(id));
    };

    function handleDragOver(event) {
        // ... (giữ nguyên logic chuyển cột tức thời trên UI)
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer].taskIds;
            const overItems = prev[overContainer].taskIds;
            const activeIndex = activeItems.indexOf(activeId);
            const overIndex = overItems.indexOf(overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length;
            } else {
                const isBelowLastItem = over && over.rect && event.active.rect.current.translated &&
                    event.active.rect.current.translated.top > over.rect.top + over.rect.height;
                const modifier = isBelowLastItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
            }

            return {
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    taskIds: activeItems.filter((item) => item !== activeId),
                },
                [overContainer]: {
                    ...prev[overContainer],
                    taskIds: [
                        ...overItems.slice(0, newIndex),
                        activeId,
                        ...overItems.slice(newIndex),
                    ],
                },
            };
        });
    }

    async function handleDragEnd(event) {
        const { active, over } = event;
        const id = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            setStartContainer(null);
            return;
        }

        const currentContainer = findContainer(id);
        const overIndex = columns[currentContainer].taskIds.indexOf(id);

        // Kiểm tra xem container đã thay đổi hay vị trí trong cùng container đã thay đổi
        if (currentContainer !== startContainer || columns[currentContainer].taskIds.indexOf(id) !== -1) {
            try {
                // Chúng ta lấy vị trí hiện tại của task trong state columns đã được update bởi handleDragOver
                await api.put(`/workspace/tasks/${id}/move`, {
                    new_status: currentContainer,
                    new_order: overIndex
                });

                // Cập nhật lại danh sách nhiệm vụ cục bộ (để đồng bộ status string trong task object)
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentContainer, order: overIndex } : t));

                // Fetch lại để chắc chắn backend và frontend khớp nhau hoàn toàn
                fetchWorkspaceData();
            } catch (err) {
                console.error("Failed to update task position", err);
                alert("Lỗi: Không thể lưu vị trí nhiệm vụ mới. Vui lòng thử lại.");
                fetchWorkspaceData();
            }
        }

        setActiveId(null);
        setStartContainer(null);
    }

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
                    <button className="btn primary" onClick={fetchWorkspaceData} style={{ marginTop: 16 }}>
                        Thử lại
                    </button>
                </div>
            </Layout>
        );
    }

    // Helper: Lọc và sắp xếp nhiệm vụ theo trạng thái
    const getTasksByStatus = (status) => {
        const taskIdsInColumn = columns[status]?.taskIds || [];
        return taskIdsInColumn
            .map(id => tasks.find(t => t.id === id))
            .filter(Boolean); // Lọc bỏ các task không tìm thấy
    };

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
                    {/* KHU VỰC CHÍNH: Bảng Kanban 3 cột */}
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

                    {/* THANH BÊN: Lộ trình (Milestones) & Checkpoints */}
                    <div className="side-tools">
                        <div className="card" style={{ marginBottom: 24 }}>
                            <h4>Lộ trình (Milestones)</h4>
                            <div style={{ marginTop: 16 }}>
                                {milestones.length === 0 ? (
                                    <p style={{ fontSize: 13, opacity: 0.6 }}>Chưa có mốc thời gian nào được thiết lập.</p>
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
                            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>Nộp báo cáo định kỳ cho Giảng viên hướng dẫn.</p>
                            {isLeader && (
                                <button className="btn outline w-full" style={{ marginBottom: 12 }}>+ Tạo Checkpoint mới</button>
                            )}
                            <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
                                Chưa có báo cáo checkpoint nào.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overlay hiển thị khi đang thực hiện kéo một task */}
                <DragOverlay>
                    {activeId ? (
                        <div className="card task-card" style={{ opacity: 0.8 }}>
                            <strong>{tasks.find(t => t.id === activeId)?.title}</strong>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal để chỉnh sửa hoặc tạo mới nhiệm vụ */}
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

            {/* Modal hướng dẫn chi tiết từ AI cho một nhiệm vụ cụ thể */}
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
                            ✨ Trợ lý AI khuyên bạn: {aiGuidance.title}
                        </h3>
                        {loadingAI ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <div className="spinner-small" style={{ margin: '0 auto 10px', width: 30, height: 30, border: '3px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p>Đang phân tích nhiệm vụ...</p>
                            </div>
                        ) : (
                            <div style={{ lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-wrap' }}>
                                {aiGuidance.response}
                            </div>
                        )}
                        <div style={{ marginTop: 25, textAlign: 'right' }}>
                            <button className="btn primary" onClick={() => setAiGuidance(null)}>Tôi đã hiểu</button>
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
