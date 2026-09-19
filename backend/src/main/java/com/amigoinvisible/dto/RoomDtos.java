package com.amigoinvisible.dto;

import com.amigoinvisible.entity.ParticipantStatus;
import com.amigoinvisible.entity.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class RoomDtos {

    public record CreateRoomRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 20) String icon,
            BigDecimal suggestedBudget,
            LocalDate eventDate,
            @Size(max = 150) String place,
            @Size(max = 2000) String notes
    ) {}

    // Mismos campos que crear: el admin puede corregir cualquiera de estos despues.
    public record UpdateRoomRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 20) String icon,
            BigDecimal suggestedBudget,
            LocalDate eventDate,
            @Size(max = 150) String place,
            @Size(max = 2000) String notes
    ) {}

    // Vista resumida para el listado "Mis salas"
    public record RoomSummaryResponse(
            Long id,
            String name,
            String icon,
            String code,
            RoomStatus status,
            LocalDate eventDate,
            boolean isAdmin,
            int participantCount
    ) {}

    // Vista publica antes de unirse (GET /rooms/{code})
    public record RoomPreviewResponse(
            String name,
            String icon,
            String adminDisplayName,
            LocalDate eventDate,
            BigDecimal suggestedBudget,
            int participantCount,
            boolean canJoin
    ) {}

    // Vista completa dentro del lobby
    public record RoomDetailResponse(
            Long id,
            String name,
            String icon,
            String code,
            RoomStatus status,
            BigDecimal suggestedBudget,
            LocalDate eventDate,
            String place,
            String notes,
            boolean isAdmin,
            List<ParticipantResponse> participants
    ) {}

    public record ParticipantResponse(
            Long userId,
            String displayName,
            String avatarIcon,
            ParticipantStatus status,
            boolean isMe
    ) {}

    public record ExclusionRequest(
            @NotNull Long giverId,
            @NotNull Long receiverId
    ) {}

    public record ExclusionResponse(
            Long id,
            Long giverId,
            String giverDisplayName,
            Long receiverId,
            String receiverDisplayName
    ) {}

    public record MyAssignmentResponse(
            Long receiverId,
            String receiverDisplayName
    ) {}
}
