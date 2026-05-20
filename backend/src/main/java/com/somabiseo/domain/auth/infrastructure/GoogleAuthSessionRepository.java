package com.somabiseo.domain.auth.infrastructure;

import com.somabiseo.domain.auth.domain.GoogleAuthSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleAuthSessionRepository extends JpaRepository<GoogleAuthSessionEntity, String> {
}
