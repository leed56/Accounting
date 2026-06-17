'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useTranslation } from './language-switcher';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  queryKeys,
} from '@bizmanager/supabase-client';
import { formatDateTime } from '@bizmanager/utils';

export function NotificationsPanel() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications(profile?.id ?? ''),
    queryFn: () => getNotifications(profile!.id),
    enabled: !!profile?.id,
    refetchInterval: 60_000,
  });

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(profile.id) });
      }
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(profile.id) });
      }
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getHref = (relatedType: string | null) => {
    if (relatedType === 'payment_request') return '/approvals';
    return '/dashboard';
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={t('notifications')}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-elevated border border-border z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">{t('notifications')}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                className="text-xs text-primary font-medium"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>
          {!notifications?.length ? (
            <p className="px-4 py-8 text-sm text-gray-500 text-center">{t('noNotifications')}</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id} className={!n.is_read ? 'bg-primary-light/20' : ''}>
                  <Link
                    href={getHref(n.related_type)}
                    onClick={() => {
                      if (!n.is_read) markReadMutation.mutate(n.id);
                      setOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
