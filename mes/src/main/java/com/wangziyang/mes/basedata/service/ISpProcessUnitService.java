package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.SpProcessUnit;

/**
 * 加工单元服务接口
 *
 * @author SongPeng
 */
public interface ISpProcessUnitService extends IService<SpProcessUnit> {

    /**
     * 物理删除加工单元：先删除关联班组数据，再删除主表记录
     */
    void deletePhysicalById(String id);
}
