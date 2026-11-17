
package com.smartcart_ai.dto;

import com.smartcart_ai.UserRole;

public record AuthResponse(
    String token,
    String tokenType,
    Long userId,
    String fullName,
    String email,
    UserRole role
) {
}

