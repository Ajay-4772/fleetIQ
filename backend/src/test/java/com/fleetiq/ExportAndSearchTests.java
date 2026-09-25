package com.fleetiq;

import com.fleetiq.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ExportAndSearchTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Case E1: Export vehicles generates valid CSV with correct headers")
    void testExportVehiclesCsv() throws Exception {
        String token = jwtTokenProvider.generateToken("viewer", "ROLE_VIEWER");

        MvcResult result = mockMvc.perform(get("/api/v1/export/vehicles?format=csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
                .andExpect(header().exists("Content-Disposition"))
                .andReturn();

        String csv = result.getResponse().getContentAsString();
        assertTrue(csv.startsWith("vehicleId,vin,registration,make,model"));
        assertTrue(csv.contains("VH-10"));
    }

    @Test
    @DisplayName("Case E2: Export actions generates valid CSV with financial impact")
    void testExportActionsCsv() throws Exception {
        String token = jwtTokenProvider.generateToken("viewer", "ROLE_VIEWER");

        MvcResult result = mockMvc.perform(get("/api/v1/export/actions?format=csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
                .andReturn();

        String csv = result.getResponse().getContentAsString();
        assertTrue(csv.startsWith("actionId,vehicleId,priority"));
    }

    @Test
    @DisplayName("Case E3: Global search matches vehicle ID and VIN")
    void testGlobalSearch() throws Exception {
        String token = jwtTokenProvider.generateToken("viewer", "ROLE_VIEWER");

        mockMvc.perform(get("/api/v1/search?q=Toyota")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMatches").isNumber())
                .andExpect(jsonPath("$.vehicles").isArray());
    }
}
