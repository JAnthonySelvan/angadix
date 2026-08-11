import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../features/notifications/notificationThunks';
import {
  selectNotifications,
  selectUnreadCount,
} from '../../features/notifications/notificationSlice';

export const NotificationBell = ({ isOverHero = false }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(fetchNotifications(1));
    }
  }, [isOpen, dispatch, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-colors focus:outline-none ${
          isOverHero
            ? 'bg-white/25 dark:bg-white/10 hover:bg-white/45 dark:hover:bg-white/20 text-[#0a2540] dark:text-white border border-white/30 dark:border-white/20 backdrop-blur-md shadow-xs'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={t('nav.notifications', 'Notifications')}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary-600 dark:text-primary-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t('notifications.title', 'Notifications')}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                    {unreadCount} {t('notifications.new', 'new')}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  <span>{t('notifications.markAllRead', 'Mark all read')}</span>
                </button>
              )}
            </div>

            {/* List Content */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Sparkles size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-500">
                    {t('notifications.emptyTitle', 'No notifications yet')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t('notifications.emptySub', "We'll notify you when your orders update or promos launch.")}
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.type === 'order_status'
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <AlertCircle size={16} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => {
                            if (!n.isRead) dispatch(markNotificationRead(n._id));
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline pt-1"
                        >
                          <span>{t('notifications.viewDetails', 'View Details')}</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => dispatch(markNotificationRead(n._id))}
                          className="p-1 text-slate-400 hover:text-primary-600 rounded"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => dispatch(deleteNotification(n._id))}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
