'use client'

import { Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from './NotificationBell'

interface NotificationItemProps {
    notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
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

    return (
        <div
            className={cn(
                "p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
                !notification.read && "bg-blue-50/50"
            )}
        >
            <div className="flex gap-3">
                <div className="mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">
                            {notification.title}
                        </p>
                        {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
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
