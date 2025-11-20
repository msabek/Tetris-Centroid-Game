export class WebletStorage {
    async saveScore(score) {
        // Mock save to backend
        console.log('Saving score:', score);
        return fetch('http://localhost:3000/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user_123', score })
        });
    }

    async getTop10() {
        const res = await fetch('http://localhost:3000/api/leaderboard/top10');
        return res.json();
    }
}
