package com.wangziyang.mes.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.system.dto.SysUserDTO;
import com.wangziyang.mes.system.entity.SysUser;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * Mapper 接口
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-15
 */
public interface SysUserMapper extends BaseMapper<SysUser> {

	SysUserDTO selectUserAndRoleByUsername(String username) throws Exception;

	@Select("SELECT COUNT(1) FROM sp_sys_user WHERE username = #{username} AND is_deleted = '1'")
	Long countSameUsername(String username);
}
