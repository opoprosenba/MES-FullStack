package com.wangziyang.mes.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.system.dto.SysMenuDTO;
import com.wangziyang.mes.system.dto.SysRoleDTO;
import com.wangziyang.mes.system.dto.SysUserDTO;
import com.wangziyang.mes.system.entity.SysUser;
import com.wangziyang.mes.system.mapper.SysUserMapper;
import com.wangziyang.mes.system.request.SysUserPageReq;
import com.wangziyang.mes.system.service.ISysMenuService;
import com.wangziyang.mes.system.service.ISysRoleService;
import com.wangziyang.mes.system.service.ISysUserService;
import cn.hutool.core.util.StrUtil;
import org.apache.commons.collections.CollectionUtils;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author wangziyang songpeng
 * @since 2019-10-15
 */
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements ISysUserService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private ISysMenuService sysMenuService;

    @Autowired
    private ISysRoleService sysRoleService;

    /**
     * 用户名唯一性校验（新增、编辑通用）
     */
    private void checkUsernameUnique(SysUser user) {
        LambdaQueryWrapper<SysUser> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(SysUser::getUsername, user.getUsername());
        // 仅校验未删除的用户 (deleted = '0' 表示未删除)
        wrapper.eq(SysUser::getDeleted, "0");
        // 关键修复：编辑时存在用户ID，排除自身数据，避免误判重复
        if (user.getId() != null) {
            wrapper.ne(SysUser::getId, user.getId());
        }
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("用户名已存在，数据重复");
        }
    }

    /**
     * 分页查询用户列表（排除已删除用户，保留正常和禁用状态）
     */
    @Override
    public Map<String, Object> getUserList(SysUserPageReq query) {
        LambdaQueryWrapper<SysUser> wrapper = Wrappers.lambdaQuery();
        // 核心修复：排除已删除用户(deleted=0)，保留正常(deleted=1)和禁用(deleted=2)状态的用户
        wrapper.ne(SysUser::getDeleted, "0");

        // 可选搜索条件
        if (StrUtil.isNotBlank(query.getUsernameLike())) {
            wrapper.like(SysUser::getUsername, query.getUsernameLike());
        }
        if (StrUtil.isNotBlank(query.getNameLike())) {
            wrapper.like(SysUser::getName, query.getNameLike());
        }

        wrapper.orderByDesc(SysUser::getCreateTime);
        Page<SysUser> page = new Page<>(query.getCurrent(), query.getSize());
        this.page(page, wrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", page.getRecords());
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        return result;
    }

    /**
     * 删除用户（物理删除）
     * 从数据库彻底移除记录，删除后可立即复用用户名
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(String userId) {
        // 直接物理删除，从数据库移除这条记录
        baseMapper.deleteById(userId);
    }

    /**
     * 保存
     *
     * @param record 用户信息
     * @throws Exception 异常
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void save(SysUserDTO record) throws Exception {
        // 校验用户名唯一性，只查询状态为正常的用户
        long sameCount = sysUserMapper.countSameUsername(record.getUsername());
        if (sameCount > 0) {
            throw new RuntimeException("用户名已存在，不可重复新增");
        }
        //MD5算法计算3次
        String result = new Md5Hash(record.getPassword(), record.getUsername(),3).toString();
        record.setPassword(result);
        // 新增默认状态为正常（is_deleted='1'）
        record.setDeleted("1");
        sysUserMapper.insert(record);
        sysRoleService.rebuild(record);
    }

    /**
     * 更新
     * 仅当用户名发生变更时，才执行唯一性校验；修改状态、手机号等直接更新
     *
     * @param record 用户信息
     * @throws Exception 异常
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void update(SysUserDTO record) throws Exception {
        // 1. 查询数据库中原用户数据
        SysUser oldUser = this.getById(record.getId());
        if (oldUser == null || "0".equals(oldUser.getDeleted())) {
            throw new RuntimeException("用户不存在或已删除");
        }

        // 2. 仅当用户名修改了，才做重复校验；没改就跳过
        if (!oldUser.getUsername().equals(record.getUsername())) {
            LambdaQueryWrapper<SysUser> wrapper = Wrappers.lambdaQuery();
            wrapper.eq(SysUser::getUsername, record.getUsername());
            wrapper.eq(SysUser::getDeleted, "1");
            // 排除自身
            wrapper.ne(SysUser::getId, record.getId());
            if (this.count(wrapper) > 0) {
                throw new RuntimeException("用户名已存在，数据重复");
            }
        }

        // 3. 允许编辑接口修改状态（正常/已禁用），但禁止修改为已删除状态
        // deleted 字段状态：0=删除,1=正常,2=禁用
        // 编辑接口只能修改为 1（正常）或 2（已禁用），不能修改为 0（删除）
        if (record.getDeleted() == null) {
            record.setDeleted(oldUser.getDeleted());
        } else if ("0".equals(record.getDeleted())) {
            // 禁止通过编辑接口设置为删除状态，删除操作只能通过专门的删除接口
            throw new RuntimeException("禁止通过编辑接口删除用户，请使用删除按钮");
        }

        // 4. 更新用户信息
        sysUserMapper.updateById(record);
        sysRoleService.rebuild(record);
    }

    /**
     * 获取用户角色菜单
     *
     * @param username
     * @return
     * @throws Exception
     */
    @Override
    public SysUserDTO getUserAndRoleAndMenuByUsername(String username) throws Exception {
        SysUserDTO result = sysUserMapper.selectUserAndRoleByUsername(username);
        if (CollectionUtils.isNotEmpty(result.getSysRoleDTOs())) {
            for (SysRoleDTO rDto : result.getSysRoleDTOs()) {
                List<SysMenuDTO> menus = sysMenuService.listByRoleId(rDto.getId());
                rDto.setSysMenuDtos(menus);
            }
        }
        return result;
    }

}
