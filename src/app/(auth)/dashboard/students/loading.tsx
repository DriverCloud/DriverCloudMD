import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function Loading() {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Page Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-40 mb-2" /> {/* Title */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-64" /> {/* Subtitle */}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" /> {/* Export Button */}
                    <Skeleton className="h-10 w-40" /> {/* Create Button */}
                </div>
            </div>

            {/* Filters and Search Toolbar Skeleton */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-start w-full">
                    <Skeleton className="h-10 w-full md:w-80" /> {/* Search */}
                </div>

                <div className="flex flex-wrap items-center gap-2 border rounded-xl p-1.5 shadow-sm overflow-x-auto">
                    {/* Dummy Filter Pills */}
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Students Table Skeleton */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]"><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(8)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="w-16 h-5 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
