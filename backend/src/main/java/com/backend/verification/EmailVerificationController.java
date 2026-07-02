package com.backend.verification;

import com.backend.verification.dto.SendEmailCodeRequest;
import com.backend.verification.dto.VerifyEmailCodeRequest;
import com.backend.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    // POST /api/auth/email/send-code
    @PostMapping("/send-code")
    public ApiResponse<Void> sendCode(@Valid @RequestBody SendEmailCodeRequest request) {
        emailVerificationService.sendCode(request.email(), request.purpose());
        return ApiResponse.ok(null, "?∏Ï¶ùÎ≤àÌò∏Í∞Ä ?¥Î©î?ºÎ°ú Î∞úÏÜ°?òÏóà?µÎãà??");
    }

    // POST /api/auth/email/verify-code
    @PostMapping("/verify-code")
    public ApiResponse<Void> verifyCode(@Valid @RequestBody VerifyEmailCodeRequest request) {
        emailVerificationService.verifyCode(request.email(), request.code());
        return ApiResponse.ok(null, "?¥Î©î???∏Ï¶ù???ÑÎ£å?òÏóà?µÎãà??");
    }
}
