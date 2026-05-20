package com.somabiseo.global.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
    private static final String PROPERTY_SOURCE_NAME = "somabiseoDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String configuredUrl = environment.getProperty("spring.datasource.url");

        if (isJdbcUrl(configuredUrl)) {
            return;
        }

        String databaseJdbcUrl = environment.getProperty("DATABASE_JDBC_URL");
        String databaseUrl = firstText(databaseJdbcUrl, environment.getProperty("DATABASE_URL"));

        if (!hasText(databaseUrl)) {
            return;
        }

        DatabaseConnectionProperties connectionProperties = normalize(databaseUrl);
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("spring.datasource.url", connectionProperties.jdbcUrl());

        if (!hasText(environment.getProperty("DATABASE_USERNAME")) && hasText(connectionProperties.username())) {
            properties.put("spring.datasource.username", connectionProperties.username());
        }

        if (!hasText(environment.getProperty("DATABASE_PASSWORD")) && hasText(connectionProperties.password())) {
            properties.put("spring.datasource.password", connectionProperties.password());
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    private DatabaseConnectionProperties normalize(String databaseUrl) {
        if (isJdbcUrl(databaseUrl)) {
            return new DatabaseConnectionProperties(databaseUrl, null, null);
        }

        URI uri = URI.create(databaseUrl);
        String scheme = uri.getScheme();

        if (!"postgresql".equalsIgnoreCase(scheme) && !"postgres".equalsIgnoreCase(scheme)) {
            return new DatabaseConnectionProperties(databaseUrl, null, null);
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
        jdbcUrl.append(uri.getHost());

        if (uri.getPort() >= 0) {
            jdbcUrl.append(':').append(uri.getPort());
        }

        if (hasText(uri.getRawPath())) {
            jdbcUrl.append(uri.getRawPath());
        }

        if (hasText(uri.getRawQuery())) {
            jdbcUrl.append('?').append(uri.getRawQuery());
        }

        String username = null;
        String password = null;
        String userInfo = uri.getRawUserInfo();

        if (hasText(userInfo)) {
            int passwordSeparator = userInfo.indexOf(':');

            if (passwordSeparator >= 0) {
                username = decode(userInfo.substring(0, passwordSeparator));
                password = decode(userInfo.substring(passwordSeparator + 1));
            } else {
                username = decode(userInfo);
            }
        }

        return new DatabaseConnectionProperties(jdbcUrl.toString(), username, password);
    }

    private boolean isJdbcUrl(String value) {
        return hasText(value) && value.startsWith("jdbc:");
    }

    private String firstText(String first, String second) {
        return hasText(first) ? first : second;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private record DatabaseConnectionProperties(String jdbcUrl, String username, String password) {
    }
}
