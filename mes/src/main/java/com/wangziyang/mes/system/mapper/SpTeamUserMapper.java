package com.wangziyang.mes.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.system.entity.SpTeamUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * 班组用户关联 Mapper 接口
 * </p>
 *
 * @author SongPeng
 * @since 2021-10-15
 */
public interface SpTeamUserMapper extends BaseMapper<SpTeamUser> {

    /**
     * 根据班组ID和用户ID统计关联记录数（新增时查重，物理删除后无需过滤is_deleted）
     */
    @Select("SELECT COUNT(1) FROM sp_team_user WHERE team_id = #{teamId} AND user_id = #{userId}")
    Long countExistTeamUser(@Param("teamId") String teamId, @Param("userId") String userId);

    /**
     * 编辑时查重：目标班组+员工是否已存在，排除自身ID（物理删除后无需过滤is_deleted）
     */
    @Select("SELECT COUNT(1) FROM sp_team_user WHERE team_id = #{teamId} AND user_id = #{userId} AND id != #{id}")
    Long countExistExcludeId(@Param("teamId") String teamId, @Param("userId") String userId, @Param("id") String id);

    /**
     * 原生物理删除，直接从数据库移除记录，彻底避开软删除机制
     */
    @Delete("DELETE FROM sp_team_user WHERE id = #{id}")
    void deletePhysicalById(@Param("id") String id);
}
