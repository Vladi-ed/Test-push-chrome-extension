export async function getCatFact(): Promise<string> {
    try {
        const response = await fetch('https://catfact.ninja/fact');
        const data = await response.json();
        return data.fact;
    } catch (error) {
        console.error('Error fetching cat fact data:', error);
        return 'Error: No cat facts available';
    }
}