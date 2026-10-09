package com.amigoinvisible.repository;

import com.amigoinvisible.entity.AuthToken;
import com.amigoinvisible.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);
    void deleteByToken(String token);
    // Al resetear la contraseña por la pregunta de seguridad, cerramos
    // cualquier sesion que haya quedado abierta en otros dispositivos.
    void deleteByUser(User user);
}
