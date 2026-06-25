package com.wangziyang.mes.basedata.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.wangziyang.mes.basedata.entity.SpProductBom;
import com.wangziyang.mes.basedata.entity.SpProductBomNode;
import com.wangziyang.mes.basedata.mapper.ProductBomMapper;
import com.wangziyang.mes.basedata.mapper.ProductBomNodeMapper;
import com.wangziyang.mes.basedata.service.ISpProductBomService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service("productBomService")
public class SpProductBomServiceImpl extends ServiceImpl<ProductBomMapper, SpProductBom> implements ISpProductBomService {

    @Autowired
    private ProductBomNodeMapper bomNodeMapper;

    /**
     * 校验同物料同版本是否重复
     * @param bom 待保存/编辑的BOM实体
     */
    public void checkVersionRepeat(SpProductBom bom) {
        LambdaQueryWrapper<SpProductBom> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(SpProductBom::getProductMaterialId, bom.getProductMaterialId());
        wrapper.eq(SpProductBom::getVersion, bom.getVersion());
        wrapper.eq(SpProductBom::getIsDeleted, 0);
        // 关键修复：存在ID时，排除当前这条数据，编辑不再误判重复
        if (bom.getId() != null) {
            wrapper.ne(SpProductBom::getId, bom.getId());
        }
        long count = this.count(wrapper);
        if (count > 0) {
            throw new RuntimeException("该产品物料已存在相同版本的BOM");
        }
    }

    /**
     * 删除BOM（事务 + 先删子表 + 逻辑删除主表）
     * @param bomId BOM ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void removeBomById(String bomId) {
        // 1. 查询BOM是否存在
        SpProductBom bom = this.getById(bomId);
        if (bom == null) {
            throw new RuntimeException("该BOM数据不存在");
        }
        // 关键修复：已删除的数据直接返回，不执行更新操作
        if (bom.getIsDeleted() == 1) {
            return;
        }
        // 业务规则：已定版BOM禁止删除
        if (bom.getIsLocked() == 1) {
            throw new RuntimeException("已锁定定版的BOM不允许删除");
        }

        // 2. 先级联删除关联子表BOM节点数据，解除外键约束
        LambdaQueryWrapper<SpProductBomNode> nodeWrapper = Wrappers.lambdaQuery();
        nodeWrapper.eq(SpProductBomNode::getBomId, bomId);
        bomNodeMapper.delete(nodeWrapper);

        // 3. 逻辑删除主表数据
        SpProductBom updateEntity = new SpProductBom();
        updateEntity.setId(bomId);
        updateEntity.setIsDeleted(1);
        updateEntity.setUpdateTime(LocalDateTime.now());
        this.updateById(updateEntity);
    }
}
