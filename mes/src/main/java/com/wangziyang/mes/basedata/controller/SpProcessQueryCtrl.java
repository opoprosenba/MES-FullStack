package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wangziyang.mes.basedata.entity.SpProcess;
import com.wangziyang.mes.basedata.entity.SpProcessDetail;
import com.wangziyang.mes.basedata.entity.SpProductBom;
import com.wangziyang.mes.basedata.entity.SpProductBomNode;
import com.wangziyang.mes.basedata.service.ISpProcessService;
import com.wangziyang.mes.basedata.service.ISpProcessDetailService;
import com.wangziyang.mes.basedata.service.ISpProductBomNodeService;
import com.wangziyang.mes.basedata.service.ISpProductBomService;
import com.wangziyang.mes.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 产品工艺查询控制器
 * 纯查询只读接口：产品BOM树 + 工序详情
 */
@RestController
@RequestMapping("/basedata/process-query")
public class SpProcessQueryCtrl {

    @Autowired
    @Qualifier("productBomService")
    private ISpProductBomService productBomService;

    @Autowired
    @Qualifier("productBomNodeService")
    private ISpProductBomNodeService bomNodeService;

    @Autowired
    @Qualifier("processService")
    private ISpProcessService processService;

    @Autowired
    @Qualifier("processDetailService")
    private ISpProcessDetailService processDetailService;

    /**
     * 获取产品BOM树形结构
     * 返回每个节点附带：工艺是否完成打勾、是否锁定、关联的工序ID
     */
    @GetMapping("/tree")
    public Result getProcessQueryTree(@RequestParam(required = false) String bomId) {
        // 1. 获取BOM主数据
        SpProductBom bom = null;
        if (bomId != null && !bomId.isEmpty()) {
            bom = productBomService.getById(bomId);
        }
        if (bom == null) {
            QueryWrapper<SpProductBom> bomQw = new QueryWrapper<>();
            bomQw.ne("is_deleted", 1);
            bomQw.orderByDesc("update_time");
            bomQw.last("LIMIT 1");
            bom = productBomService.getOne(bomQw);
        }
        if (bom == null) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("bomInfo", null);
            emptyResult.put("tree", new ArrayList<>());
            emptyResult.put("bomList", new ArrayList<>());
            return Result.success(emptyResult);
        }

        // 2. 获取所有BOM列表（用于下拉切换）
        QueryWrapper<SpProductBom> bomListQw = new QueryWrapper<>();
        bomListQw.ne("is_deleted", 1);
        bomListQw.orderByDesc("update_time");
        List<SpProductBom> bomList = productBomService.list(bomListQw);

        // 3. 获取BOM节点列表
        QueryWrapper<SpProductBomNode> nodeQw = new QueryWrapper<>();
        nodeQw.eq("bom_id", bom.getId());
        nodeQw.ne("is_deleted", 1);
        nodeQw.orderByAsc("level", "sort");
        List<SpProductBomNode> nodes = bomNodeService.list(nodeQw);

        // 4. 判断BOM是否锁定
        boolean isBomLocked = bom.getIsLocked() != null && bom.getIsLocked() == 1;

        // 5. 构建树形结构
        List<Map<String, Object>> treeList = buildTreeWithProcessStatus(nodes, isBomLocked);

