import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      console.log('fetch');
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const socket = useAuthStore.getState().socket;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      set({ messages: [...messages, res.data] });

      // ✅ LIVE MESSAGE EMIT
      socket.emit('sendMessage', {
        ...res.data,
        receiverId: selectedUser._id,
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    console.log('🟢 Subscribing to newMessage');

    // 🔥 FIRST REMOVE OLD LISTENER
    socket.off('newMessage');

    socket.on('newMessage', (newMessage) => {
      console.log('🔵 newMessage event fired:', newMessage._id);
      const senderId =
        typeof newMessage.senderId === 'object'
          ? newMessage.senderId._id
          : newMessage.senderId;

      const isMessageSentFromSelectedUser =
        String(senderId) === String(selectedUser._id);

      if (!isMessageSentFromSelectedUser) return;

      set((state) => {
        const exists = state.messages.find((msg) => msg._id === newMessage._id);

        if (exists) return state;

        return {
          messages: [...state.messages, newMessage],
        };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off('newMessage');
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
