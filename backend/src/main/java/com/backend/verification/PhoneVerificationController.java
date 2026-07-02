package com.backend.verification;

import com.backend.verification.dto.SendCodeRequest;
import com.backend.verification.dto.VerifyCodeRequest;
import com.backend.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/phone")
@RequiredArgsConstructor
public class PhoneVerificationController {

    private final PhoneVerificationService phoneVerificationService;

    // ?ÑÎ°†?? authApi.sendPhoneCode(phone) ??POST /api/auth/phone/send-code
    @PostMapping("/send-code")
    public ApiResponse<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        phoneVerificationService.sendCode(request.phone());
        return ApiResponse.ok(null, "?∏Ï¶ùÎ≤àÌò∏Í∞Ä Î∞úÏÜ°?òÏóà?µÎãà??");
    }

    // ?ÑÎ°†?? authApi.verifyPhoneCode(phone, code) ??POST /api/auth/phone/verify-code
    @PostMapping("/verify-code")
    public ApiResponse<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        phoneVerificationService.verifyCode(request.phone(), request.code());
        return ApiResponse.ok(null, "?¥Î????∏Ï¶ù???ÑÎ£å?òÏóà?µÎãà??");
    }
}
