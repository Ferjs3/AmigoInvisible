package com.amigoinvisible.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    // Nullable a nivel de base (para no romper cuentas ya creadas antes de
    // este campo), pero el registro y la edicion de perfil siempre lo piden.
    @Column(name = "display_name", length = 100)
    private String displayName;

    // Clave de un icono predefinido (ej. "fox", "panda"), no un archivo.
    // Null = todavia no eligio, el frontend muestra las iniciales.
    @Column(name = "avatar_icon", length = 20)
    private String avatarIcon;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // Recuperacion de contraseña sin mail: el admin de la cuenta responde
    // esta pregunta para demostrar que es quien dice ser. La pregunta se
    // guarda tal cual (no es secreta); la respuesta se guarda hasheada con
    // BCrypt, igual que la contraseña -- nunca en texto plano.
    @Column(name = "security_question", length = 200)
    private String securityQuestion;

    @Column(name = "security_answer_hash", length = 255)
    private String securityAnswerHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    // Lo que se muestra en toda la interfaz: el nombre comun si existe,
    // o el username como respaldo (para cuentas viejas sin nombre cargado).
    public String getDisplayNameOrUsername() {
        return (displayName != null && !displayName.isBlank()) ? displayName : username;
    }
}
