package com.wangziyang.mes.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.system.dto.SysUserDTO;
import com.wangziyang.mes.system.entity.SysUser;
import com.wangziyang.mes.system.request.SysUserPageReq;

import java.util.Map;

/**
 * <p>
 * 服务类
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-15
 */
public interface ISysUserService extends IService<SysUser> {

    /**
     * 分页查询用户列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    Map<String, Object> getUserList(SysUserPageReq query);

    /**
     * 删除用户（逻辑删除）
     *
     * @param userId 用户ID
     */
    void deleteUser(String userId);

    /**
     * 保存
     *
     * @param record 用户信息
     * @throws Exception 异常
     */
    void save(SysUserDTO record) throws Exception;

    /**
     * 更新
     *
     * @param record 用户信息
     * @throws Exception 异常
     */
    void update(SysUserDTO record) throws Exception;

    /**
     * 获取用户角色菜单
     *
     * @param username 系统用户名
     * @return 返回结果
     * @throws Exception 异常
     */
    SysUserDTO getUserAndRoleAndMenuByUsername(String username) throws Exception;
}
