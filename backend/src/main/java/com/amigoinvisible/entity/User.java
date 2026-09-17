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

    @Column(nullable = false, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

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
