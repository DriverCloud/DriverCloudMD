'use client'

import { Calendar, DollarSign, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from './NotificationBell'
import { Button } from '@/components/ui/button'

interface NotificationItemProps {
    notification: Notification
    onRead?: () => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'class':
                return <Calendar className="h-4 w-4 text-blue-500" />
            case 'payment':
                return <DollarSign className="h-4 w-4 text-green-500" />
            case 'alert':
                return <AlertCircle className="h-4 w-4 text-orange-500" />
        }
    }

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation()
        onRead?.()
    }

    return (
        <div
            className={cn(
                "p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer group relative",
                !notification.read && "bg-blue-50/50"
            )}
        >
            <div className="flex gap-3">
                <div className="mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-none", notification.read && "text-muted-foreground")}>
                            {notification.title}
                        </p>
                        {!notification.read && onRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 hover:bg-blue-100 hover:text-blue-600"
                                onClick={handleMarkAsRead}
                                title="Marcar como leída"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 absolute right-4 top-4 group-hover:opacity-0 transition-opacity" />
                        )}
                    </div>
                    <p className={cn("text-sm text-muted-foreground", notification.read && "opacity-70")}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {notification.time}
                    </p>
                </div>
            </div>
        </div>
    )
}
