package com.amigoinvisible.service;

import com.amigoinvisible.dto.AuthDtos.AuthResponse;
import com.amigoinvisible.dto.AuthDtos.LoginRequest;
import com.amigoinvisible.dto.AuthDtos.RegisterRequest;
import com.amigoinvisible.dto.AuthDtos.ResetPasswordRequest;
import com.amigoinvisible.dto.AuthDtos.SecurityQuestionResponse;
import com.amigoinvisible.dto.AuthDtos.UpdateProfileRequest;
import com.amigoinvisible.dto.AuthDtos.UserResponse;
import com.amigoinvisible.entity.AuthToken;
import com.amigoinvisible.entity.User;
import com.amigoinvisible.exception.BadRequestException;
import com.amigoinvisible.exception.ConflictException;
import com.amigoinvisible.repository.AuthTokenRepository;
import com.amigoinvisible.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.token-expiration-days}")
    private long tokenExpirationDays;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Ese nombre de usuario ya esta en uso");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Ese email ya esta registrado");
        }

        User user = User.builder()
                .username(request.username())
                .displayName(request.displayName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .securityQuestion(request.securityQuestion().trim())
                .securityAnswerHash(passwordEncoder.encode(normalizeAnswer(request.securityAnswer())))
                .build();
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadRequestException("Usuario o contrasena incorrectos"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Usuario o contrasena incorrectos");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String rawToken) {
        authTokenRepository.deleteByToken(rawToken);
    }

    // Cambia nombre comun, username, icono y/o la pregunta de seguridad.
    // El username nuevo tiene que estar libre (o ser el mismo que ya tenia).
    // La pregunta de seguridad solo se actualiza si vienen pregunta Y
    // respuesta juntas; si no, queda exactamente como estaba.
    @Transactional
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        boolean usernameChanged = !currentUser.getUsername().equalsIgnoreCase(request.username());
        if (usernameChanged && userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Ese nombre de usuario ya esta en uso");
        }

        currentUser.setUsername(request.username());
        currentUser.setDisplayName(request.displayName());
        currentUser.setAvatarIcon(request.avatarIcon());

        if (request.securityQuestion() != null && !request.securityQuestion().isBlank()
                && request.securityAnswer() != null && !request.securityAnswer().isBlank()) {
            currentUser.setSecurityQuestion(request.securityQuestion().trim());
            currentUser.setSecurityAnswerHash(passwordEncoder.encode(normalizeAnswer(request.securityAnswer())));
        }

        User saved = userRepository.save(currentUser);
        return toUserResponse(saved);
    }

    // --- Recuperar contraseña sin mail, via pregunta de seguridad ---

    @Transactional(readOnly = true)
    public SecurityQuestionResponse getSecurityQuestion(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("No encontramos ninguna cuenta con ese usuario"));

        if (user.getSecurityQuestion() == null || user.getSecurityAnswerHash() == null) {
            throw new ConflictException("Esta cuenta todavia no tiene una pregunta de seguridad configurada");
        }

        return new SecurityQuestionResponse(user.getSecurityQuestion());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadRequestException("Usuario o respuesta incorrectos"));

        if (user.getSecurityAnswerHash() == null
                || !passwordEncoder.matches(normalizeAnswer(request.securityAnswer()), user.getSecurityAnswerHash())) {
            throw new BadRequestException("Usuario o respuesta incorrectos");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Por las dudas, cerramos cualquier sesion vieja que haya quedado
        // abierta en otro dispositivo despues de este reset.
        authTokenRepository.deleteByUser(user);
    }

    // La respuesta no distingue mayusculas/minusculas ni espacios de mas,
    // asi "Rex" y "rex " valen lo mismo -- menos friccion para el usuario.
    private String normalizeAnswer(String answer) {
        return answer.trim().toLowerCase();
    }

    private AuthResponse buildAuthResponse(User user) {
        AuthToken authToken = AuthToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .expiresAt(Instant.now().plus(tokenExpirationDays, ChronoUnit.DAYS))
                .build();
        authTokenRepository.save(authToken);

        return new AuthResponse(authToken.getToken(), toUserResponse(user));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayNameOrUsername(),
                user.getAvatarIcon(),
                user.getEmail(),
                user.getSecurityQuestion()
        );
    }
}
