package com.wangziyang.mes.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.system.entity.SysUserRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
 * Mapper 接口
 * </p>
 *
 * @author SongPeng
 * @since 2020-03-05
 */
public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {

	/**
	 * 根据角色ID删除用户-角色关联数据
	 */
	@Delete("DELETE FROM sp_sys_user_role WHERE role_id = #{roleId}")
	void deleteByRoleId(@Param("roleId") String roleId);
}
