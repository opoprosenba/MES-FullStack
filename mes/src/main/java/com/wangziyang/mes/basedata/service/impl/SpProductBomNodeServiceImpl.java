package com.wangziyang.mes.basedata.service.impl;

import com.wangziyang.mes.basedata.entity.SpProductBomNode;
import com.wangziyang.mes.basedata.mapper.ProductBomNodeMapper;
import com.wangziyang.mes.basedata.service.ISpProductBomNodeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service("productBomNodeService")
public class SpProductBomNodeServiceImpl extends ServiceImpl<ProductBomNodeMapper, SpProductBomNode> implements ISpProductBomNodeService {
}
