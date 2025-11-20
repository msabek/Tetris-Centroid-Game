export class WebletAuth {
    constructor() {
        this.user = null;
    }

    async login() {
        // Mock login
        this.user = { id: 'user_123', name: 'Player 1' };
        return this.user;
    }

    async logout() {
        this.user = null;
    }

    getUser() {
        return this.user;
    }
}
