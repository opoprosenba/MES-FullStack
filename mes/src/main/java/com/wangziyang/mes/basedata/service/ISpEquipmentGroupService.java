package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.SpEquipmentGroup;

/**
 * 设备编组服务接口
 *
 * @author SongPeng
 */
public interface ISpEquipmentGroupService extends IService<SpEquipmentGroup> {

    /**
     * 物理删除设备编组：先删除关联数据，再删除主表记录
     */
    void deletePhysicalById(String id);
}
