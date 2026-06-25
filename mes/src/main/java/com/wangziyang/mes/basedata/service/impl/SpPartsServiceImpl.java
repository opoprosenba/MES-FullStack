package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpParts;
import com.wangziyang.mes.basedata.mapper.SpPartsMapper;
import com.wangziyang.mes.basedata.service.ISpPartsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 零部件服务实现类
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@Service
public class SpPartsServiceImpl extends ServiceImpl<SpPartsMapper, SpParts> implements ISpPartsService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePhysicalById(String id) {
        // 直接物理删除零部件，彻底移除数据
        baseMapper.deletePhysicalById(id);
    }
}