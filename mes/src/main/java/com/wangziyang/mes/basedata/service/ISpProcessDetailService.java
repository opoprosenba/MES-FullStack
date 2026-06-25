package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.SpProcessDetail;

/**
 * 工序工艺详情服务接口
 */
public interface ISpProcessDetailService extends IService<SpProcessDetail> {

    /**
     * 根据工序ID查询工艺详情
     */
    SpProcessDetail getByProcessId(Long processId);
}
