import type { User } from 'types';
import { defineStore } from 'pinia';

type authState = {
  user: User | null;
  token: string | null;
};

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): authState => {
    return {
      user: null,
      token: null,
    };
  },
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
  },
  actions: {
    authenticate(token: string) {
      if (token) {
        const user = JSON.parse(atob(token.split('.')[1])) as User;
        this.token = token;
        this.user = user;
      }
    },
    logOut() {
      this.user = null;
      this.token = null;
      window.location.href = '/';
    },
  },
});
