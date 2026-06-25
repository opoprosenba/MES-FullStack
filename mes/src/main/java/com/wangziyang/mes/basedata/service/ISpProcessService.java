package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.SpProcess;
import com.wangziyang.mes.common.Result;

public interface ISpProcessService extends IService<SpProcess> {

    /**
     * 物理删除工序：校验下游引用后彻底移除记录
     */
    void deletePhysicalById(Long id);

    /**
     * 新增工序：自动生成编号 + 数据落库
     */
    Result<SpProcess> addProcess(SpProcess record);

    /**
     * 删除工序：校验下游引用后物理删除
     */
    Result<Void> deleteProcess(Long id);
}