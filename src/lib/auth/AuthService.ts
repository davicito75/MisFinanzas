import type { User, UserProfile } from '../../types';

class AuthService {
    private USERS_KEY = 'fingmail_users';
    private SESSION_KEY = 'fingmail_session';

    private getUsers(): User[] {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    }

    private saveUsers(users: User[]) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    async register(name: string, email: string, password: string): Promise<UserProfile> {
        const users = this.getUsers();

        if (users.find(u => u.email === email)) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            settings: {
                currency: 'CLP',
                timezone: 'America/Santiago'
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        const { password: _, ...profile } = newUser;
        this.setSession(profile);
        return profile;
    }

    async login(email: string, password: string): Promise<UserProfile> {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Credenciales inválidas. Por favor intenta de nuevo.');
        }

        const { password: _, ...profile } = user;
        this.setSession(profile);
        return profile;
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }

    getCurrentUser(): UserProfile | null {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    private setSession(profile: UserProfile) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(profile));
    }

    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        const current = this.getCurrentUser();
        if (!current) throw new Error('No hay sesión activa.');

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === current.id);

        if (userIndex === -1) throw new Error('Usuario no encontrado.');

        // Update user record
        const updatedUser = {
            ...users[userIndex],
            ...updates,
            settings: {
                ...users[userIndex].settings,
                ...(updates.settings || {})
            }
        };

        users[userIndex] = updatedUser;
        this.saveUsers(users);

        // Update session
        const { password: _, ...profile } = updatedUser;
        this.setSession(profile);

        return profile;
    }
}

export const authService = new AuthService();
