import axiosClient from "./axiosClient";

const chatApi = {
    /** GET /api/chat/:matchId/history?page=1&limit=50 */
    getHistory: (matchId, { page = 1, limit = 50 } = {}) =>
        axiosClient.get(`/api/chat/${matchId}/history`, { params: { page, limit } }),

    /** POST /api/chat/:matchId/delete  — vote to delete chat */
    voteDelete: (matchId) =>
        axiosClient.post(`/api/chat/${matchId}/delete`),
};

export default chatApi;
