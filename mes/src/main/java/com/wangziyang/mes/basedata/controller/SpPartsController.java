package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.SpParts;
import com.wangziyang.mes.basedata.mapper.SpPartsMapper;
import com.wangziyang.mes.basedata.request.SpPartsReq;
import com.wangziyang.mes.basedata.service.ISpPartsService;
import com.wangziyang.mes.common.Result;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 零部件控制器
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@RestController
@RequestMapping("/basedata/parts")
public class SpPartsController {

    @Autowired
    private ISpPartsService iSpPartsService;

    @Autowired
    private SpPartsMapper spPartsMapper;

    @GetMapping("/get-by-id")
    @ResponseBody
    public Result getById(String id) {
        SpParts result = iSpPartsService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/page")
    @ResponseBody
    public Result page(@RequestBody SpPartsReq req) {
        QueryWrapper<SpParts> queryWrapper = new QueryWrapper<>();
        if (StringUtils.isNotEmpty(req.getStatus())) {
            queryWrapper.eq("status", req.getStatus());
        }
        if (StringUtils.isNotEmpty(req.getPartCode())) {
            queryWrapper.like("part_code", req.getPartCode());
        }
        if (StringUtils.isNotEmpty(req.getPartName())) {
            queryWrapper.like("part_name", req.getPartName());
        }
        if (req.getCategoryId() != null) {
            queryWrapper.eq("category_id", req.getCategoryId());
        }
        if (req.getPartsType() != null) {
            queryWrapper.eq("parts_type", req.getPartsType());
        }
        queryWrapper.ne("is_deleted", "1");
        queryWrapper.orderByDesc("update_time");

        Page<SpParts> page = new Page<>(req.getCurrent() != null ? req.getCurrent() : 1, req.getSize() != null ? req.getSize() : 10);
        IPage<SpParts> result = iSpPartsService.page(page, queryWrapper);
        return Result.success(result);
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpParts record) {
        if (StringUtils.isEmpty(record.getPartName())) {
            return Result.failure("零部件名称不能为空");
        }

        // 校验零部件编号全局唯一
        if (StringUtils.isNotEmpty(record.getPartCode())) {
            long codeCount;
            if (StringUtils.isNotEmpty(record.getId())) {
                codeCount = spPartsMapper.countByCodeExcludeId(record.getPartCode(), record.getId());
            } else {
                codeCount = spPartsMapper.countByCode(record.getPartCode());
            }
            if (codeCount > 0) {
                return Result.failure("零部件编号已存在，请勿重复添加");
            }
        }

        // 自动生成编号
        if (StringUtils.isEmpty(record.getPartCode())) {
            String newCode = generatePartCode();
            record.setPartCode(newCode);
        }

        // 默认状态
        if (StringUtils.isEmpty(record.getStatus())) {
            record.setStatus("正常");
        }

        // 默认版本号
        if (StringUtils.isEmpty(record.getVersion())) {
            record.setVersion("V1.0");
        }

        iSpPartsService.saveOrUpdate(record);
        return Result.success(record.getPartCode());
    }

    private synchronized String generatePartCode() {
        QueryWrapper<SpParts> qw = new QueryWrapper<>();
        qw.likeRight("part_code", "BOM").orderByDesc("part_code").last("LIMIT 1");
        SpParts last = iSpPartsService.getOne(qw);
        int next = 1;
        if (last != null && last.getPartCode() != null) {
            String numStr = last.getPartCode().substring(3);
            try { next = Integer.parseInt(numStr) + 1; } catch (NumberFormatException e) {}
        }
        return "BOM" + String.format("%06d", next);
    }

    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody SpParts req) {
        SpParts parts = iSpPartsService.getById(req.getId());
        if (parts == null) {
            return Result.failure("零部件不存在");
        }

        // 校验是否被BOM引用
        long bomRefCount = spPartsMapper.countBomReference(req.getId());
        if (bomRefCount > 0) {
            return Result.failure("该零部件已被产品BOM引用，无法删除");
        }

        // 物理删除，彻底移除数据
        iSpPartsService.deletePhysicalById(req.getId());
        return Result.success();
    }

    @PostMapping("/switch-status")
    @ResponseBody
    public Result switchStatus(@RequestBody SpParts req) {
        SpParts parts = iSpPartsService.getById(req.getId());
        if (parts == null) {
            return Result.failure("零部件不存在");
        }
        parts.setStatus(req.getStatus());
        iSpPartsService.updateById(parts);
        return Result.success("正常".equals(req.getStatus()) ? "已启用" : "已禁用");
    }

    @GetMapping("/list-select")
    @ResponseBody
    public Result listSelect() {
        QueryWrapper<SpParts> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "正常");
        queryWrapper.ne("is_deleted", "1");
        queryWrapper.orderByAsc("part_code");
        List<SpParts> list = iSpPartsService.list(queryWrapper);
        return Result.success(list);
    }
}