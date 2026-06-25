package com.wangziyang.mes.basedata.mapper;

import com.wangziyang.mes.basedata.entity.SpParts;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 零部件 Mapper 接口
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@Mapper
public interface SpPartsMapper extends BaseMapper<SpParts> {

    /**
     * 新增时校验零部件编号是否重复
     */
    @Select("SELECT COUNT(1) FROM sp_parts WHERE part_code = #{partCode}")
    Long countByCode(@Param("partCode") String partCode);

    /**
     * 编辑时校验编号是否重复，排除自身ID
     */
    @Select("SELECT COUNT(1) FROM sp_parts WHERE part_code = #{partCode} AND id != #{id}")
    Long countByCodeExcludeId(@Param("partCode") String partCode, @Param("id") String id);

    /**
     * 原生物理删除零部件，绕过软删除手动拦截
     */
    @Delete("DELETE FROM sp_parts WHERE id = #{id}")
    void deletePhysicalById(@Param("id") String id);

    /**
     * 删除前校验：是否被产品BOM节点引用
     */
    @Select("SELECT COUNT(1) FROM sp_product_bom_node WHERE node_type = '零部件' AND node_code = (SELECT part_code FROM sp_parts WHERE id = #{partsId})")
    Long countBomReference(@Param("partsId") String partsId);
}