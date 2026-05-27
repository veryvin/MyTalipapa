import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getToken } from '../utils/auth';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const token = getToken();

  const fetchNotifications = () => {
    if (!token) return;
    fetch('/api/contractor/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(err => console.error('Failed to fetch notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/contractor/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleAsRead = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/contractor/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button 
        className="notif-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notif-dot"></span>
        )}
      </button>

      {open && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden font-sans"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-[#1a5c2a] hover:text-[#154d23] transition-all bg-none border-none cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-400">
                <span>🔔 No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => {
                const handleItemClick = async () => {
                  if (!n.read) {
                    await markSingleAsRead(n._id);
                  }
                  setOpen(false);
                  if (n.link) {
                    navigate(n.link);
                  }
                };
                return (
                  <div 
                    key={n._id} 
                    onClick={handleItemClick}
                    className={`px-4 py-3 text-left transition-all cursor-pointer ${
                      n.read ? 'bg-white hover:bg-gray-50' : 'bg-green-50/30 hover:bg-green-50/55'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className={`text-xs font-bold ${n.read ? 'text-gray-700' : 'text-[#1a5c2a]'}`}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 bg-[#1a5c2a] rounded-full mt-1 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-gray-500 leading-normal mb-1">{n.message}</p>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
