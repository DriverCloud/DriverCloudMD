import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface CreditBalanceCardProps {
    credits: number;
}

export function CreditBalanceCard({ credits }: CreditBalanceCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Créditos Disponibles
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">{credits}</div>
                <p className="text-xs text-muted-foreground">
                    Para agendar clases prácticas
                </p>
            </CardContent>
        </Card>
    );
}
