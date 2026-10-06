export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model =
        process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: {
                    parts: [{ text }],
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding request failed: ${errorText}`);
    }

    const data = (await response.json()) as {
        embedding?: {
            values?: number[];
        };
    };

    const values = data.embedding?.values;

    if (!values || values.length === 0) {
        throw new Error('Embedding response did not contain values');
    }

    return values;
}