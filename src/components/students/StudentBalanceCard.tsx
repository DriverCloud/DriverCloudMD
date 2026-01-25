'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentBalanceCardProps {
    balance: {
        balance: number;
        total_debt?: number;
        total_paid?: number;
    };
}

export function StudentBalanceCard({ balance }: StudentBalanceCardProps) {
    return (
        <Card className="w-full h-fit">
            <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">Cuenta Corriente</span>
                </div>
                <div className={cn("text-4xl font-bold",
                    balance.balance < 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                    ${balance.balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Deuda Total: ${balance.total_debt?.toLocaleString() || 0}
                    <br />
                    Pagado: ${balance.total_paid?.toLocaleString() || 0}
                </p>
            </CardContent>
        </Card>
    );
}
