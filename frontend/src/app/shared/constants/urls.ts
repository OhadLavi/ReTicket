const BASE_URL = 'http://localhost:5000';

export const URLS = {
    EVENT: {
        GET_ALL: `${BASE_URL}/api/events`,
        GET_BY_ID: (id: string) => `${BASE_URL}/api/events/id/${id}`,
        GET_BY_SEARCH_TERM: (searchTerm: string) => `${BASE_URL}/api/events/search/${searchTerm}`,
        GET_EVENT_TRANSCRIBE_AUDIO_URL: `${BASE_URL}/api/events/transcribeAudio/`,
        GET_CHECK_IN_WAITING_LIST_URL: (eventId: string, userId: string) => `${BASE_URL}/api/events/checkInWaitingList/${eventId}/${userId}`,
        GET_ADD_TO_WAITING_LIST_URL: (id: string) => `${BASE_URL}/api/events/id/${id}/waitingList`,
        GET_REMOVE_FROM_WAITING_LIST_URL: (eventId: string, userId: string) => `${BASE_URL}/api/events/id/${eventId}/waitingList/${userId}`
    },
    USER: {
        GET_ALL: `${BASE_URL}/api/users`,
        GET_BY_ID: (id: string) => `${BASE_URL}/api/users/${id}`,
        GET_BY_SEARCH_TERM: (searchTerm: string) => `${BASE_URL}/api/users/search/${searchTerm}`,
        GET_USER_UPDATE_URL: (id: string) => `${BASE_URL}/api/users/update/${id}`,
        GET_USER_PHOTO_UPDATE_URL: (id: string) => `${BASE_URL}/api/users/update/photo/${id}`
    },
    LOGIN: {
        GET_LOGIN_URL: `${BASE_URL}/api/users/login`,
    },
    REGISTER: {
        GET_REGISTER_URL: `${BASE_URL}/api/users/register/`
    },
    ORDER: {
        GET_ORDER_URL: `${BASE_URL}/api/orders/`,
        GET_ORDER_CREATE_URL: `${BASE_URL}/api/orders/create/`,
        GET_ORDER_NEW_URL: `${BASE_URL}/api/orders/newOrder/`,
        GET_ORDER_PAY_URL: `${BASE_URL}/api/orders/pay/`,
        GET_ORDER_TRACK_URL: (id:string) => `${BASE_URL}/api/orders/track/${id}`
    },
    TICKET: {
        GET_USER_TICKETS_URL: (userId: string) => `${BASE_URL}/api/tickets/getUserTickets/${userId}`,
        GET_TICKET_UPLOAD_URL: `${BASE_URL}/api/tickets/upload/`,
        GET_TICKET_SUBMIT_URL: `${BASE_URL}/api/tickets/submit/`,
        GET_TICKET_REVIEW_URL: (id:string) => `${BASE_URL}/api/tickets/review/${id}`,
        GET_TICKET_DOWNLOAD_URL: (id:string) => `${BASE_URL}/api/tickets/getTicketFile/${id}`
    }
};

//        GET_TICKETS_URL: (userId:string) => `${BASE_URL}/api/tickets/getUserTickets/${userId}`,