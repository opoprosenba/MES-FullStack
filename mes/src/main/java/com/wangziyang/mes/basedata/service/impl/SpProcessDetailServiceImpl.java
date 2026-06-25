package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpProcessDetail;
import com.wangziyang.mes.basedata.mapper.SpProcessDetailMapper;
import com.wangziyang.mes.basedata.service.ISpProcessDetailService;
import org.springframework.stereotype.Service;

/**
 * 工序工艺详情服务实现
 */
@Service("processDetailService")
public class SpProcessDetailServiceImpl extends ServiceImpl<SpProcessDetailMapper, SpProcessDetail> implements ISpProcessDetailService {

    @Override
    public SpProcessDetail getByProcessId(Long processId) {
        QueryWrapper<SpProcessDetail> qw = new QueryWrapper<>();
        qw.eq("process_id", processId);
        qw.eq("is_deleted", 0);
        return this.getOne(qw);
    }
}
