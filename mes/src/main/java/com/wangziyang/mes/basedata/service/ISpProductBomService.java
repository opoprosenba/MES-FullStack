package com.wangziyang.mes.basedata.service;

import com.wangziyang.mes.basedata.entity.SpProductBom;
import com.baomidou.mybatisplus.extension.service.IService;

public interface ISpProductBomService extends IService<SpProductBom> {

    void checkVersionRepeat(SpProductBom bom);

    void removeBomById(String bomId);
}