        // 6. 组装返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("bomInfo", bom);
        result.put("bomList", bomList);
        result.put("tree", treeList);
        return Result.success(result);
    }

    /**
     * 获取工序详情
     * 用于右侧7个标签页显示
     */
    @GetMapping("/detail")
    public Result getProcessDetail(@RequestParam(required = true) Long processId) {
        if (processId == null) {
            return Result.failure("工序ID不能为空");
        }
        SpProcess process = processService.getById(processId);
        if (process == null) {
            return Result.failure("工序不存在");
        }

        // 查询工艺详情
        SpProcessDetail processDetail = processDetailService.getByProcessId(processId);

        // 组装7个标签页的内容
        Map<String, Object> detail = new HashMap<>();

        // 1. 基础信息
        Map<String, Object> baseInfo = new HashMap<>();
        baseInfo.put("processCode", process.getProcessCode());
        baseInfo.put("processName", process.getProcessName());
        baseInfo.put("workHour", process.getWorkHour());
        baseInfo.put("manufactureCycle", process.getManufactureCycle());
        baseInfo.put("workUnitName", process.getWorkUnitName());
        baseInfo.put("isGeneratePlan", process.getIsGeneratePlan());
        baseInfo.put("remark", process.getRemark());
        baseInfo.put("status", process.getStatus());
        detail.put("baseInfo", baseInfo);

        // 从 sp_process_detail 表读取工艺详情
        if (processDetail != null) {
            // 2. 工序内容
            detail.put("content", processDetail.getProcessContent() != null ? processDetail.getProcessContent() : "");

            // 3. 工序要求
            detail.put("requirement", processDetail.getProcessRequirement() != null ? processDetail.getProcessRequirement() : "");

            // 4. 注意事项
            detail.put("attention", processDetail.getAttention() != null ? processDetail.getAttention() : "");

            // 5. 工装设备
            String equipmentStr = processDetail.getEquipment();
            if (equipmentStr != null && !equipmentStr.trim().isEmpty()) {
                detail.put("equipment", parseEquipmentList(equipmentStr));
            } else {
                detail.put("equipment", new ArrayList<Map<String, Object>>());
            }

            // 6. 技术文档
            String documentStr = processDetail.getTechDocument();
            if (documentStr != null && !documentStr.trim().isEmpty()) {
                detail.put("document", parseDocumentList(documentStr));
            } else {
                detail.put("document", new ArrayList<Map<String, Object>>());
            }

            // 7. 备料清单
            String materialStr = processDetail.getMaterialList();
            if (materialStr != null && !materialStr.trim().isEmpty()) {
                detail.put("materialList", parseMaterialList(materialStr));
            } else {
                detail.put("materialList", new ArrayList<Map<String, Object>>());
            }
        } else {
            // 没有工艺详情数据，返回空值
            detail.put("content", "");
            detail.put("requirement", "");
            detail.put("attention", "");
            detail.put("equipment", new ArrayList<Map<String, Object>>());
            detail.put("document", new ArrayList<Map<String, Object>>());
            detail.put("materialList", new ArrayList<Map<String, Object>>());
        }

        return Result.success(detail);
    }

    /**
     * 构建带工艺状态的树形结构
     */
    private List<Map<String, Object>> buildTreeWithProcessStatus(List<SpProductBomNode> nodes, boolean isBomLocked) {
        if (nodes == null || nodes.isEmpty()) {
            return new ArrayList<>();
        }

        // 第一层：parentId = "0" 或 "0" 的节点
        List<SpProductBomNode> rootNodes = new ArrayList<>();
        for (SpProductBomNode n : nodes) {
            if (n.getParentId() == null || "0".equals(n.getParentId())) {
                rootNodes.add(n);
            }
        }

        // 如果没有parentId="0"，取level最小的作为根节点
        if (rootNodes.isEmpty() && !nodes.isEmpty()) {
            int minLevel = nodes.get(0).getLevel() != null ? nodes.get(0).getLevel() : 0;
            for (SpProductBomNode n : nodes) {
                if (n.getLevel() != null && n.getLevel() < minLevel) {
                    minLevel = n.getLevel();
                }
            }
            for (SpProductBomNode n : nodes) {
                if (n.getLevel() != null && n.getLevel() == minLevel) {
                    rootNodes.add(n);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (SpProductBomNode root : rootNodes) {
            result.add(buildTreeNode(root, nodes, isBomLocked));
        }
        return result;
    }

    private Map<String, Object> buildTreeNode(SpProductBomNode node, List<SpProductBomNode> allNodes, boolean isBomLocked) {
        Map<String, Object> treeNode = new HashMap<>();
        treeNode.put("key", node.getId());
        treeNode.put("title", buildNodeTitle(node, isBomLocked));
        treeNode.put("nodeType", node.getNodeType());
        treeNode.put("nodeCode", node.getNodeCode());
        treeNode.put("nodeName", node.getNodeName());
        treeNode.put("quantity", node.getQuantity());
        treeNode.put("level", node.getLevel());

        // 工艺完成状态：关联了工序且BOM已锁定
        boolean isProcessFinished = (node.getProcessId() != null) && isBomLocked;
        treeNode.put("isProcessFinished", isProcessFinished);
        treeNode.put("processId", node.getProcessId());

        // 是否为根节点锁定
        boolean isRoot = node.getParentId() == null || "0".equals(node.getParentId());
        treeNode.put("isLocked", isBomLocked && isRoot);

        // 查找子节点
        List<Map<String, Object>> children = new ArrayList<>();
        for (SpProductBomNode n : allNodes) {
            if (node.getId().equals(n.getParentId())) {
                children.add(buildTreeNode(n, allNodes, isBomLocked));
            }
        }
        if (!children.isEmpty()) {
            treeNode.put("children", children);
        }
        return treeNode;
    }

    private String buildNodeTitle(SpProductBomNode node, boolean isBomLocked) {
        StringBuilder title = new StringBuilder();

        // 根节点显示锁定图标
        boolean isRoot = node.getParentId() == null || "0".equals(node.getParentId());
        if (isRoot && isBomLocked) {
            title.append("🔒 ");
        }

        // 节点类型 + 名称
        title.append(node.getNodeType() != null ? "[" + node.getNodeType() + "] " : "");
        title.append(node.getNodeName() != null ? node.getNodeName() : "(未命名)");
        if (node.getNodeCode() != null && !node.getNodeCode().isEmpty()) {
            title.append(" (").append(node.getNodeCode()).append(")");
        }

        // 工艺完成显示绿色对勾
        if (node.getProcessId() != null && isBomLocked) {
            title.append(" ✅");
        } else if (node.getProcessId() != null && !isBomLocked) {
            title.append(" (未锁定)");
        }

        return title.toString();
    }

    /**
     * 解析设备信息：每行一条，格式：名称|规格
     */
    private List<Map<String, Object>> parseEquipmentList(String str) {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] lines = str.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split("\\|");
            Map<String, Object> item = new HashMap<>();
            item.put("index", i + 1);
            item.put("name", parts.length > 0 ? parts[0].trim() : line);
            item.put("spec", parts.length > 1 ? parts[1].trim() : "");
            result.add(item);
        }
        return result;
    }

    /**
     * 解析技术文档：每行一条，格式：文档名称|类型|说明
     */
    private List<Map<String, Object>> parseDocumentList(String str) {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] lines = str.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split("\\|");
            Map<String, Object> item = new HashMap<>();
            item.put("index", i + 1);
            item.put("name", parts.length > 0 ? parts[0].trim() : line);
            item.put("type", parts.length > 1 ? parts[1].trim() : "指导书");
            item.put("remark", parts.length > 2 ? parts[2].trim() : "");
            result.add(item);
        }
        return result;
    }

    /**
     * 解析备料清单：每行一条，格式：物料名称|数量|单位|规格
     */
    private List<Map<String, Object>> parseMaterialList(String str) {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] lines = str.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split("\\|");
            Map<String, Object> item = new HashMap<>();
            item.put("index", i + 1);
            item.put("name", parts.length > 0 ? parts[0].trim() : line);
            item.put("qty", parts.length > 1 ? parts[1].trim() : "1");
            item.put("unit", parts.length > 2 ? parts[2].trim() : "个");
            item.put("spec", parts.length > 3 ? parts[3].trim() : "");
            result.add(item);
        }
        return result;
    }
}
