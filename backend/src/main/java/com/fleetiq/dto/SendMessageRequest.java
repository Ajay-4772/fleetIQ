package com.fleetiq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    @NotBlank(message = "Message content must not be blank")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    public SendMessageRequest() {}

    public SendMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
