package com.fleetiq;

import com.fleetiq.service.assistant.AiAssistantService;
import com.fleetiq.service.assistant.AssistantResponseDto;
import com.fleetiq.service.rag.RagChunk;
import com.fleetiq.service.rag.RagService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AiAssistantAndRagTests {

    @Autowired
    private RagService ragService;

    @Autowired
    private AiAssistantService assistantService;

    @Test
    @DisplayName("Case A1: RAG retrieves accurate diagnostic chunk for P0300")
    void testRagRetrievalForP0300() {
        List<RagChunk> chunks = ragService.retrieveRelevantChunks("What is P0300?", 2);
        assertFalse(chunks.isEmpty(), "Should retrieve at least 1 matching chunk for P0300");

        RagChunk top = chunks.get(0);
        assertTrue(top.getContent().contains("Misfire") || top.getSectionTitle().contains("P0300"),
                "Top chunk must explain cylinder misfire");
    }

    @Test
    @DisplayName("Case A2: AI Assistant answers fault definition query with RAG sources")
    void testAssistantFaultCodeInquiry() {
        AssistantResponseDto response = assistantService.processQuestion("What does P0300 mean?");
        assertNotNull(response.getAnswer());
        assertTrue(response.getAnswer().contains("P0300") || response.getAnswer().contains("Misfire"));
        assertTrue(response.getSources().stream().anyMatch(s -> s.contains("fault-codes.md")));
        assertEquals("DETERMINISTIC_GROUNDED", response.getAiProviderStatus());
    }

    @Test
    @DisplayName("Case A3: AI Assistant answers live fleet health query using real database numbers")
    void testAssistantFleetHealthInquiry() {
        AssistantResponseDto response = assistantService.processQuestion("Explain current fleet health");
        assertNotNull(response.getAnswer());
        assertTrue(response.getAnswer().contains("Fleet Health Index"));
        assertEquals("LIVE_DATA", response.getQueryType());
        assertTrue(response.getSources().stream().anyMatch(s -> s.contains("DashboardAggregationService") || s.contains("Database")));
    }

    @Test
    @DisplayName("Case A4: AI Assistant answers maintenance inquiry with live vehicle data")
    void testAssistantMaintenanceInquiry() {
        AssistantResponseDto response = assistantService.processQuestion("Which vehicles require immediate maintenance?");
        assertNotNull(response.getAnswer());
        assertEquals("LIVE_DATA", response.getQueryType());
        assertNotNull(response.getRecommendedAction());
    }

    @Autowired
    private com.fleetiq.repository.VehicleRepository vehicleRepository;

    @Test
    @DisplayName("Case A5: Hybrid query combining live vehicle status and diagnostic reasoning")
    void testAssistantHybridVehicleQuery() {
        if (vehicleRepository.findById("VH-1001").isEmpty()) {
            com.fleetiq.model.Vehicle v = new com.fleetiq.model.Vehicle();
            v.setId("VH-1001");
            v.setVin("1HGCR2F83HA001001");
            v.setMake("Toyota");
            v.setModel("Camry");
            v.setYear(2023);
            v.setFuelType("Hybrid");
            v.setStatus("ACTIVE");
            v.setBatteryHealthPct(82.0);
            v.setOilLifePct(12.0);
            v.setTirePressurePsi(31.0);
            v.setMileageKm(34000L);
            v.setCreatedAt(java.time.Instant.now());
            vehicleRepository.save(v);
        }

        AssistantResponseDto response = assistantService.processQuestion("Why is VH-1001 high priority?");
        assertNotNull(response.getAnswer());
        assertTrue(response.getAnswer().contains("VH-1001"));
        assertEquals("HYBRID", response.getQueryType());
        assertTrue(response.getSources().size() >= 2);
    }
}
