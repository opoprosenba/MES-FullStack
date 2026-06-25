package com.wangziyang.mes.basedata.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.basedata.entity.SpEquipmentGroup;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 设备编组 Mapper 接口
 *
 * @author SongPeng
 */
@Mapper
public interface SpEquipmentGroupMapper extends BaseMapper<SpEquipmentGroup> {

    /**
     * 原生物理删除设备编组，绕过MyBatis-Plus软删除自动拦截
     */
    @Delete("DELETE FROM sp_equipment_group WHERE id = #{id}")
    void deletePhysicalById(@Param("id") String id);
}
