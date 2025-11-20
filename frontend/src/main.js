import './style.css';
import { CentroidTetris } from './game.js';
import { WebletAuth } from '../../lib/weblet-auth.js';
import { WebletStorage } from '../../lib/weblet-storage.js';

async function init() {
  const auth = new WebletAuth();
  const storage = new WebletStorage();

  // Attempt login
  const user = await auth.login();
  console.log('Logged in as:', user);

  const game = new CentroidTetris({ auth, storage });

  // Leaderboard Logic
  const modal = document.getElementById('leaderboardModal');
  const btn = document.getElementById('leaderboardBtn');
  const close = document.querySelector('.close-modal');
  const tabs = document.querySelectorAll('.tab-btn');
  const list = document.getElementById('leaderboardList');

  btn.onclick = () => {
    modal.classList.remove('hidden');
    loadLeaderboard('top10');
  };

  close.onclick = () => {
    modal.classList.add('hidden');
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.classList.add('hidden');
    }
  };

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadLeaderboard(tab.dataset.tab);
    };
  });

  async function loadLeaderboard(type) {
    list.innerHTML = '<div class="loading">Loading...</div>';

    try {
      let data;
      if (type === 'top10') {
        data = await storage.getTop10();
      } else if (type === 'top5') {
        const res = await fetch('http://localhost:3000/api/leaderboard/top5');
        data = await res.json();
      } else if (type === 'personal') {
        // Mock personal rank
        const res = await fetch(`http://localhost:3000/api/leaderboard/rank/${user.id}`);
        data = await res.json();
        // Wrap in array for display
        data = data.rank ? [data] : [];
      }

      renderLeaderboard(data, type);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      list.innerHTML = '<div class="loading">Failed to load data.</div>';
    }
  }

  function renderLeaderboard(data, type) {
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="loading">No scores yet.</div>';
      return;
    }

    list.innerHTML = data.map((item, index) => `
            <div class="leaderboard-item">
                <span class="rank">#${item.rank || index + 1}</span>
                <span class="name">${item.userId === user.id ? 'You' : 'Player ' + item.userId.substr(0, 4)}</span>
                <span class="score">${item.score}</span>
            </div>
        `).join('');
  }
}

init();
