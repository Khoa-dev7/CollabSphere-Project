import React from 'react';

export default function EmptyState({ icon = "Empty", title = "Chưa có dữ liệu", message = "Hiện chưa có thông tin nào để hiển thị ở đây.", action }) {
    const iconMap = {
        "Task": "📋",
        "Doc": "📄",
        "Team": "👥",
        "Notice": "🔔",
        "Empty": "📦",
        "Search": "🔍"
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            opacity: 0.8
        }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{iconMap[icon] || icon}</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{title}</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14, maxWidth: 300 }}>{message}</p>
            {action && (
                <button
                    className="btn primary"
                    onClick={action.onClick}
                    style={{ marginTop: 20 }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
