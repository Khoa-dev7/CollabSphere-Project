import NotificationBell from "./NotificationBell";

export default function Header({ title }) {
  return (
    <div className="header">
      <h2 className="page-title">{title}</h2>
      <NotificationBell />
    </div>
  );
}
