package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpEquipmentGroup;
import com.wangziyang.mes.basedata.mapper.GroupEquipmentRelMapper;
import com.wangziyang.mes.basedata.mapper.SpEquipmentGroupMapper;
import com.wangziyang.mes.basedata.service.ISpEquipmentGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 设备编组服务实现类
 *
 * @author SongPeng
 */
@Service
public class SpEquipmentGroupServiceImpl extends ServiceImpl<SpEquipmentGroupMapper, SpEquipmentGroup> implements ISpEquipmentGroupService {

    @Autowired
    private GroupEquipmentRelMapper groupEquipmentRelMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePhysicalById(String id) {
        groupEquipmentRelMapper.deleteByGroupId(id);
        baseMapper.deletePhysicalById(id);
    }
}
