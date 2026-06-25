package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.SpMaterile;
import com.wangziyang.mes.basedata.entity.SpParts;
import com.wangziyang.mes.basedata.entity.SpProductBom;
import com.wangziyang.mes.basedata.entity.SpProductBomNode;
import com.wangziyang.mes.basedata.request.SpProductBomReq;
import com.wangziyang.mes.basedata.service.ISpMaterileService;
import com.wangziyang.mes.basedata.service.ISpPartsService;
import com.wangziyang.mes.basedata.service.ISpProductBomNodeService;
import com.wangziyang.mes.basedata.service.ISpProductBomService;
import com.wangziyang.mes.common.Result;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/basedata/product-bom-management")
public class SpProductBomManagementCtrl {

    @Autowired
    @Qualifier("productBomService")
    private ISpProductBomService iSpProductBomService;

    @Autowired
    @Qualifier("productBomNodeService")
    private ISpProductBomNodeService iSpProductBomNodeService;

    @Autowired
    private ISpMaterileService iSpMaterileService;

    @Autowired
    private ISpPartsService iSpPartsService;

    @GetMapping("/get-by-id")
    public Result getById(String id) {
        SpProductBom result = iSpProductBomService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/page")
    public Result page(@RequestBody SpProductBomReq req) {
        QueryWrapper<SpProductBom> queryWrapper = new QueryWrapper<>();
        // 唯一强制条件：未逻辑删除
        queryWrapper.eq("is_deleted", 0);

        // 以下均为可选搜索条件，无值不生效
        if (StringUtils.isNotEmpty(req.getProductMaterialCode())) {
            queryWrapper.like("product_material_code", req.getProductMaterialCode());
        }
        if (StringUtils.isNotEmpty(req.getProductMaterialName())) {
            queryWrapper.like("product_material_name", req.getProductMaterialName());
        }
        if (req.getVersion() != null) {
            queryWrapper.eq("version", req.getVersion());
        }
        if (StringUtils.isNotEmpty(req.getValidity())) {
            queryWrapper.eq("validity", req.getValidity());
        }
        if (req.getIsLocked() != null) {
            queryWrapper.eq("is_locked", req.getIsLocked());
        }

        // 按版本倒序排列，高版本在前
        queryWrapper.orderByDesc("version");

        Page<SpProductBom> page = new Page<>(req.getCurrent() != null ? req.getCurrent() : 1, req.getSize() != null ? req.getSize() : 10);
        IPage<SpProductBom> result = iSpProductBomService.page(page, queryWrapper);
        return Result.success(result);
    }

    @PostMapping("/add")
    public Result add(@RequestBody SpProductBom record) {
        if (record.getProductMaterialId() == null) {
            return Result.failure("请选择产品物料");
        }
        if (record.getVersion() == null || record.getVersion() < 1) {
            record.setVersion(1);
        }

        SpMaterile material = iSpMaterileService.getById(record.getProductMaterialId());
        if (material == null) {
            return Result.failure("产品物料不存在");
        }
        if (!"产品".equals(material.getMatType())) {
            return Result.failure("只能为产品类型物料创建BOM");
        }

        // 调用接口方法校验版本重复
        try {
            iSpProductBomService.checkVersionRepeat(record);
        } catch (RuntimeException e) {
            return Result.failure(e.getMessage());
        }

        record.setProductMaterialCode(material.getMateriel());
        record.setProductMaterialName(material.getMaterielDesc());
        record.setValidity("无效");
        record.setIsLocked(0);

        iSpProductBomService.save(record);

        SpProductBomNode rootNode = new SpProductBomNode();
        rootNode.setBomId(record.getId());
        rootNode.setParentId("0");
        rootNode.setNodeType("产品");
        rootNode.setNodeCode(material.getMateriel());
        rootNode.setNodeName(material.getMaterielDesc());
        rootNode.setQuantity(1);
        rootNode.setLevel(0);
        rootNode.setSort(0);
        iSpProductBomNodeService.save(rootNode);

        return Result.success(record);
    }

    @PostMapping("/update")
    public Result update(@RequestBody SpProductBom record) {
        if (record.getId() == null) {
            return Result.failure("BOM ID不能为空");
        }

        SpProductBom exist = iSpProductBomService.getById(record.getId());
        if (exist == null) {
            return Result.failure("BOM不存在");
        }
        if (exist.getIsLocked() != null && exist.getIsLocked() == 1) {
            return Result.failure("已定版的BOM不允许编辑");
        }

        exist.setRemark(record.getRemark());
        iSpProductBomService.updateById(exist);
        return Result.success();
    }

    @PostMapping("/delete")
    public Result delete(@RequestBody SpProductBom req) {
        try {
            iSpProductBomService.removeBomById(req.getId());
            return Result.success();
        } catch (RuntimeException e) {
            return Result.failure(e.getMessage());
        }
    }

    @PostMapping("/lock")
    public Result lock(@RequestBody SpProductBom req) {
        SpProductBom bom = iSpProductBomService.getById(req.getId());
        if (bom == null) {
            return Result.failure("BOM不存在");
        }
        if (bom.getIsLocked() != null && bom.getIsLocked() == 1) {
            return Result.failure("BOM已定版");
        }

        bom.setIsLocked(1);
        bom.setValidity("有效");
        iSpProductBomService.updateById(bom);
        return Result.success();
    }

    @PostMapping("/upgrade")
    public Result upgrade(@RequestBody SpProductBom req) {
        SpProductBom oldBom = iSpProductBomService.getById(req.getId());
        if (oldBom == null) {
            return Result.failure("BOM不存在");
        }

        int newVersion = oldBom.getVersion() + 1;

        QueryWrapper<SpProductBom> existQw = new QueryWrapper<>();
        existQw.eq("product_material_id", oldBom.getProductMaterialId());
        existQw.eq("version", newVersion);
        // 与列表保持一致：仅校验未删除的数据
        existQw.eq("is_deleted", 0);
        if (iSpProductBomService.count(existQw) > 0) {
            return Result.failure("新版本BOM已存在");
        }

        SpProductBom newBom = new SpProductBom();
        newBom.setProductMaterialId(oldBom.getProductMaterialId());
        newBom.setProductMaterialCode(oldBom.getProductMaterialCode());
        newBom.setProductMaterialName(oldBom.getProductMaterialName());
        newBom.setVersion(newVersion);
        newBom.setRemark(oldBom.getRemark());
        newBom.setValidity("无效");
        newBom.setIsLocked(0);
        iSpProductBomService.save(newBom);

        QueryWrapper<SpProductBomNode> nodeQw = new QueryWrapper<>();
        nodeQw.eq("bom_id", oldBom.getId());
        nodeQw.ne("is_deleted", "1");
        nodeQw.orderByAsc("level", "sort");
        List<SpProductBomNode> oldNodes = iSpProductBomNodeService.list(nodeQw);

        for (SpProductBomNode oldNode : oldNodes) {
            SpProductBomNode newNode = new SpProductBomNode();
            newNode.setBomId(newBom.getId());
            newNode.setParentId(oldNode.getParentId());
            newNode.setNodeType(oldNode.getNodeType());
            newNode.setNodeCode(oldNode.getNodeCode());
            newNode.setNodeName(oldNode.getNodeName());
            newNode.setQuantity(oldNode.getQuantity());
            newNode.setLevel(oldNode.getLevel());
            newNode.setSort(oldNode.getSort());
            iSpProductBomNodeService.save(newNode);
        }

        return Result.success(newBom);
    }

    @GetMapping("/nodes")
    public Result getNodes(String bomId) {
        QueryWrapper<SpProductBomNode> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("bom_id", bomId);
        queryWrapper.ne("is_deleted", 1);
        queryWrapper.orderByAsc("level", "sort");
        List<SpProductBomNode> nodes = iSpProductBomNodeService.list(queryWrapper);
        return Result.success(nodes);
    }

    @PostMapping("/node/add")
    public Result addNode(@RequestBody SpProductBomNode record) {
        if (record.getBomId() == null) {
            return Result.failure("BOM ID不能为空");
        }
        if (record.getParentId() == null) {
            return Result.failure("父节点ID不能为空");
        }
        if (StringUtils.isEmpty(record.getNodeType())) {
            return Result.failure("节点类型不能为空");
        }
        if (StringUtils.isEmpty(record.getNodeCode())) {
            return Result.failure("节点编号不能为空");
        }
        if (record.getQuantity() == null || record.getQuantity() < 1) {
            record.setQuantity(1);
        }

        SpProductBom bom = iSpProductBomService.getById(record.getBomId());
        if (bom == null) {
            return Result.failure("BOM不存在");
        }
        if (bom.getIsLocked() != null && bom.getIsLocked() == 1) {
            return Result.failure("已定版的BOM不允许添加节点");
        }

        if ("零部件".equals(record.getNodeType())) {
            QueryWrapper<SpParts> partsQw = new QueryWrapper<>();
            partsQw.eq("part_code", record.getNodeCode());
            partsQw.ne("is_deleted", "1");
            SpParts parts = iSpPartsService.getOne(partsQw);
            if (parts == null) {
                return Result.failure("零部件不存在，请先完成零部件定义");
            }
            record.setNodeName(parts.getPartName());
        } else if ("物料".equals(record.getNodeType())) {
            QueryWrapper<SpMaterile> materialQw = new QueryWrapper<>();
            materialQw.eq("material_code", record.getNodeCode());
            materialQw.ne("is_deleted", "1");
            SpMaterile material = iSpMaterileService.getOne(materialQw);
            if (material == null) {
                return Result.failure("物料不存在");
            }
            record.setNodeName(material.getMaterielDesc());
        }

        SpProductBomNode parentNode = iSpProductBomNodeService.getById(record.getParentId());
        if (parentNode == null) {
            return Result.failure("父节点不存在");
        }
        record.setLevel(parentNode.getLevel() + 1);

        QueryWrapper<SpProductBomNode> sortQw = new QueryWrapper<>();
        sortQw.eq("bom_id", record.getBomId());
        sortQw.eq("parent_id", record.getParentId());
        sortQw.ne("is_deleted", "1");
        sortQw.orderByDesc("sort");
        SpProductBomNode lastNode = iSpProductBomNodeService.getOne(sortQw);
        record.setSort(lastNode != null ? lastNode.getSort() + 1 : 0);

        iSpProductBomNodeService.save(record);
        return Result.success(record);
    }

    @PostMapping("/node/update")
    public Result updateNode(@RequestBody SpProductBomNode record) {
        if (record.getId() == null) {
            return Result.failure("节点ID不能为空");
        }

        SpProductBomNode exist = iSpProductBomNodeService.getById(record.getId());
        if (exist == null) {
            return Result.failure("节点不存在");
        }

        SpProductBom bom = iSpProductBomService.getById(exist.getBomId());
        if (bom != null && bom.getIsLocked() != null && bom.getIsLocked() == 1) {
            return Result.failure("已定版的BOM不允许编辑节点");
        }

        if (record.getQuantity() != null && record.getQuantity() >= 1) {
            exist.setQuantity(record.getQuantity());
        }
        iSpProductBomNodeService.updateById(exist);
        return Result.success();
    }

    @PostMapping("/node/delete")
    public Result deleteNode(@RequestBody SpProductBomNode req) {
        SpProductBomNode node = iSpProductBomNodeService.getById(req.getId());
        if (node == null) {
            return Result.failure("节点不存在");
        }
        if (node.getParentId() != null && "0".equals(node.getParentId())) {
            return Result.failure("根节点不允许删除");
        }

        SpProductBom bom = iSpProductBomService.getById(node.getBomId());
        if (bom != null && bom.getIsLocked() != null && bom.getIsLocked() == 1) {
            return Result.failure("已定版的BOM不允许删除节点");
        }

        deleteNodeRecursive(req.getId());
        return Result.success();
    }

    private void deleteNodeRecursive(String nodeId) {
        SpProductBomNode node = iSpProductBomNodeService.getById(nodeId);
        if (node != null) {
            node.setIsDeleted(1);
            iSpProductBomNodeService.updateById(node);

            QueryWrapper<SpProductBomNode> childQw = new QueryWrapper<>();
            childQw.eq("parent_id", nodeId);
            childQw.ne("is_deleted", 1);
            List<SpProductBomNode> children = iSpProductBomNodeService.list(childQw);
            for (SpProductBomNode child : children) {
                deleteNodeRecursive(child.getId());
            }
        }
    }

    @GetMapping("/material-select")
    public Result materialSelect() {
        QueryWrapper<SpMaterile> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("mat_type", "产品");
        queryWrapper.eq("is_deleted", "0");
        queryWrapper.orderByAsc("materiel");
        List<SpMaterile> list = iSpMaterileService.list(queryWrapper);
        return Result.success(list);
    }

    @GetMapping("/max-version")
    public Result getMaxVersion(String productMaterialId) {
        QueryWrapper<SpProductBom> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("product_material_id", productMaterialId);
        queryWrapper.eq("is_deleted", 0);
        queryWrapper.orderByDesc("version");
        queryWrapper.last("LIMIT 1");
        SpProductBom result = iSpProductBomService.getOne(queryWrapper);
        Integer maxVersion = result != null ? result.getVersion() : null;
        return Result.success(maxVersion);
    }
}
