package com.fleetiq.service.rag;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final RagIndexer ragIndexer;

    public RagService(RagIndexer ragIndexer) {
        this.ragIndexer = ragIndexer;
    }

    public List<RagChunk> retrieveRelevantChunks(String query, int topK) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String lowerQuery = query.toLowerCase();
        List<String> queryTokens = Arrays.stream(lowerQuery.replaceAll("[^a-z0-9_\\-]", " ").split("\\s+"))
                .filter(t -> t.length() >= 3)
                .collect(Collectors.toList());

        List<RagChunk> allChunks = ragIndexer.getIndexedChunks();
        List<RagChunk> scoredChunks = new ArrayList<>();

        for (RagChunk chunk : allChunks) {
            double score = 0.0;
            String lowerTitle = chunk.getSectionTitle().toLowerCase();
            String lowerContent = chunk.getContent().toLowerCase();

            // Boost 1: Exact fault code or term in section title
            for (String token : queryTokens) {
                if (lowerTitle.contains(token)) {
                    score += 5.0;
                }
                if (chunk.getKeywords().contains(token)) {
                    score += 2.0;
                }
                if (lowerContent.contains(token)) {
                    score += 1.0;
                }
            }

            if (score > 0.0) {
                RagChunk scored = new RagChunk(
                        chunk.getId(),
                        chunk.getDocumentName(),
                        chunk.getSectionTitle(),
                        chunk.getContent(),
                        chunk.getKeywords()
                );
                scored.setScore(score);
                scoredChunks.add(scored);
            }
        }

        scoredChunks.sort(Comparator.comparingDouble(RagChunk::getScore).reversed());
        return scoredChunks.stream().limit(topK).collect(Collectors.toList());
    }
}
