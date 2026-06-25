package com.wangziyang.mes.basedata.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.wangziyang.mes.basedata.entity.SpParts;

/**
 * 零部件服务接口
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
public interface ISpPartsService extends IService<SpParts> {

    /**
     * 物理删除零部件：校验BOM引用后彻底移除记录
     */
    void deletePhysicalById(String id);
}