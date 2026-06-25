package com.wangziyang.mes.system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
        "/welcome",
        "/system",
        "/system/",
        "/system/user",
        "/system/user/",
        "/system/role",
        "/system/role/",
        "/system/menu",
        "/system/menu/",
        "/system/dict",
        "/system/dict/",
        "/system/log",
        "/system/log/",
        "/basedata/materile",
        "/basedata/materile/",
        "/basedata/storehouse",
        "/basedata/storehouse/",
        "/basedata/manager",
        "/basedata/manager/",
        "/basedata/manager-item",
        "/basedata/manager-item/",
        "/basedata/device-group",
        "/basedata/device-group/",
        "/basedata/process-unit",
        "/basedata/process-unit/",
        "/basedata/warehouse",
        "/basedata/warehouse/",
        "/basedata/component",
        "/basedata/component/",
        "/basedata/team-user",
        "/basedata/team-user/",
        "/basedata/equipment-group",
        "/basedata/equipment-group/",
        "/basedata/parts",
        "/basedata/parts/",
        "/basedata/product-bom-management",
        "/basedata/product-bom-management/",
        "/basedata/product-bom-management/detail/**",
        "/basedata/process",
        "/basedata/process/",
        "/basedata/process-query",
        "/basedata/process-query/",
        "/technology",
        "/technology/",
        "/technology/**",
        "/order",
        "/order/",
        "/order/**",
        "/digitization",
        "/digitization/",
        "/digitization/**",
        "/403",
        "/404",
        "/500"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
