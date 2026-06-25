package com.wangziyang.mes.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.system.entity.SpTeamUser;

/**
 * <p>
 * 班组用户关联 服务类
 * </p>
 *
 * @author SongPeng
 * @since 2021-10-15
 */
public interface ISpTeamUserService extends IService<SpTeamUser> {

    /**
     * 根据班组ID和用户ID统计关联记录数（新增时查重）
     */
    Long countExistTeamUser(String teamId, String userId);

    /**
     * 编辑时查重：目标班组+员工是否已存在，排除自身ID
     */
    Long countExistExcludeId(String teamId, String userId, String id);

    /**
     * 原生物理删除，直接从数据库移除记录
     */
    void deletePhysicalById(String id);
}
