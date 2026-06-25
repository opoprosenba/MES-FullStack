package com.wangziyang.mes.basedata.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.SpProcess;
import com.wangziyang.mes.basedata.entity.SpProcessUnit;
import com.wangziyang.mes.basedata.request.SpProcessReq;
import com.wangziyang.mes.basedata.service.ISpProcessService;
import com.wangziyang.mes.basedata.service.ISpProcessUnitService;
import com.wangziyang.mes.common.Result;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/basedata/process")
public class SpProcessCtrl {

    @Autowired
    @Qualifier("processService")
    private ISpProcessService processService;

    @Autowired
    @Qualifier("spProcessUnitServiceImpl")
    private ISpProcessUnitService spProcessUnitService;

    @GetMapping("/get-by-id")
    public Result getById(String id) {
        SpProcess result = processService.getById(id);
        return Result.success(result);
    }

    @GetMapping("/page")
    public Result page(SpProcessReq req) {
        QueryWrapper<SpProcess> queryWrapper = new QueryWrapper<>();
        // 唯一强制条件：未逻辑删除
        queryWrapper.ne("is_deleted", 1);
        
        // 以下为可选搜索条件，无值不生效
        if (StringUtils.isNotEmpty(req.getProcessCode())) {
            queryWrapper.like("process_code", req.getProcessCode());
        }
        if (StringUtils.isNotEmpty(req.getProcessName())) {
            queryWrapper.like("process_name", req.getProcessName());
        }
        if (req.getWorkUnitId() != null) {
            queryWrapper.eq("work_unit_id", req.getWorkUnitId());
        }
        if (StringUtils.isNotEmpty(req.getStatus())) {
            queryWrapper.eq("status", req.getStatus());
        }
        
        // 按创建时间倒序，新增的排在最前
        queryWrapper.orderByDesc("create_time");
        
        Page<SpProcess> page = new Page<>(
            req.getCurrent() != null ? req.getCurrent() : 1,
            req.getSize() != null ? req.getSize() : 10
        );
        IPage<SpProcess> result = processService.page(page, queryWrapper);
        return Result.success(result);
    }

    @PostMapping(value = "/add", consumes = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE, org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    public Result add(SpProcess record) {
        // 校验工序名称
        if (StringUtils.isEmpty(record.getProcessName())) {
            return Result.failure("工序名称不能为空");
        }
        // 校验加工单元
        if (record.getWorkUnitId() == null) {
            return Result.failure("请选择加工单元");
        }
        SpProcessUnit workUnit = spProcessUnitService.getById(record.getWorkUnitId());
        if (workUnit == null) {
            return Result.failure("加工单元不存在");
        }
        String workUnitStatus = workUnit.getStatus() != null ? workUnit.getStatus().trim() : "";
        if (!"0".equals(workUnitStatus)) {
            return Result.failure("加工单元状态不正常");
        }
        // 自动填充加工单元名称
        record.setWorkUnitName(workUnit.getName());

        // 校验工时和周期
        if (record.getWorkHour() == null || record.getWorkHour() < 1) {
            return Result.failure("工序工时必须大于等于1");
        }
        if (record.getManufactureCycle() == null || record.getManufactureCycle() < 1) {
            return Result.failure("制造周期必须大于等于1");
        }
        if (record.getManufactureCycle() < record.getWorkHour()) {
            return Result.failure("制造周期必须大于等于工序工时");
        }

        // 强制设置默认值，确保列表可查询到
        record.setStatus("正常");
        record.setIsDeleted(0);
        if (StringUtils.isEmpty(record.getIsGeneratePlan())) {
            record.setIsGeneratePlan("是");
        }

        // 委托 Service 自动生成工序编号并落库
        return processService.addProcess(record);
    }

    @PostMapping(value = "/update", consumes = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE, org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    public Result update(SpProcess record) {
        if (record.getId() == null) {
            return Result.failure("工序ID不能为空");
        }
        
        SpProcess exist = processService.getById(record.getId());
        if (exist == null) {
            return Result.failure("工序不存在");
        }
        
        // 工序编号不可修改
        // 校验工序名称
        if (StringUtils.isNotEmpty(record.getProcessName())) {
            exist.setProcessName(record.getProcessName());
        }
        // 校验并更新加工单元
        if (record.getWorkUnitId() != null) {
            SpProcessUnit workUnit = spProcessUnitService.getById(record.getWorkUnitId());
            if (workUnit == null) {
                return Result.failure("加工单元不存在");
            }
            String workUnitStatus = workUnit.getStatus() != null ? workUnit.getStatus().trim() : "";
            if (!"0".equals(workUnitStatus)) {
                return Result.failure("加工单元状态不正常");
            }
            exist.setWorkUnitId(record.getWorkUnitId());
            exist.setWorkUnitName(workUnit.getName());
        }
        // 校验工时和周期
        if (record.getWorkHour() != null) {
            if (record.getWorkHour() < 1) {
                return Result.failure("工序工时必须大于等于1");
            }
            exist.setWorkHour(record.getWorkHour());
        }
        if (record.getManufactureCycle() != null) {
            if (record.getManufactureCycle() < 1) {
                return Result.failure("制造周期必须大于等于1");
            }
            exist.setManufactureCycle(record.getManufactureCycle());
        }
        if (exist.getWorkHour() != null && exist.getManufactureCycle() != null) {
            if (exist.getManufactureCycle() < exist.getWorkHour()) {
                return Result.failure("制造周期必须大于等于工序工时");
            }
        }
        // 更新其他字段
        if (record.getIsGeneratePlan() != null) {
            exist.setIsGeneratePlan(record.getIsGeneratePlan());
        }
        if (record.getRemark() != null) {
            exist.setRemark(record.getRemark());
        }
        if (record.getStatus() != null) {
            exist.setStatus(record.getStatus());
        }
        
        exist.setIsDeleted(0);
        
        processService.updateById(exist);
        return Result.success();
    }

    @PostMapping(value = "/delete", consumes = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE, org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    public Result delete(SpProcess req) {
        if (req.getId() == null) {
            return Result.failure("工序ID不能为空");
        }
        SpProcess exist = processService.getById(req.getId());
        if (exist == null) {
            return Result.failure("工序不存在");
        }

        // 委托 Service 校验下游引用并物理删除
        return processService.deleteProcess(req.getId());
    }

    /**
     * 加工单元下拉接口
     */
    @GetMapping("/work-unit-select")
    public Result workUnitSelect() {
        QueryWrapper<SpProcessUnit> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 0);
        queryWrapper.ne("is_deleted", 1);
        queryWrapper.orderByAsc("code");
        List<SpProcessUnit> list = spProcessUnitService.list(queryWrapper);
        return Result.success(list);
    }

    /**
     * 工序下拉接口（返回正常状态工序）
     */
    @GetMapping("/process-select")
    public Result processSelect() {
        QueryWrapper<SpProcess> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "正常");
        queryWrapper.ne("is_deleted", 1);
        queryWrapper.orderByAsc("process_code");
        List<SpProcess> list = processService.list(queryWrapper);
        return Result.success(list);
    }
}
