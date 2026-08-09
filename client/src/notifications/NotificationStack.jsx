import { Notification } from './Notification.jsx'
import './notifications.css'

export function NotificationStack({ notifications, onDismiss }) {
  return (
    <div className="notification-stack">
      {notifications.map((n) => (
        <Notification key={n.id} id={n.id} message={n.message} duration={n.duration} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
