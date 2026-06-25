package com.wangziyang.mes.basedata.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.basedata.entity.SpProcessUnitTeam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 加工单元-班组关联 Mapper 接口
 *
 * @author SongPeng
 */
@Mapper
public interface SpProcessUnitTeamMapper extends BaseMapper<SpProcessUnitTeam> {

    /**
     * 根据加工单元ID，物理删除所有班组绑定记录
     */
    @Delete("DELETE FROM sp_process_unit_team WHERE unit_id = #{unitId}")
    void deleteByUnitId(@Param("unitId") String unitId);
}
