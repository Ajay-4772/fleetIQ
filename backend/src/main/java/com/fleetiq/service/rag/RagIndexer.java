package com.fleetiq.service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class RagIndexer {

    private static final Logger log = LoggerFactory.getLogger(RagIndexer.class);
    private final List<RagChunk> indexedChunks = new ArrayList<>();

    @PostConstruct
    public void init() {
        indexKnowledgeDocuments();
    }

    public synchronized void indexKnowledgeDocuments() {
        indexedChunks.clear();
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:knowledge/*.md");

            int chunkCount = 0;
            for (Resource resource : resources) {
                String filename = resource.getFilename();
                String content = readResource(resource);
                List<RagChunk> chunks = splitIntoChunks(filename, content);
                indexedChunks.addAll(chunks);
                chunkCount += chunks.size();
            }

            log.info("RAG Indexer successfully indexed {} chunks across knowledge base.", chunkCount);
        } catch (Exception e) {
            log.warn("RAG Indexer initialization warning: {}", e.getMessage());
        }
    }

    public List<RagChunk> getIndexedChunks() {
        return Collections.unmodifiableList(indexedChunks);
    }

    private String readResource(Resource resource) throws Exception {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    private List<RagChunk> splitIntoChunks(String docName, String text) {
        List<RagChunk> chunks = new ArrayList<>();
        String[] lines = text.split("\n");

        String currentHeader = docName;
        StringBuilder currentSection = new StringBuilder();

        for (String line : lines) {
            if (line.startsWith("## ") || line.startsWith("### ")) {
                if (currentSection.length() > 50) {
                    chunks.add(buildChunk(docName, currentHeader, currentSection.toString()));
                    currentSection.setLength(0);
                }
                currentHeader = line.replaceFirst("^#{2,3}\\s*", "").trim();
            } else {
                currentSection.append(line).append("\n");
            }
        }

        if (currentSection.length() > 20) {
            chunks.add(buildChunk(docName, currentHeader, currentSection.toString()));
        }

        return chunks;
    }

    private RagChunk buildChunk(String docName, String header, String body) {
        String id = UUID.randomUUID().toString();
        Set<String> keywords = extractKeywords(header + " " + body);
        return new RagChunk(id, docName, header, body.trim(), keywords);
    }

    private Set<String> extractKeywords(String text) {
        Set<String> set = new HashSet<>();
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9_\\-]", " ").split("\\s+");
        for (String token : tokens) {
            if (token.length() >= 3 && !STOP_WORDS.contains(token)) {
                set.add(token);
            }
        }
        return set;
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "this", "that", "from", "are", "have",
            "has", "been", "was", "were", "into", "onto", "under", "about", "which", "over"
    );
}
