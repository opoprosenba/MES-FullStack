package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.GroupEquipmentRel;
import com.wangziyang.mes.basedata.mapper.GroupEquipmentRelMapper;
import com.wangziyang.mes.basedata.service.IGroupEquipmentRelService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 编组-设备关联服务实现类
 *
 * @author SongPeng
 */
@Service
public class GroupEquipmentRelServiceImpl extends ServiceImpl<GroupEquipmentRelMapper, GroupEquipmentRel> implements IGroupEquipmentRelService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePhysicalById(String id) {
        baseMapper.deletePhysicalById(id);
    }
}
