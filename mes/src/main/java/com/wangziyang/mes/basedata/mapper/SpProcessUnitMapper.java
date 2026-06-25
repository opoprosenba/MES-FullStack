package com.wangziyang.mes.basedata.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.basedata.entity.SpProcessUnit;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 加工单元 Mapper 接口
 *
 * @author SongPeng
 */
@Mapper
public interface SpProcessUnitMapper extends BaseMapper<SpProcessUnit> {

    /**
     * 原生物理删除加工单元，绕过软删除手动拦截
     */
    @Delete("DELETE FROM sp_process_unit WHERE id = #{id}")
    void deletePhysicalById(@Param("id") String id);
}
