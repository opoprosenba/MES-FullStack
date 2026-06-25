package com.wangziyang.mes.system.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.wangziyang.mes.common.BaseController;
import com.wangziyang.mes.common.Result;
import com.wangziyang.mes.system.dto.SysRoleDTO;
import com.wangziyang.mes.system.dto.SysUserDTO;
import com.wangziyang.mes.system.entity.SysUser;
import com.wangziyang.mes.system.request.SysUserPageReq;
import com.wangziyang.mes.system.service.ISysRoleService;
import com.wangziyang.mes.system.service.ISysUserService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 前端控制器
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-15
 */
@Controller("adminSysUserController")
@RequestMapping("/admin/sys/user")
public class SysUserController extends BaseController {

    Logger logger = LoggerFactory.getLogger(SysUserController.class);

    @Autowired
    private ISysUserService sysUserService;

    @Autowired
    private ISysRoleService sysRoleService;

    @GetMapping("/list-ui")
    public String listUI(Model model) {
        return "admin/system/user/list";
    }

    @PostMapping("/page")
    @ResponseBody
    public Result page(SysUserPageReq req) throws Exception {
        // 使用Service层方法，仅返回未删除用户
        return Result.success(sysUserService.getUserList(req));
    }

    /**
     * 删除用户
     * 仅接收ID，不接收完整用户对象，彻底避免时间字段类型转换异常
     */
    @PostMapping("/delete")
    @ResponseBody
    public Result<Void> deleteUser(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        sysUserService.deleteUser(id);
        return Result.success();
    }

    @GetMapping("/add-or-update-ui")
    public String addOrUpdateUI(SysUser record, Model model) throws Exception {
        if (StringUtils.isNotEmpty(record.getId())) {
            SysUser result = sysUserService.getById(record.getId());
            model.addAttribute("result", result);
        }
        List<SysRoleDTO> sysRoles = sysRoleService.listByUserId(record.getId());
        model.addAttribute("sysRoles", sysRoles);
        return "admin/system/user/addOrUpdate";
    }

    @GetMapping("/get-by-id")
    @ResponseBody
    public Result getById(String id) {
        SysUser result = sysUserService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(SysUserDTO record) throws Exception {
        if (StringUtils.isEmpty(record.getId())) {
            sysUserService.save(record);
        } else {
            sysUserService.update(record);
        }
        return Result.success(record.getId());
    }
}
