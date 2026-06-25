package com.wangziyang.mes.system.controller.admin;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.wangziyang.mes.common.BaseController;
import com.wangziyang.mes.common.Result;
import com.wangziyang.mes.system.dto.SysRoleDTO;
import com.wangziyang.mes.system.entity.SysRole;
import com.wangziyang.mes.system.entity.SysRoleMenu;
import com.wangziyang.mes.system.enums.SysRoleEnum;
import com.wangziyang.mes.system.mapper.SysRoleMapper;
import com.wangziyang.mes.system.request.SysRolePageReq;
import com.wangziyang.mes.system.service.ISysRoleMenuService;
import com.wangziyang.mes.system.service.ISysRoleService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 前端控制器
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-16
 */
@Controller("adminSysRoleController")
@RequestMapping("/admin/sys/role")
public class SysRoleController extends BaseController {

    @Autowired
    private ISysRoleService sysRoleService;

    @Autowired
    private ISysRoleMenuService sysRoleMenuService;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @GetMapping("/list-ui")
    public String listUI(Model model) {
        return "admin/system/role/list";
    }

    @PostMapping("/page")
    @ResponseBody
    public Result page(SysRolePageReq req) {
        QueryWrapper<SysRole> qw = new QueryWrapper<>();
        // 过滤已删除角色（is_deleted = 1）
        qw.ne("is_deleted", SysRoleEnum.DELETED_DEL.getCode());
        if (StringUtils.isNotEmpty(req.getNameLike())) {
            qw.like("name", req.getNameLike());
        }
        if (StringUtils.isNotEmpty(req.getCodeLike())) {
            qw.like("code", req.getCodeLike());
        }
        qw.orderByDesc(req.getOrderBy());
        IPage<SysRole> result = sysRoleService.page(req, qw);
        return Result.success(result);
    }

    @GetMapping("/add-or-update-ui")
    public String addOrUpdateUI(Model model, SysRole record) {
        if (StringUtils.isNotEmpty(record.getId())) {
            SysRole result = sysRoleService.getById(record.getId());
            model.addAttribute("result", result);
        }
        return "admin/system/role/addOrUpdate";
    }

    @GetMapping("/get-by-id")
    @ResponseBody
    public Result getById(String id) {
        SysRole result = sysRoleService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(SysRoleDTO record) throws Exception {
        // 查重校验：角色名称和编码不能与未删除角色重复
        if (StringUtils.isNotEmpty(record.getName())) {
            Long nameCount;
            if (StringUtils.isNotEmpty(record.getId())) {
                // 编辑时排除自身
                nameCount = sysRoleMapper.countByNameExcludeId(record.getName(), record.getId());
            } else {
                // 新增时统计所有未删除角色
                nameCount = sysRoleMapper.countByName(record.getName());
            }
            if (nameCount != null && nameCount > 0) {
                return Result.failure("角色名称已存在，不可重复");
            }
        }
        if (StringUtils.isNotEmpty(record.getCode())) {
            Long codeCount;
            if (StringUtils.isNotEmpty(record.getId())) {
                // 编辑时排除自身
                codeCount = sysRoleMapper.countByCodeExcludeId(record.getCode(), record.getId());
            } else {
                // 新增时统计所有未删除角色
                codeCount = sysRoleMapper.countByCode(record.getCode());
            }
            if (codeCount != null && codeCount > 0) {
                return Result.failure("角色编码已存在，不可重复");
            }
        }
        
        sysRoleService.saveOrUpdate(record);
        if (record.getSysMenuIds() != null) {
            sysRoleMenuService.rebuild(record.getId(), record.getSysMenuIds());
        }
        return Result.success(record.getId());
    }

    @GetMapping("/tree/{roleId}")
    @ResponseBody
    public Result tree(@PathVariable String roleId) {
        QueryWrapper<SysRoleMenu> qw = new QueryWrapper<>();
        qw.eq("role_id", roleId);
        List<SysRoleMenu> list = sysRoleMenuService.list(qw);
        List<String> menuIds = list.stream()
                .map(SysRoleMenu::getMenuId)
                .collect(Collectors.toList());
        return Result.success(menuIds);
    }

    /**
     * 删除角色（物理删除，先删关联再删本体）
     */
    @DeleteMapping("/{id}")
    @ResponseBody
    public Result deleteRole(@PathVariable String id) {
        SysRole role = sysRoleService.getById(id);
        if (role == null) {
            return Result.failure("角色不存在");
        }
        // 物理删除：先删关联数据，再删角色本体
        sysRoleService.deleteRoleById(id);
        return Result.success("删除成功");
    }
}
