'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings2, LayoutDashboard } from 'lucide-react';

export interface DashboardConfig {
    showKPIs: boolean;
    showFinancialChart: boolean;
    showConversionFunnel: boolean;
    showInstructorRatings: boolean;
    showVehicleEfficiency: boolean;
    showPaymentMethods: boolean;
    showClassStats: boolean;
    showInstructorVolume: boolean;
    showClassTypes: boolean;
    showHeatmap: boolean;
    showExpenseBreakdown: boolean;
    showAdvancedKPIs: boolean;
}

const defaultConfig: DashboardConfig = {
    showKPIs: true,
    showFinancialChart: true,
    showConversionFunnel: true,
    showInstructorRatings: true,
    showVehicleEfficiency: true,
    showPaymentMethods: true,
    showClassStats: true,
    showInstructorVolume: true,
    showClassTypes: true,
    showHeatmap: true,
    showExpenseBreakdown: true,
    showAdvancedKPIs: true,
};

interface DashboardCustomizerProps {
    config: DashboardConfig;
    onConfigChange: (config: DashboardConfig) => void;
}

export function DashboardCustomizer({ config, onConfigChange }: DashboardCustomizerProps) {
    const handleToggle = (key: keyof DashboardConfig) => {
        onConfigChange({
            ...config,
            [key]: !config[key],
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Personalizar Vista
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Personalizar Dashboard</SheetTitle>
                    <SheetDescription>
                        Elige qué tarjetas y gráficos quieres ver en tu reporte.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Métricas Principales</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showKPIs">Resumen Financiero</Label>
                            <Switch id="showKPIs" checked={config.showKPIs} onCheckedChange={() => handleToggle('showKPIs')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showAdvancedKPIs">KPIs Avanzados (NUEVO)</Label>
                            <Switch id="showAdvancedKPIs" checked={config.showAdvancedKPIs} onCheckedChange={() => handleToggle('showAdvancedKPIs')} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Gráficos Financieros</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showFinancialChart">Ingresos vs Gastos</Label>
                            <Switch id="showFinancialChart" checked={config.showFinancialChart} onCheckedChange={() => handleToggle('showFinancialChart')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showPaymentMethods">Métodos de Pago</Label>
                            <Switch id="showPaymentMethods" checked={config.showPaymentMethods} onCheckedChange={() => handleToggle('showPaymentMethods')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showExpenseBreakdown">Desglose de Gastos (NUEVO)</Label>
                            <Switch id="showExpenseBreakdown" checked={config.showExpenseBreakdown} onCheckedChange={() => handleToggle('showExpenseBreakdown')} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Operativo y Calidad</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showConversionFunnel">Embudo de Alumnos</Label>
                            <Switch id="showConversionFunnel" checked={config.showConversionFunnel} onCheckedChange={() => handleToggle('showConversionFunnel')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showHeatmap">Mapa de Calor (NUEVO)</Label>
                            <Switch id="showHeatmap" checked={config.showHeatmap} onCheckedChange={() => handleToggle('showHeatmap')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showClassStats">Estado de Clases</Label>
                            <Switch id="showClassStats" checked={config.showClassStats} onCheckedChange={() => handleToggle('showClassStats')} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Personal y Flota</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showInstructorRatings">Satisfacción Instructores</Label>
                            <Switch id="showInstructorRatings" checked={config.showInstructorRatings} onCheckedChange={() => handleToggle('showInstructorRatings')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showInstructorVolume">Volumen por Instructor</Label>
                            <Switch id="showInstructorVolume" checked={config.showInstructorVolume} onCheckedChange={() => handleToggle('showInstructorVolume')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showVehicleEfficiency">Eficiencia Vehicular</Label>
                            <Switch id="showVehicleEfficiency" checked={config.showVehicleEfficiency} onCheckedChange={() => handleToggle('showVehicleEfficiency')} />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function useDashboardConfig() {
    const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dashboard_config_v1');
        if (saved) {
            try {
                setConfig({ ...defaultConfig, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Error parsing dashboard config', e);
            }
        }
        setLoaded(true);
    }, []);

    const updateConfig = (newConfig: DashboardConfig) => {
        setConfig(newConfig);
        localStorage.setItem('dashboard_config_v1', JSON.stringify(newConfig));
    };

    return { config, updateConfig, loaded };
}
