package com.fleetiq.service.assistant;

import jakarta.validation.constraints.NotBlank;

public class AssistantQueryRequest {

    @NotBlank(message = "Question cannot be blank")
    private String question;

    public AssistantQueryRequest() {}

    public AssistantQueryRequest(String question) {
        this.question = question;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}
