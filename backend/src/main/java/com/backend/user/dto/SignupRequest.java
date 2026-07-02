package com.backend.user.dto;

import com.backend.user.TravelStyle;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * ?Œì›ê°€???”ì²­
 * ?„ë¡ ??RegisterPage.tsx??RegisterReq?€ ?„ë“œ 1:1 ë§¤ì¹­
 *
 * ?¸ì¦?€ ?´ë©”???´ë???ì¤??˜ë‚˜ë§??„ë£Œ?˜ë©´ ?˜ëŠ” êµ¬ì¡° (verificationMethodë¡?? íƒ).
 * phone?€ PHONE ë°©ì‹??? íƒ?ˆì„ ?Œë§Œ ?„ìˆ˜.
 *
 * ì£¼ì˜: cardNumber/cardExpiry/cardCvc???„ë¡ ?¸ì—???¨ê»˜ ë³´ë‚´ì§€ë§?
 *      PCI-DSS ê·œì •??ì¹´ë“œ ?ë³¸ ?•ë³´???ˆë? ?€?¥í•˜ì§€ ?ŠëŠ”??
 *      (?¤ì œ ê²°ì œ ?°ë™ ??PG?¬ê? ë°œê¸‰?˜ëŠ” billing_keyë§?user_payment_cards???€??
 */
public record SignupRequest(

        @NotBlank(message = "?„ì´???´ë©”??ë¥??…ë ¥?´ì£¼?¸ìš”")
        @Email(message = "?´ë©”???•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤")
        String email,

        @NotBlank(message = "ë¹„ë?ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        @Size(min = 8, message = "ë¹„ë?ë²ˆí˜¸??8???´ìƒ?´ì–´???©ë‹ˆ??)
        String password,

        @NotBlank(message = "?´ë¦„???…ë ¥?´ì£¼?¸ìš”")
        String name,

        @NotBlank(message = "?‰ë„¤?„ì„ ?…ë ¥?´ì£¼?¸ìš”")
        @Size(max = 30, message = "?‰ë„¤?„ì? 30???´ë‚´?¬ì•¼ ?©ë‹ˆ??)
        String nickname,

        // ?´ë–¤ ë°©ì‹?¼ë¡œ ?¸ì¦???„ë£Œ?ˆëŠ”ì§€ (EMAIL ?ëŠ” PHONE ì¤??˜ë‚˜ë§??„ìˆ˜)
        @NotNull(message = "?¸ì¦ ë°©ì‹??? íƒ?´ì£¼?¸ìš”")
        VerificationMethod verificationMethod,

        // verificationMethod = EMAIL ????ê²€ì¦ì— ?¬ìš© (email ?„ë“œ?€ ?¨ê»˜ ?•ì¸)
        String emailVerificationCode,

        // verificationMethod = PHONE ???Œë§Œ ?„ìˆ˜
        String phone,
        String phoneVerificationCode,

        TravelStyle travelStyle,

        // ?„ë˜ 3ê°œëŠ” ?€?¥í•˜ì§€ ?ŠìŒ ??ì¡´ì¬?´ë„ ?œë¹„??ë¡œì§?ì„œ ë¬´ì‹œ
        String cardNumber,
        String cardExpiry,
        String cardCvc
) {
    public enum VerificationMethod { EMAIL, PHONE }
}
