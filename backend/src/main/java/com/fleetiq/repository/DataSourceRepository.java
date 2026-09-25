package com.fleetiq.repository;

import com.fleetiq.model.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, String> {
    List<DataSource> findByEnabledTrue();
    List<DataSource> findByStatus(String status);
    List<DataSource> findBySourceType(String sourceType);
    long countByStatus(String status);
}
