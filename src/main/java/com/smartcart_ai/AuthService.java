
package com.smartcart_ai;

import com.smartcart_ai.dto.AuthResponse;
import com.smartcart_ai.dto.LoginRequest;
import com.smartcart_ai.dto.RegisterRequest;
import com.smartcart_ai.dto.UpdateProfileRequest;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.smartcart_ai.dto.ChangePasswordRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;

        public AuthService(
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtService jwtService) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.authenticationManager = authenticationManager;
                this.jwtService = jwtService;
        }

        public AuthResponse register(RegisterRequest request) {

                String email = request.getEmail().trim().toLowerCase();

                if (userRepository.existsByEmail(email)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "An account with this email already exists.");
                }

                User user = new User();
                user.setFullName(request.getFullName().trim());
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(request.getPassword()));

                // Public registration only creates customer accounts.
                // Seller accounts will require a separate controlled process.
                user.setRole(UserRole.CUSTOMER);

                User savedUser = userRepository.save(user);

                String token = jwtService.generateToken(savedUser);

                return new AuthResponse(
                                token,
                                "Bearer",
                                savedUser.getId(),
                                savedUser.getFullName(),
                                savedUser.getEmail(),
                                savedUser.getRole());
        }

        public AuthResponse login(LoginRequest request) {

                String email = request.getEmail().trim().toLowerCase();

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                email,
                                                request.getPassword()));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found."));

                String token = jwtService.generateToken(user);

                return new AuthResponse(
                                token,
                                "Bearer",
                                user.getId(),
                                user.getFullName(),
                                user.getEmail(),
                                user.getRole());
        }

        public void changePassword(
                        User user,
                        ChangePasswordRequest request) {
                if (!passwordEncoder.matches(
                                request.getCurrentPassword(),
                                user.getPassword())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Current password is incorrect.");
                }

                if (passwordEncoder.matches(
                                request.getNewPassword(),
                                user.getPassword())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "New password must be different from the current password.");
                }

                user.setPassword(
                                passwordEncoder.encode(request.getNewPassword()));

                userRepository.save(user);
        }

public AuthResponse updateProfile(
                User user,
                UpdateProfileRequest request) {

        String fullName = request.getFullName().trim();

        user.setFullName(fullName);

        User updatedUser = userRepository.save(user);

        return new AuthResponse(
                null,
                "Bearer",
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole());
}
}
