package com.project.pghostel.app.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http

            // Disable CSRF
            .csrf(csrf -> csrf.disable())

            // JWT = Stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // ======================================
            // AUTHORIZATION
            // ======================================

            .authorizeHttpRequests(auth -> auth

                // ----------------------------------
                // FRONTEND FILES
                // ----------------------------------

                .requestMatchers(
                    "/html/**",
                    "/css/**",
                    "/js/**",
                    "/favicon.ico"
                ).permitAll()


                // ----------------------------------
                // LOGIN + REGISTER
                // ----------------------------------

                .requestMatchers(
                    "/api/users/login",
                    "/api/users/register",
                    "/api/users/reset-password"
                ).permitAll()


                // ----------------------------------
                // USER MANAGEMENT
                // ADMIN ONLY
                // ----------------------------------

                .requestMatchers(
                    "/api/users/**"
                ).hasRole("ADMIN")


                // ----------------------------------
                // OTHER API
                // ----------------------------------

                .anyRequest().authenticated()
            )


            // ======================================
            // JWT FILTER
            // ======================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}