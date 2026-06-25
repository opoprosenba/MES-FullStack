package com.wangziyang.mes.basedata.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.basedata.entity.GroupEquipmentRel;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 编组-设备关联 Mapper 接口
 *
 * @author SongPeng
 */
@Mapper
public interface GroupEquipmentRelMapper extends BaseMapper<GroupEquipmentRel> {

    /**
     * 原生物理删除，直接从数据库移除记录，彻底避开软删除机制
     */
    @Delete("DELETE FROM sp_group_equipment_rel WHERE id = #{id}")
    void deletePhysicalById(@Param("id") String id);

    /**
     * 根据编组ID，物理删除该编组下所有设备关联记录
     */
    @Delete("DELETE FROM sp_group_equipment_rel WHERE group_id = #{groupId}")
    void deleteByGroupId(@Param("groupId") String groupId);
}
