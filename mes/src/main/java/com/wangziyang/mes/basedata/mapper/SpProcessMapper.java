package com.wangziyang.mes.basedata.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wangziyang.mes.basedata.entity.SpProcess;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SpProcessMapper extends BaseMapper<SpProcess> {

    /**
     * 原生物理删除工序，绕过软删除手动拦截
     */
    @Delete("DELETE FROM sp_process WHERE id = #{id}")
    void deletePhysicalById(@Param("id") Long id);

    /**
     * 查询产品BOM节点是否引用该工序
     */
    @Select("SELECT COUNT(1) FROM sp_product_bom_node WHERE process_id = #{pid}")
    Long countBomNodeRef(@Param("pid") Long pid);

    /**
     * 查询工序详情是否引用该工序
     */
    @Select("SELECT COUNT(1) FROM sp_process_detail WHERE process_id = #{pid}")
    Long countDetailRef(@Param("pid") Long pid);

    /**
     * 查询全表最大工序编号，用于自动生成流水号（含软删除记录，避免编号碰撞）
     */
    @Select("SELECT MAX(process_code) FROM sp_process")
    String selectMaxProcessCode();

    // TODO: 工艺路线模块开发完成后，取消注释以下方法并更新 Service 层引用校验
    // /**
    //  * 查询工艺路线是否引用该工序
    //  */
    // @Select("SELECT COUNT(1) FROM sp_tech_route_process WHERE process_id = #{pid}")
    // Long countRouteRef(@Param("pid") Long pid);
}