package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wangziyang.mes.basedata.entity.SpPartsCategory;
import com.wangziyang.mes.basedata.mapper.SpPartsCategoryMapper;
import com.wangziyang.mes.basedata.service.ISpPartsCategoryService;
import org.springframework.stereotype.Service;

/**
 * 物料分类服务实现类
 *
 * @author WangZiYang
 */
@Service
public class SpPartsCategoryServiceImpl extends ServiceImpl<SpPartsCategoryMapper, SpPartsCategory> implements ISpPartsCategoryService {
}