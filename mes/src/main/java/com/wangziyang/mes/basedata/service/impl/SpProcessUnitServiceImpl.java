package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpProcessUnit;
import com.wangziyang.mes.basedata.mapper.SpProcessUnitMapper;
import com.wangziyang.mes.basedata.mapper.SpProcessUnitTeamMapper;
import com.wangziyang.mes.basedata.service.ISpProcessUnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 加工单元服务实现类
 *
 * @author SongPeng
 */
@Service
public class SpProcessUnitServiceImpl extends ServiceImpl<SpProcessUnitMapper, SpProcessUnit> implements ISpProcessUnitService {

    @Autowired
    private SpProcessUnitTeamMapper spProcessUnitTeamMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePhysicalById(String id) {
        // 1. 先删除加工单元-班组关联数据，解除外键依赖
        spProcessUnitTeamMapper.deleteByUnitId(id);

        // 2. 再物理删除加工单元主表记录，彻底移除数据
        baseMapper.deletePhysicalById(id);
    }
}
