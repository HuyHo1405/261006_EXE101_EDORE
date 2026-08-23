package com.edore.backend.features.auth.service.impl;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.mail.MailService;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.core.security.JwtService;
import com.edore.backend.core.security.TokenBlacklistService;
import com.edore.backend.features.auth.code.AuthResponseCode;
import com.edore.backend.features.auth.dto.request.*;
import com.edore.backend.features.auth.dto.response.*;
import com.edore.backend.features.auth.entity.OTP;
import com.edore.backend.features.auth.entity.RefreshTokenRedis;
import com.edore.backend.features.auth.entity.Role;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.model.OtpType;
import com.edore.backend.features.auth.model.RoleName;
import com.edore.backend.features.auth.repository.AuthEnumRegistry;
import com.edore.backend.features.auth.repository.OTPRepository;
import com.edore.backend.features.auth.repository.RefreshTokenRedisRepository;
import com.edore.backend.features.auth.repository.RoleRepository;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.auth.security.CustomUserDetail;
import com.edore.backend.features.auth.service.AuthenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthenServiceImpl implements AuthenService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OTPRepository otpRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenRedisRepository refreshTokenRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthEnumRegistry authEnumRegistry;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        CustomUserDetail userDetail = (CustomUserDetail) authentication.getPrincipal();
        User user = userDetail.getUser();
        if (!user.getIsActive()) {
            throw new ApiException(AuthResponseCode.USER_NOT_ACTIVE, "Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.");
        }
        String accessToken = jwtService.generateAccessToken(userDetail);
        String refreshToken = jwtService.generateRefreshToken(userDetail);
        long expirationInSeconds = 7 * 24 * 60 * 60;
        RefreshTokenRedis tokenRedis = RefreshTokenRedis.builder()
                .token(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .ttlInSeconds(expirationInSeconds)
                .build();
        refreshTokenRepository.save(tokenRedis);

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new LoginResponseDTO(
                accessToken,
                refreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }

    @Override
    @Transactional
    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                Date expiration = jwtService.extractExpiration(jwt);
                long remainingTimeMs = expiration.getTime() - System.currentTimeMillis();
                if (remainingTimeMs > 0) {
                    tokenBlacklistService.blacklistToken(jwt, remainingTimeMs);
                }
            } catch (Exception e) {
                throw new ApiException(CommonResponseCode.UNAUTHORIZED);
            }
        }
    }

    @Override
    @Transactional
    public void register(RegisterRequestDTO request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(AuthResponseCode.PASSWORD_MISMATCH);
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ApiException(AuthResponseCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new ApiException(AuthResponseCode.PHONE_ALREADY_EXISTS);
        }

        Role defaultRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ApiException(CommonResponseCode.INTERNAL_ERROR, "Quyền mặc định chưa được cấu hình."));

        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);

        User user = User.builder()
                .username(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .roles(roles)
                .isActive(false)
                .build();
        userRepository.save(user);

        // Auto send OTP for REGISTER
        sendOtp(new SendOtpRequestDTO(request.email(), OtpType.REGISTER));
    }

    @Override
    @Transactional
    public void sendOtp(SendOtpRequestDTO request) {
        if (request == null || request.type() == null) {
            throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Loại OTP không được để trống (REGISTER / RESET_PASSWORD).");
        }

        // Rate limit: Cooldown 60 seconds between OTP requests
        Optional<OTP> existingOtp = otpRepository.findByEmailAndType(request.email(), request.type());
        if (existingOtp.isPresent()) {
            Instant createdAt = existingOtp.get().getExpiryTime().minusSeconds(5 * 60);
            long secondsSinceCreation = Instant.now().getEpochSecond() - createdAt.getEpochSecond();
            if (secondsSinceCreation < 60) {
                long waitTime = 60 - secondsSinceCreation;
                throw new ApiException(AuthResponseCode.OTP_EXPIRED, "Vui lòng đợi " + waitTime + " giây trước khi yêu cầu mã OTP mới.");
            }
        }

        String otpCode = String.format("%06d", new SecureRandom().nextInt(999999));
        otpRepository.deleteByEmailAndType(request.email(), request.type());

        OTP otp = OTP.builder()
                .email(request.email())
                .otpCode(otpCode)
                .type(request.type())
                .expiryTime(Instant.now().plusSeconds(5 * 60))
                .build();
        otpRepository.save(otp);

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", request.email());
            variables.put("otpCode", otpCode);

            String subject = request.type() == OtpType.REGISTER
                    ? "Mã OTP kích hoạt tài khoản"
                    : "Mã OTP đặt lại mật khẩu";

            mailService.sendWithTemplate(
                    request.email(),
                    subject,
                    "email/otp-email",
                    variables
            );
        } catch (Exception e) {
            log.error("[Mail] Error sending OTP email: {}", e.getMessage(), e);
            throw new ApiException(CommonResponseCode.INTERNAL_ERROR, "Lỗi gửi email OTP");
        }
    }

    @Override
    @Transactional
    public VerifyOtpResponseDTO verifyOtp(VerifyOtpRequestDTO request) {
        if (request == null || request.type() == null) {
            throw new ApiException(CommonResponseCode.VALIDATION_FAILED, "Loại OTP không được để trống (REGISTER / RESET_PASSWORD).");
        }

        OTP otp = otpRepository.findByEmailAndOtpCodeAndType(request.email(), request.otpCode(), request.type())
                .orElseThrow(() -> new ApiException(AuthResponseCode.OTP_INVALID));

        if (otp.getExpiryTime().isBefore(Instant.now())) {
            throw new ApiException(AuthResponseCode.OTP_EXPIRED);
        }

        String resetToken = null;
        if (request.type() == OtpType.REGISTER) {
            User user = userRepository.findByEmail(request.email())
                    .orElseThrow(() -> new ApiException(AuthResponseCode.USER_NOT_FOUND));
            user.setIsActive(true);
            userRepository.save(user);
        } else if (request.type() == OtpType.RESET_PASSWORD) {
            resetToken = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set("reset_token:" + request.email(), resetToken, 15, TimeUnit.MINUTES);
        }

        otpRepository.deleteByEmailAndType(request.email(), request.type());
        return new VerifyOtpResponseDTO(resetToken);
    }

    @Override
    @Transactional
    public ResetPasswordResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(AuthResponseCode.PASSWORD_MISMATCH);
        }

        String savedToken = redisTemplate.opsForValue().get("reset_token:" + request.email());
        if (savedToken == null || !savedToken.equals(request.resetToken())) {
            throw new ApiException(AuthResponseCode.INVALID_RESET_TOKEN);
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(AuthResponseCode.USER_NOT_FOUND));

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new ApiException(AuthResponseCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        redisTemplate.delete("reset_token:" + request.email());

        return new ResetPasswordResponseDTO(request.email(), "Đặt lại mật khẩu thành công.", user.getId(), null);
    }

    @Override
    @Transactional
    public ResetPasswordResponseDTO changePassword(UUID userId, ChangePasswordRequestDTO request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(AuthResponseCode.PASSWORD_MISMATCH);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(AuthResponseCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new ApiException(AuthResponseCode.OLD_PASSWORD_INCORRECT);
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new ApiException(AuthResponseCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new ResetPasswordResponseDTO(user.getEmail(), "Đổi mật khẩu thành công.", user.getId(), null);
    }

    @Override
    @Transactional
    public LoginResponseDTO refreshToken(TokenRefreshRequestDTO request) {
        String refreshToken = request.refreshToken();

        try {
            jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new ApiException(AuthResponseCode.REFRESH_TOKEN_INVALID);
        }

        RefreshTokenRedis tokenRedis = refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new ApiException(AuthResponseCode.REFRESH_TOKEN_NOT_FOUND));

        User user = userRepository.findByEmail(tokenRedis.getEmail())
                .orElseThrow(() -> new ApiException(AuthResponseCode.USER_NOT_FOUND));

        if (!user.getIsActive()) {
            throw new ApiException(AuthResponseCode.USER_NOT_ACTIVE);
        }

        CustomUserDetail userDetail = new CustomUserDetail(user);

        String newAccessToken = jwtService.generateAccessToken(userDetail);
        String newRefreshToken = jwtService.generateRefreshToken(userDetail);

        refreshTokenRepository.delete(tokenRedis);

        long expirationInSeconds = 7 * 24 * 60 * 60;
        RefreshTokenRedis newTokenRedis = RefreshTokenRedis.builder()
                .token(newRefreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .ttlInSeconds(expirationInSeconds)
                .build();
        refreshTokenRepository.save(newTokenRedis);

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new LoginResponseDTO(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }

    @Override
    public boolean isEmailValid(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return authEnumRegistry.getAuthEnums();
    }
}
