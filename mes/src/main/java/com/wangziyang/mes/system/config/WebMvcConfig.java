package com.wangziyang.mes.system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC configuration for serving the React SPA alongside existing API.
 *
 * @author SongPeng
 * @date 2025
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:D:/guagua/MES-FullStack-main/MES-FullStack-main/mes/upload/");
    }
}
