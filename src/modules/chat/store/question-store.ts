import { apolloClientInstance } from "@/core/providers/apollo-wrapper";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { GET_USER_QUESTIONS_QUERY } from "../apollo/query/question";
import { Question } from "../types/api/question";

// Define the state shape
interface QuestionState {
  userQuestions: Question[];
  userSavedQuestions: Question[];
  userArchivedQuestions: Question[];
  isLoading: boolean;
  // Add pagination state for each tab
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  savedPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  archivedPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

// Define actions that can be performed on the state
interface QuestionActions {
  loadUserQuestions: (page?: number) => void;
  loadUserSavedQuestions: (query?: { isSaved: boolean }, page?: number) => void;
  loadUserArchivedQuestions: (page?: number) => void;
  loadNextPage: () => void;
  loadPrevPage: () => void;
  loadNextSavedPage: () => void;
  loadPrevSavedPage: () => void;
  loadNextArchivedPage: () => void;
  loadPrevArchivedPage: () => void;
  removeQuestion: (questionId: string) => void;
}

// Helper function to get the Apollo client safely
const getApolloClient = () => {
  // First try the imported instance
  if (apolloClientInstance) {
    return apolloClientInstance;
  }

  // Fallback to window.apolloClient if available
  if (typeof window !== "undefined" && window.apolloClient) {
    return window.apolloClient;
  }

  throw new Error(
    "Apollo client is not initialized yet. Please ensure authentication is complete."
  );
};

// Create the store
const useQuestionStore = create<QuestionState & QuestionActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      userQuestions: [],
      userSavedQuestions: [],
      userArchivedQuestions: [],
      isLoading: false,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: undefined,
        prevPage: undefined,
      },
      savedPagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: undefined,
        prevPage: undefined,
      },
      archivedPagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: undefined,
        prevPage: undefined,
      },

      // Actions
      loadUserQuestions: async (
        page: number = 1,
        query: { isSaved?: boolean } = {}
      ) => {
        try {
          set({
            isLoading: true,
            userQuestions: [], // Always clear for new page
          });

          // Then fetch all messages for this thread
          const client = getApolloClient();
          const result = await client.query({
            query: GET_USER_QUESTIONS_QUERY,
            variables: {
              filter: {
                isSaved: query.isSaved,
              },
              pagination: {
                page: page,
                limit: 10, // Adjust as needed
              },
            },
            // Removed fetchPolicy to use Apollo Client default (cache-first)
          });

          if (result.data?.getUserQuestions?.data) {
            const apiResults = result.data.getUserQuestions.data as Question[];
            const meta = result.data.getUserQuestions.meta;

            set({
              userQuestions: apiResults,
              pagination: {
                currentPage: meta.page,
                totalPages: meta.lastPage,
                totalItems: meta.total,
                itemsPerPage: meta.limit,
                hasNextPage: !!meta.nextPage,
                hasPrevPage: !!meta.prevPage,
                nextPage: meta.nextPage || undefined,
                prevPage: meta.prevPage || undefined,
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading user question:", error);
          set({ isLoading: false });
        }
      },
      loadUserSavedQuestions: async (
        query: { isSaved?: boolean } = {},
        page: number = 1
      ) => {
        try {
          set({
            isLoading: true,
            userSavedQuestions: [], // Always clear for new page
          });

          // Then fetch all messages for this thread
          const client = getApolloClient();
          const variables = {
            filter: {
              isSaved: true, // Always load saved questions
            },
            pagination: {
              page: page,
              limit: 10, // Adjust as needed
            },
          };

          const result = await client.query({
            query: GET_USER_QUESTIONS_QUERY,
            variables,
            // Removed fetchPolicy to use Apollo Client default (cache-first)
          });

          if (result.data?.getUserQuestions?.data) {
            const apiResults = result.data.getUserQuestions.data as Question[];
            const meta = result.data.getUserQuestions.meta;

            set({
              userSavedQuestions: apiResults,
              savedPagination: {
                currentPage: meta.page,
                totalPages: meta.lastPage,
                totalItems: meta.total,
                itemsPerPage: meta.limit,
                hasNextPage: !!meta.nextPage,
                hasPrevPage: !!meta.prevPage,
                nextPage: meta.nextPage || undefined,
                prevPage: meta.prevPage || undefined,
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading user question:", error);
          set({ isLoading: false });
        }
      },
      loadUserArchivedQuestions: async (page: number = 1) => {
        try {
          set({
            isLoading: true,
            userArchivedQuestions: [], // Always clear for new page
          });

          // Then fetch all messages for this thread
          const client = getApolloClient();
          const variables = {
            filter: {
              isSaved: false, // Load non-saved questions (archive)
            },
            pagination: {
              page: page,
              limit: 10, // Adjust as needed
            },
          };

          const result = await client.query({
            query: GET_USER_QUESTIONS_QUERY,
            variables,
            // Removed fetchPolicy to use Apollo Client default (cache-first)
          });

          if (result.data?.getUserQuestions?.data) {
            const apiResults = result.data.getUserQuestions.data as Question[];
            const meta = result.data.getUserQuestions.meta;

            set({
              userArchivedQuestions: apiResults,
              archivedPagination: {
                currentPage: meta.page,
                totalPages: meta.lastPage,
                totalItems: meta.total,
                itemsPerPage: meta.limit,
                hasNextPage: !!meta.nextPage,
                hasPrevPage: !!meta.prevPage,
                nextPage: meta.nextPage || undefined,
                prevPage: meta.prevPage || undefined,
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading archived questions:", error);
          set({ isLoading: false });
        }
      },
      loadNextPage: () => {
        const { pagination } = get();
        if (pagination.hasNextPage && pagination.nextPage) {
          get().loadUserQuestions(pagination.nextPage);
        }
      },
      loadPrevPage: () => {
        const { pagination } = get();
        if (pagination.hasPrevPage && pagination.prevPage) {
          get().loadUserQuestions(pagination.prevPage);
        }
      },
      loadNextSavedPage: () => {
        const { savedPagination } = get();
        if (savedPagination.hasNextPage && savedPagination.nextPage) {
          get().loadUserSavedQuestions(
            { isSaved: true },
            savedPagination.nextPage
          );
        }
      },
      loadPrevSavedPage: () => {
        const { savedPagination } = get();
        if (savedPagination.hasPrevPage && savedPagination.prevPage) {
          get().loadUserSavedQuestions(
            { isSaved: true },
            savedPagination.prevPage
          );
        }
      },
      loadNextArchivedPage: () => {
        const { archivedPagination } = get();
        if (archivedPagination.hasNextPage && archivedPagination.nextPage) {
          get().loadUserArchivedQuestions(archivedPagination.nextPage);
        }
      },
      loadPrevArchivedPage: () => {
        const { archivedPagination } = get();
        if (archivedPagination.hasPrevPage && archivedPagination.prevPage) {
          get().loadUserArchivedQuestions(archivedPagination.prevPage);
        }
      },
      removeQuestion: (questionId: string) => {
        const { userQuestions, userSavedQuestions, userArchivedQuestions } =
          get();

        set({
          userQuestions: userQuestions.filter(
            (question) => question._id !== questionId
          ),
          userSavedQuestions: userSavedQuestions.filter(
            (question) => question._id !== questionId
          ),
          userArchivedQuestions: userArchivedQuestions.filter(
            (question) => question._id !== questionId
          ),
        });
      },
    }),
    { name: "question-store" }
  )
);

export const useQuestion = () => {
  const {
    userQuestions,
    loadUserQuestions,
    userSavedQuestions,
    loadUserSavedQuestions,
    userArchivedQuestions,
    loadUserArchivedQuestions,
    loadNextPage,
    loadPrevPage,
    loadNextSavedPage,
    loadPrevSavedPage,
    loadNextArchivedPage,
    loadPrevArchivedPage,
    removeQuestion,
    pagination,
    savedPagination,
    archivedPagination,
    isLoading,
  } = useQuestionStore();

  return {
    userQuestions,
    loadUserQuestions,
    userSavedQuestions,
    loadUserSavedQuestions,
    userArchivedQuestions,
    loadUserArchivedQuestions,
    loadNextPage,
    loadPrevPage,
    loadNextSavedPage,
    loadPrevSavedPage,
    loadNextArchivedPage,
    loadPrevArchivedPage,
    removeQuestion,
    pagination,
    savedPagination,
    archivedPagination,
    isLoading,
  };
};
