package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.SpLocation;
import com.wangziyang.mes.basedata.entity.SpStorehouse;
import com.wangziyang.mes.basedata.request.SpStorehouseReq;
import com.wangziyang.mes.basedata.service.ISpLocationService;
import com.wangziyang.mes.basedata.service.ISpStorehouseService;
import com.wangziyang.mes.common.Result;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 库房控制器
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@RestController
@RequestMapping("/basedata/storehouse")
public class SpStorehouseController {

    @Autowired
    private ISpStorehouseService iSpStorehouseService;

    @Autowired
    private ISpLocationService iSpLocationService;

    @GetMapping("/get-by-id")
    @ResponseBody
    public Result getById(String id) {
        SpStorehouse result = iSpStorehouseService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/page")
    @ResponseBody
    public Result page(@RequestBody SpStorehouseReq req) {
        QueryWrapper<SpStorehouse> queryWrapper = new QueryWrapper<>();
        if (StringUtils.isNotEmpty(req.getStatus())) {
            queryWrapper.eq("status", req.getStatus());
        }
        if (StringUtils.isNotEmpty(req.getStoreCode())) {
            queryWrapper.like("store_code", req.getStoreCode());
        }
        if (StringUtils.isNotEmpty(req.getStoreName())) {
            queryWrapper.like("store_name", req.getStoreName());
        }
        if (StringUtils.isNotEmpty(req.getStoreType())) {
            queryWrapper.eq("store_type", req.getStoreType());
        }
        queryWrapper.ne("is_deleted", "1");
        queryWrapper.orderByDesc("update_time");

        Page<SpStorehouse> page = new Page<>(req.getCurrent() != null ? req.getCurrent() : 1, req.getSize() != null ? req.getSize() : 10);
        IPage<SpStorehouse> result = iSpStorehouseService.page(page, queryWrapper);
        return Result.success(result);
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpStorehouse record) {
        if (StringUtils.isEmpty(record.getStoreName())) {
            return Result.failure("库房名称不能为空");
        }
        if (StringUtils.isEmpty(record.getStoreType())) {
            return Result.failure("库房类型不能为空");
        }
        if (record.getGroupNum() == null || record.getGroupNum() < 1) {
            return Result.failure("组数量不能小于1");
        }
        if (record.getRowNum() == null || record.getRowNum() < 1) {
            return Result.failure("排数量不能小于1");
        }
        if (record.getLayerNum() == null || record.getLayerNum() < 1) {
            return Result.failure("层数量不能小于1");
        }
        if (record.getColNum() == null || record.getColNum() < 1) {
            return Result.failure("列数量不能小于1");
        }

        if (StringUtils.isNotEmpty(record.getStoreCode())) {
            QueryWrapper<SpStorehouse> qw = new QueryWrapper<>();
            qw.eq("store_code", record.getStoreCode());
            qw.ne("is_deleted", "1");
            if (StringUtils.isNotEmpty(record.getId())) {
                qw.ne("id", record.getId());
            }
            long count = iSpStorehouseService.count(qw);
            if (count > 0) {
                return Result.failure("库房编码已存在");
            }
        }

        if (StringUtils.isEmpty(record.getStoreCode())) {
            String newCode = generateStoreCode();
            record.setStoreCode(newCode);
        }

        if (StringUtils.isEmpty(record.getStatus())) {
            record.setStatus("正常");
        }

        iSpStorehouseService.saveOrUpdate(record);
        return Result.success(record.getStoreCode());
    }

    private synchronized String generateStoreCode() {
        QueryWrapper<SpStorehouse> qw = new QueryWrapper<>();
        qw.likeRight("store_code", "KF").orderByDesc("store_code").last("LIMIT 1");
        SpStorehouse last = iSpStorehouseService.getOne(qw);
        int next = 1;
        if (last != null && last.getStoreCode() != null) {
            String numStr = last.getStoreCode().substring(2);
            try { next = Integer.parseInt(numStr) + 1; } catch (NumberFormatException e) {}
        }
        return "KF" + String.format("%03d", next);
    }

    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody SpStorehouse req) {
        SpStorehouse storehouse = iSpStorehouseService.getById(req.getId());
        if (storehouse == null) {
            return Result.failure("库房不存在");
        }

        QueryWrapper<SpLocation> locQw = new QueryWrapper<>();
        locQw.eq("store_id", req.getId());
        locQw.ne("is_deleted", "1");
        long locCount = iSpLocationService.count(locQw);
        if (locCount > 0) {
            return Result.failure("该库房下存在库位，无法删除");
        }

        storehouse.setDeleted("1");
        iSpStorehouseService.updateById(storehouse);
        return Result.success();
    }

    @GetMapping("/list-select")
    @ResponseBody
    public Result listSelect() {
        QueryWrapper<SpStorehouse> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "正常");
        queryWrapper.ne("is_deleted", "1");
        queryWrapper.orderByAsc("store_code");
        List<SpStorehouse> list = iSpStorehouseService.list(queryWrapper);
        return Result.success(list);
    }

}