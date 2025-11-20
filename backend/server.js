const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock database
const scores = [];

app.get('/api/leaderboard/top10', (req, res) => {
    const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(top10);
});

app.get('/api/leaderboard/top5', (req, res) => {
    const top5 = scores.sort((a, b) => b.score - a.score).slice(0, 5);
    res.json(top5);
});

app.get('/api/leaderboard/rank/:userId', (req, res) => {
    const { userId } = req.params;
    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.userId === userId);

    if (rank === -1) {
        res.json({ rank: null, score: 0, userId });
    } else {
        res.json({ rank: rank + 1, score: sortedScores[rank].score, userId });
    }
});

app.post('/api/score', (req, res) => {
    const { userId, score } = req.body;
    // Simple update: keep highest score for user
    const existingIndex = scores.findIndex(s => s.userId === userId);
    if (existingIndex !== -1) {
        if (scores[existingIndex].score < score) {
            scores[existingIndex].score = score;
            scores[existingIndex].date = new Date();
        }
    } else {
        scores.push({ userId, score, date: new Date() });
    }
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
