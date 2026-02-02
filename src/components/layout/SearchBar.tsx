'use client';

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [query, setQuery] = useState(searchParams.get('search') || "");

    // Determine placeholder based on path
    const getPlaceholder = () => {
        if (pathname.includes('/students')) return "Buscar estudiante...";
        if (pathname.includes('/vehicles')) return "Buscar vehículo...";
        if (pathname.includes('/instructors')) return "Buscar instructor...";
        if (pathname.includes('/classes')) return "Buscar clase...";
        return "Buscar...";
    };

    // Update internal state if URL changes (e.g. clearing search)
    useEffect(() => {
        setQuery(searchParams.get('search') || "");
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Keep the search on the current path/module
        // Assuming the module page handles ?search=...
        if (query.trim()) {
            router.push(`${pathname}?search=${encodeURIComponent(query)}`, { scroll: false });
        } else {
            router.push(`${pathname}`, { scroll: false });
        }
    };

    const handleClear = () => {
        setQuery("");
        router.push(`${pathname}`, { scroll: false });
    };

    return (
        <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border-none rounded-lg leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background sm:text-sm transition-all"
                placeholder={getPlaceholder()}
            />
            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </form>
    );
}
