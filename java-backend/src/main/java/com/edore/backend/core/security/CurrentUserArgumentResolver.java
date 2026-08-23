package com.edore.backend.core.security;

import com.edore.backend.features.auth.security.CustomUserDetail;
import org.springframework.core.MethodParameter;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && (CustomUserDetail.class.isAssignableFrom(parameter.getParameterType())
                    || UUID.class.isAssignableFrom(parameter.getParameterType()));
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetail userDetail)) {
            throw new IllegalStateException("No authenticated CustomUserDetail found in SecurityContext");
        }
        if (UUID.class.isAssignableFrom(parameter.getParameterType())) {
            return userDetail.getUser().getId();
        }
        return userDetail;
    }
}
