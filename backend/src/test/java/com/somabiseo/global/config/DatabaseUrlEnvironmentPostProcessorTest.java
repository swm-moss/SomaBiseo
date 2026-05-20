package com.somabiseo.global.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseUrlEnvironmentPostProcessorTest {
    private final DatabaseUrlEnvironmentPostProcessor postProcessor = new DatabaseUrlEnvironmentPostProcessor();

    @Test
    void convertsPostgresDatabaseUrlToJdbcUrl() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://railway:p%40ss@postgres.railway.internal:5432/railway?sslmode=require");

        postProcessor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.datasource.url"))
                .isEqualTo("jdbc:postgresql://postgres.railway.internal:5432/railway?sslmode=require");
        assertThat(environment.getProperty("spring.datasource.username")).isEqualTo("railway");
        assertThat(environment.getProperty("spring.datasource.password")).isEqualTo("p@ss");
    }

    @Test
    void keepsExplicitJdbcUrl() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://railway:secret@postgres.railway.internal:5432/railway")
                .withProperty("DATABASE_JDBC_URL", "jdbc:postgresql://postgres:5432/somabiseo");

        postProcessor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.datasource.url"))
                .isEqualTo("jdbc:postgresql://postgres:5432/somabiseo");
    }
}
