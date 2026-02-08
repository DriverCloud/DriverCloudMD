'use client';

import { Search, X, Loader2, Calendar } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchClasses } from "@/app/(auth)/dashboard/classes/actions";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface SearchResult {
    id: string;
    scheduled_date: string;
    start_time: string;
    class_number: number;
    student: {
        first_name: string;
        last_name: string;
    };
}

export function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [query, setQuery] = useState(searchParams.get('search') || "");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Determine placeholder based on path
    const getPlaceholder = () => {
        if (pathname.includes('/students')) return "Buscar estudiante...";
        if (pathname.includes('/vehicles')) return "Buscar vehículo...";
        if (pathname.includes('/instructors')) return "Buscar instructor...";
        if (pathname.includes('/classes')) return "Buscar clase por alumno...";
        return "Buscar...";
    };

    // Update internal state if URL changes (e.g. clearing search)
    useEffect(() => {
        setQuery(searchParams.get('search') || "");
    }, [searchParams]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Search Effect for Classes
    useEffect(() => {
        const performSearch = async () => {
            // Only search classes if we are in the classes module
            if (pathname.includes('/classes') && query.length >= 2) {
                setIsLoading(true);
                setShowResults(true);
                try {
                    const response = await searchClasses(query);
                    if (response.success && response.data) {
                        setResults(response.data as any);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                if (query.length < 2) setShowResults(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300); // Debounce
        return () => clearTimeout(timeoutId);

    }, [query, pathname]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Standard search behavior for other modules
        if (!pathname.includes('/classes')) {
            if (query.trim()) {
                router.push(`${pathname}?search=${encodeURIComponent(query)}`, { scroll: false });
            } else {
                router.push(`${pathname}`, { scroll: false });
            }
            setShowResults(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setShowResults(false);
        if (!pathname.includes('/classes')) {
            router.push(`${pathname}`, { scroll: false });
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        setQuery(""); // Clear query or keep it? User might want to search again. Clearing seems better/cleaner after navigation.
        setResults([]);
        setShowResults(false);
        // Navigate to the date of the class
        // Assuming /dashboard/classes?date=YYYY-MM-DD works to change the calendar view
        router.push(`/dashboard/classes?date=${result.scheduled_date}`);
    };

    return (
        <div ref={wrapperRef} className="relative group w-full max-w-xl">
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (pathname.includes('/classes') && query.length >= 2) setShowResults(true);
                    }}
                    className="block w-full pl-10 pr-10 py-2 border-none rounded-lg leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background sm:text-sm transition-all"
                    placeholder={getPlaceholder()}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown Results */}
            {showResults && pathname.includes('/classes') && (
                <div className="absolute z-[100] mt-1 w-full bg-popover rounded-md border shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                    {results.length > 0 ? (
                        <div className="py-1 max-h-[300px] overflow-y-auto">
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex items-center gap-3 text-sm"
                                >
                                    <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {format(parseISO(result.scheduled_date), "EEEE d 'de' MMMM", { locale: es })}
                                            </span>
                                            {result.class_number && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium">
                                                    Clase #{result.class_number}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-muted-foreground text-xs flex gap-2">
                                            <span>{result.start_time.slice(0, 5)} hs</span>
                                            <span>•</span>
                                            <span>{result.student.first_name} {result.student.last_name}</span>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        query.length >= 2 && !isLoading && (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                No se encontraron clases próximas.
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
