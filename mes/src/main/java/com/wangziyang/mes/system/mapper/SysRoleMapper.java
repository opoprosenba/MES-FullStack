package com.wangziyang.mes.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.system.entity.SysRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * Mapper 接口
 * </p>
 *
 * @author SongPeng
 * @since 2019-10-16
 */
public interface SysRoleMapper extends BaseMapper<SysRole> {

	/**
	 * 根据用户 id 获取角色列表
	 *
	 * @param userId
	 * @return
	 * @throws Exception
	 */
	List<SysRole> listByUserId(String userId) throws Exception;

	/**
	 * 根据角色名称统计角色数量（物理删除后无需过滤状态）
	 */
	@Select("SELECT COUNT(1) FROM sp_sys_role WHERE name = #{name}")
	Long countByName(@Param("name") String name);

	/**
	 * 根据角色编码统计角色数量（物理删除后无需过滤状态）
	 */
	@Select("SELECT COUNT(1) FROM sp_sys_role WHERE code = #{code}")
	Long countByCode(@Param("code") String code);

	/**
	 * 根据角色名称统计角色数量（排除指定ID，用于编辑时校验）
	 */
	@Select("SELECT COUNT(1) FROM sp_sys_role WHERE name = #{name} AND id != #{excludeId}")
	Long countByNameExcludeId(@Param("name") String name, @Param("excludeId") String excludeId);

	/**
	 * 根据角色编码统计角色数量（排除指定ID，用于编辑时校验）
	 */
	@Select("SELECT COUNT(1) FROM sp_sys_role WHERE code = #{code} AND id != #{excludeId}")
	Long countByCodeExcludeId(@Param("code") String code, @Param("excludeId") String excludeId);

	/**
	 * 原生SQL物理删除角色，绕过MyBatis-Plus自动软删除
	 */
	@Delete("DELETE FROM sp_sys_role WHERE id = #{id}")
	void deleteRoleById(@Param("id") String id);
}
