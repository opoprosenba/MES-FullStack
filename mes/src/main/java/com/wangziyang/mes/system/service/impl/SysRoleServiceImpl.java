package com.wangziyang.mes.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.system.dto.SysRoleDTO;
import com.wangziyang.mes.system.dto.SysUserDTO;
import com.wangziyang.mes.system.entity.SysRole;
import com.wangziyang.mes.system.entity.SysUserRole;
import com.wangziyang.mes.system.enums.SysRoleEnum;
import com.wangziyang.mes.system.mapper.SysRoleMapper;
import com.wangziyang.mes.system.mapper.SysRoleMenuMapper;
import com.wangziyang.mes.system.mapper.SysUserRoleMapper;
import com.wangziyang.mes.system.service.ISysRoleService;
import com.wangziyang.mes.system.service.ISysUserRoleService;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-16
 */
@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements ISysRoleService {

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private ISysUserRoleService sysUserRoleService;

    @Autowired
    private SysRoleMenuMapper sysRoleMenuMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    /**
     * 根据用户ID获取角色列表信息
     *
     * @param userId 系统用户ID
     * @return 角色列表
     * @throws Exception 异常
     */
    @Override
    public List<SysRoleDTO> listByUserId(String userId) throws Exception {
        List<SysRoleDTO> result = new ArrayList<>();

        List<SysRole> sysRoles = sysRoleMapper.listByUserId(userId);

        // 查询所有角色，过滤已删除角色
        QueryWrapper<SysRole> queryWrapper = new QueryWrapper<>();
        queryWrapper.ne("is_deleted", SysRoleEnum.DELETED_DEL.getCode());
        List<SysRole> sysRolesAll = sysRoleMapper.selectList(queryWrapper);

        for (SysRole role : sysRolesAll) {
            SysRoleDTO roleDTO = new SysRoleDTO();
            BeanUtils.copyProperties(role, roleDTO);
            for (SysRole r : sysRoles) {
                if (role.getId().equals(r.getId())) {
                    roleDTO.setChecked(true);
                }
            }
            result.add(roleDTO);
        }
        return result;
    }

    /**
     * 重新建立用户角色关系
     *
     * @param sysUserDTO 系统用户DTO
     * @throws Exception 异常
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rebuild(SysUserDTO sysUserDTO) throws Exception {
        if (StringUtils.isNotEmpty(sysUserDTO.getId())) {
            QueryWrapper<SysUserRole> deleteWrapper = new QueryWrapper<>();
            deleteWrapper.eq("user_id", sysUserDTO.getId());
            sysUserRoleService.remove(deleteWrapper);
        }
        if (ArrayUtils.isNotEmpty(sysUserDTO.getSysRoleIds())) {
            for (String roleId : sysUserDTO.getSysRoleIds()) {
                if (StringUtils.isEmpty(roleId)) {
                    continue;
                }
                SysUserRole sysUserRole = new SysUserRole();
                sysUserRole.setUserId(sysUserDTO.getId());
                sysUserRole.setRoleId(roleId);
                sysUserRoleService.save(sysUserRole);
            }
        }
    }

    /**
     * 删除角色（物理删除，先删关联再删本体）
     *
     * @param id 角色ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRoleById(String id) {
        // 1. 先删除角色-菜单关联表数据，避免外键约束
        sysRoleMenuMapper.deleteByRoleId(id);
        // 2. 再删除用户-角色关联表数据
        sysUserRoleMapper.deleteByRoleId(id);
        // 3. 原生SQL物理删除角色本体，绕过MyBatis-Plus自动软删除
        sysRoleMapper.deleteRoleById(id);
    }
}
