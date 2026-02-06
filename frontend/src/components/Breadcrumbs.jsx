import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbMap = {
        "team": "Nhóm",
        "chat": "Trò chuyện",
        "documents": "Tài liệu",
        "workspace": "Workspace",
        "teams": "Quản lý nhóm",
        "whiteboard": "Bảng trắng",
        "meeting": "Họp",
        "ai-chat": "AI Assistant",
        "grading": "Chấm điểm",
        "timeline": "Timeline",
        "gantt": "Gantt",
        "profile": "Cá nhân",
        "activity": "Lịch sử",
        "admin": "Quản trị",
        "courses": "Môn học",
        "my-grades": "Điểm của tôi"
    };

    if (pathnames.length === 0) return null;

    return (
        <nav style={{ marginBottom: 20, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const label = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                return (
                    <React.Fragment key={to}>
                        <span>/</span>
                        {last ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{label}</span>
                        ) : (
                            <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>{label}</Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
