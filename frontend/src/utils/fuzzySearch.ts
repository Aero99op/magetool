/**
 * Enhanced Fuzzy Search Utility (Offline Juggad v2)
 * Tokenized search for better natural language understanding.
 */

export interface SearchResult<T> {
    item: T;
    score: number; // 0 is perfect match, higher is worse
}

export class FuzzySearch<T> {
    private items: T[];
    private keys: { name: string; weight: number }[];

    constructor(items: T[], options: { keys: { name: string; weight: number }[] }) {
        this.items = items;
        this.keys = options.keys;
    }

    // Levenshtein distance for fuzzy matching
    private levenshtein(a: string, b: string): number {
        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = Array.from({ length: a.length + 1 }, () =>
            Array(b.length + 1).fill(0)
        );

        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    }

    // Tokenize input into words
    private tokenize(input: string): string[] {
        return input.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    }

    search(pattern: string): SearchResult<T>[] {
        if (!pattern) return [];

        const inputTokens = this.tokenize(pattern);
        if (inputTokens.length === 0) return [];

        const results: SearchResult<T>[] = this.items.map((item) => {
            let bestScore = 1; // Default worst score

            this.keys.forEach((key) => {
                const value = (item as any)[key.name];
                const keywordList: string[] = Array.isArray(value) ? value : (typeof value === 'string' ? [value] : []);

                keywordList.forEach((keyword: string) => {
                    const kwLower = keyword.toLowerCase();
                    const kwTokens = this.tokenize(kwLower);

                    // Check each input token against each keyword token
                    inputTokens.forEach((inputToken) => {
                        // Direct containment (best match)
                        if (kwLower.includes(inputToken)) {
                            const matchScore = 0.05; // Almost perfect
                            bestScore = Math.min(bestScore, matchScore * key.weight);
                        } else if (inputToken.includes(kwLower)) {
                            // Input token contains keyword
                            const matchScore = 0.1;
                            bestScore = Math.min(bestScore, matchScore * key.weight);
                        } else {
                            // Fuzzy match for typos
                            kwTokens.forEach((kwToken) => {
                                const dist = this.levenshtein(inputToken, kwToken);
                                const maxLen = Math.max(inputToken.length, kwToken.length);
                                // Allow up to 2 character edits for short words, or ~30% for longer
                                if (dist <= 2 || dist / maxLen < 0.35) {
                                    const fuzzyScore = 0.2 + (dist / maxLen) * 0.3;
                                    bestScore = Math.min(bestScore, fuzzyScore * key.weight);
                                }
                            });
                        }
                    });
                });
            });

            return { item, score: bestScore };
        });

        return results
            .filter((r) => r.score < 0.5) // Stricter threshold
            .sort((a, b) => a.score - b.score);
    }
}
