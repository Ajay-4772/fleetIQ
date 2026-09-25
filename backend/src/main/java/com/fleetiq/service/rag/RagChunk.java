package com.fleetiq.service.rag;

import java.util.Set;

public class RagChunk {
    private String id;
    private String documentName;
    private String sectionTitle;
    private String content;
    private Set<String> keywords;
    private double score;

    public RagChunk() {}

    public RagChunk(String id, String documentName, String sectionTitle, String content, Set<String> keywords) {
        this.id = id;
        this.documentName = documentName;
        this.sectionTitle = sectionTitle;
        this.content = content;
        this.keywords = keywords;
        this.score = 0.0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Set<String> getKeywords() { return keywords; }
    public void setKeywords(Set<String> keywords) { this.keywords = keywords; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
}
