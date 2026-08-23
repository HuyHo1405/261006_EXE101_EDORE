package com.edore.backend.features.auth.repository;

import com.edore.backend.features.auth.entity.OTP;
import com.edore.backend.features.auth.model.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OTPRepository extends JpaRepository<OTP, UUID> {

    Optional<OTP> findByEmailAndType(String email, OtpType type);

    Optional<OTP> findByEmailAndOtpCodeAndType(String email, String otpCode, OtpType type);

    void deleteByEmailAndType(String email, OtpType type);
}
