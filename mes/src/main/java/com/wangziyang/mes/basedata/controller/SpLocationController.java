package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.SpLocation;
import com.wangziyang.mes.basedata.entity.SpStorehouse;
import com.wangziyang.mes.basedata.mapper.SpLocationMapper;
import com.wangziyang.mes.basedata.request.SpLocationReq;
import com.wangziyang.mes.basedata.service.ISpLocationService;
import com.wangziyang.mes.basedata.service.ISpStorehouseService;
import com.wangziyang.mes.common.Result;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 库位控制器
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
@RestController
@RequestMapping("/basedata/location")
public class SpLocationController {

    @Autowired
    private ISpLocationService iSpLocationService;

    @Autowired
    private ISpStorehouseService iSpStorehouseService;

    @Autowired
    private SpLocationMapper spLocationMapper;

    @GetMapping("/get-by-id")
    public Result getById(String id) {
        SpLocation result = iSpLocationService.getById(id);
        return Result.success(result);
    }

    @PostMapping("/page")
    public Result page(@RequestBody SpLocationReq req) {
        QueryWrapper<SpLocation> queryWrapper = new QueryWrapper<>();
        if (req.getStoreId() != null) {
            queryWrapper.eq("store_id", req.getStoreId());
        }
        if (StringUtils.isNotEmpty(req.getLocCode())) {
            queryWrapper.like("loc_code", req.getLocCode());
        }
        if (StringUtils.isNotEmpty(req.getStoreCode())) {
            queryWrapper.like("store_code", req.getStoreCode());
        }
        if (StringUtils.isNotEmpty(req.getStatus())) {
            queryWrapper.eq("status", req.getStatus());
        }
        queryWrapper.ne("is_deleted", "1");
        queryWrapper.orderByAsc("group_no").orderByAsc("row_no").orderByAsc("layer_no").orderByAsc("col_no");

        Page<SpLocation> page = new Page<>(req.getCurrent() != null ? req.getCurrent() : 1, req.getSize() != null ? req.getSize() : 10);
        IPage<SpLocation> result = iSpLocationService.page(page, queryWrapper);
        return Result.success(result);
    }

    @PostMapping("/add-or-update")
    public Result addOrUpdate(@RequestBody SpLocation record) {
        if (record.getStoreId() == null) {
            return Result.failure("所属库房不能为空");
        }
        if (record.getGroupNo() == null || record.getGroupNo() < 1) {
            return Result.failure("组号不能小于1");
        }
        if (record.getRowNo() == null || record.getRowNo() < 1) {
            return Result.failure("排号不能小于1");
        }
        if (record.getLayerNo() == null || record.getLayerNo() < 1) {
            return Result.failure("层号不能小于1");
        }
        if (record.getColNo() == null || record.getColNo() < 1) {
            return Result.failure("列号不能小于1");
        }

        SpStorehouse storehouse = iSpStorehouseService.getById(record.getStoreId());
        if (storehouse == null) {
            return Result.failure("所属库房不存在");
        }
        if ("1".equals(storehouse.getIsDeleted())) {
            return Result.failure("所属库房已被删除，无法添加库位");
        }
        if (!"正常".equals(storehouse.getStatus())) {
            return Result.failure("所属库房状态非正常，无法添加库位");
        }

        String locCode = generateLocCode(storehouse.getStoreCode(), record.getGroupNo(), record.getRowNo(), record.getLayerNo(), record.getColNo());
        record.setLocCode(locCode);
        record.setStoreCode(storehouse.getStoreCode());

        // 校验同一库房下组排列层是否重复
        long coordCount;
        if (StringUtils.isNotEmpty(record.getId())) {
            coordCount = spLocationMapper.countByCoordExcludeId(
                    record.getStoreId(), record.getGroupNo(), record.getRowNo(),
                    record.getLayerNo(), record.getColNo(), record.getId());
        } else {
            coordCount = spLocationMapper.countByCoord(
                    record.getStoreId(), record.getGroupNo(), record.getRowNo(),
                    record.getLayerNo(), record.getColNo());
        }
        if (coordCount > 0) {
            return Result.failure("当前库房下已存在相同组排列层的库位，请勿重复添加");
        }

        QueryWrapper<SpLocation> qw = new QueryWrapper<>();
        qw.eq("loc_code", locCode);
        qw.ne("is_deleted", "1");
        if (StringUtils.isNotEmpty(record.getId())) {
            qw.ne("id", record.getId());
        }
        long count = iSpLocationService.count(qw);
        if (count > 0) {
            return Result.failure("库位编码已存在");
        }

        if (StringUtils.isEmpty(record.getStatus())) {
            record.setStatus("正常");
        }

        iSpLocationService.saveOrUpdate(record);
        return Result.success(record.getLocCode());
    }

    private String generateLocCode(String storeCode, Integer groupNo, Integer rowNo, Integer layerNo, Integer colNo) {
        return String.format("%s-%d-%d-%d-%d", storeCode, groupNo, rowNo, layerNo, colNo);
    }

    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable String id) {
        SpLocation location = iSpLocationService.getById(id);
        if (location == null) {
            return Result.failure("库位不存在");
        }
        // 物理删除，彻底移除记录，避免软删除导致唯一索引冲突
        iSpLocationService.removeById(id);
        return Result.success();
    }

}