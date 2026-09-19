package com.amigoinvisible.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Size(min = 1, max = 100) String displayName,
            @NotBlank @Email @Size(max = 120) String email,
            @NotBlank @Size(min = 6, max = 100) String password
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            UserResponse user
    ) {}

    public record UserResponse(
            Long id,
            String username,
            String displayName,
            String avatarIcon,
            String email
    ) {}

    // Para el panel de perfil: cambiar nombre comun, username y/o icono.
    // avatarIcon puede venir null (significa "sin icono, mostrar iniciales").
    public record UpdateProfileRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Size(min = 1, max = 100) String displayName,
            @Size(max = 20) String avatarIcon
    ) {}
}
