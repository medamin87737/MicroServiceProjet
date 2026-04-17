package tn.esprit.spring.msmatiere4twin6.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;

@Configuration
public class ChefEnseignantWebConfig implements WebMvcConfigurer {

    private static final String ROLE_HEADER = "X-Enseignant-Role";
    private static final String RESOURCE_BASE = "/matieres";

    @Bean
    public HandlerInterceptor chefEnseignantInterceptor() {
        return new HandlerInterceptor() {
            @Override
            public boolean preHandle(
                    @NonNull HttpServletRequest request,
                    @NonNull HttpServletResponse response,
                    @NonNull Object handler)
                    throws IOException {
                String path = stripContextPath(request);
                if (!underMatieres(path) || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    return true;
                }
                if ("GET".equalsIgnoreCase(request.getMethod())) {
                    if (isEnseignantOrChef(request)) {
                        return true;
                    }
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setCharacterEncoding("UTF-8");
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"message\":\"Accès GET réservé à Enseignant/Chef Enseignant. Envoyez l'en-tête X-Enseignant-Role: \\\"Enseignant\\\" ou \\\"Chef Enseignant\\\".\"}");
                    return false;
                }
                if (isChef(request)) {
                    return true;
                }
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"message\":\"Réservé au Chef Enseignant. Envoyez l'en-tête X-Enseignant-Role: \\\"Chef Enseignant\\\" (ou CHEF_ENSEIGNANT).\"}");
                return false;
            }
        };
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(chefEnseignantInterceptor()).addPathPatterns("/matieres/**");
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry
                .addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders(ROLE_HEADER);
    }

    private static boolean isChef(HttpServletRequest request) {
        String raw = request.getHeader(ROLE_HEADER);
        if (raw == null || raw.isBlank()) {
            return false;
        }
        String role = raw.trim();
        return "Chef Enseignant".equals(role) || "CHEF_ENSEIGNANT".equalsIgnoreCase(role);
    }

    private static boolean isEnseignantOrChef(HttpServletRequest request) {
        String raw = request.getHeader(ROLE_HEADER);
        if (raw == null || raw.isBlank()) {
            return false;
        }
        String role = raw.trim();
        return "Enseignant".equals(role)
                || "ENSEIGNANT".equalsIgnoreCase(role)
                || "Chef Enseignant".equals(role)
                || "CHEF_ENSEIGNANT".equalsIgnoreCase(role);
    }

    private static String stripContextPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String ctx = request.getContextPath();
        if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
            return uri.substring(ctx.length());
        }
        return uri;
    }

    private static boolean underMatieres(String path) {
        return path.equals(RESOURCE_BASE) || path.startsWith(RESOURCE_BASE + "/");
    }
}
