import { useMutation, useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../api';

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  incidents: () => ['knowledge', 'incidents'] as const,
  fixes: () => ['knowledge', 'fixes'] as const,
  stats: () => ['knowledge', 'stats'] as const,
};

export function usePastIncidents() {
  return useQuery({ queryKey: knowledgeKeys.incidents(), queryFn: knowledgeApi.listPastIncidents });
}

export function usePastFixes() {
  return useQuery({ queryKey: knowledgeKeys.fixes(), queryFn: knowledgeApi.listPastFixes });
}

export function useKnowledgeStats() {
  return useQuery({ queryKey: knowledgeKeys.stats(), queryFn: knowledgeApi.stats });
}

export function useKnowledgeSearch() {
  return useMutation({
    mutationFn: ({ query, limit, types }: { query: string; limit?: number; types?: string[] }) =>
      knowledgeApi.search(query, limit, types),
  });
}

export function useSubmitKnowledgeFeedback() {
  return useMutation({
    mutationFn: ({
      itemId,
      itemType,
      helpful,
      comments,
    }: {
      itemId: string;
      itemType: string;
      helpful: boolean;
      comments?: string;
    }) => knowledgeApi.submitFeedback(itemId, itemType, helpful, comments),
  });
}
