import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'enquiry' | 'message';
  title: string;
  description: string;
  link: string;
  created_at: string;
  read: boolean;
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time updates for unread counts
    const channel = supabase
      .channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enquiries',
        },
        () => {
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.user',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Get unread enquiries (status = 'new')
      const { data: newEnquiries } = await supabase
        .from('enquiries')
        .select('id, name, service_required, created_at, status')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get conversations with unread messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, enquiry_id, unread_admin_count, last_message_at, enquiries(name)')
        .gt('unread_admin_count', 0)
        .order('last_message_at', { ascending: false })
        .limit(10);

      const notifs: Notification[] = [];

      // Add enquiry notifications
      newEnquiries?.forEach((enq) => {
        notifs.push({
          id: `enq_${enq.id}`,
          type: 'enquiry',
          title: 'New Enquiry',
          description: `${enq.name} - ${enq.service_required}`,
          link: `/admin/enquiries/${enq.id}`,
          created_at: enq.created_at,
          read: false,
        });
      });

      // Add message notifications
      conversations?.forEach((conv) => {
        const enquiry = conv.enquiries as any;
        notifs.push({
          id: `msg_${conv.id}`,
          type: 'message',
          title: `${conv.unread_admin_count} unread message${conv.unread_admin_count > 1 ? 's' : ''}`,
          description: `From ${enquiry?.name || 'Customer'}`,
          link: `/admin/enquiries/${conv.enquiry_id}`,
          created_at: conv.last_message_at || new Date().toISOString(),
          read: false,
        });
      });

      // Sort by date
      notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    navigate(notification.link);
    setIsOpen(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.type === 'enquiry' ? (
                          <Badge variant="default" className="text-xs">New Enquiry</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Message</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.description}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
