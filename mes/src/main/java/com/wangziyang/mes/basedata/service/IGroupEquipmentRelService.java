package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.GroupEquipmentRel;

/**
 * 编组-设备关联服务接口
 *
 * @author SongPeng
 */
public interface IGroupEquipmentRelService extends IService<GroupEquipmentRel> {

    /**
     * 原生物理删除，直接从数据库移除记录
     */
    void deletePhysicalById(String id);
}
