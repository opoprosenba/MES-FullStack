package com.wangziyang.mes.basedata.mapper;

import com.wangziyang.mes.basedata.entity.SpLocation;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * 库位 Mapper 接口
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@Mapper
public interface SpLocationMapper extends BaseMapper<SpLocation> {

    /**
     * 新增时查重：同一库房下是否已存在相同的组排列层
     */
    @Select("SELECT COUNT(1) FROM sp_location WHERE store_id = #{storehouseId} AND group_no = #{groupNum} AND row_no = #{rowNum} AND layer_no = #{layerNum} AND col_no = #{colNum} AND is_deleted != 1")
    Long countByCoord(@Param("storehouseId") String storehouseId,
                      @Param("groupNum") Integer groupNum,
                      @Param("rowNum") Integer rowNum,
                      @Param("layerNum") Integer layerNum,
                      @Param("colNum") Integer colNum);

    /**
     * 编辑时查重：排除自身ID，校验同一库房下是否有重复坐标
     */
    @Select("SELECT COUNT(1) FROM sp_location WHERE store_id = #{storehouseId} AND group_no = #{groupNum} AND row_no = #{rowNum} AND layer_no = #{layerNum} AND col_no = #{colNum} AND id != #{id} AND is_deleted != 1")
    Long countByCoordExcludeId(@Param("storehouseId") String storehouseId,
                               @Param("groupNum") Integer groupNum,
                               @Param("rowNum") Integer rowNum,
                               @Param("layerNum") Integer layerNum,
                               @Param("colNum") Integer colNum,
                               @Param("id") String id);
}