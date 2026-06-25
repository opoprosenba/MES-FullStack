package com.wangziyang.mes.basedata.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wangziyang.mes.basedata.entity.SpProcessUnit;
import com.wangziyang.mes.basedata.entity.SpProcessUnitTeam;
import com.wangziyang.mes.basedata.request.SpProcessUnitPageReq;
import com.wangziyang.mes.basedata.service.ISpProcessUnitService;
import com.wangziyang.mes.basedata.service.ISpProcessUnitTeamService;
import com.wangziyang.mes.common.Result;
import com.wangziyang.mes.system.entity.SpTeam;
import com.wangziyang.mes.system.service.ISpTeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller("adminSpProcessUnitController")
@RequestMapping("/basedata/processUnit")
public class SpProcessUnitController {

    @Autowired
    private ISpProcessUnitService spProcessUnitService;

    @Autowired
    private ISpProcessUnitTeamService spProcessUnitTeamService;

    @Autowired
    private ISpTeamService spTeamService;

    @GetMapping("/list-ui")
    public String listUI() { return "forward:/index.html"; }

    @PostMapping("/page")
    @ResponseBody
    public Result page(SpProcessUnitPageReq req) {
        QueryWrapper<SpProcessUnit> qw = new QueryWrapper<>();
        qw.ne("is_deleted", "1");
        if (req.getName() != null && !req.getName().isEmpty())
            qw.like("name", req.getName());
        if (req.getCode() != null && !req.getCode().isEmpty())
            qw.like("code", req.getCode());
        qw.orderByDesc("create_time");
        return Result.success(spProcessUnitService.page(req, qw));
    }

    @GetMapping("/{id}")
    @ResponseBody
    public Result getById(@PathVariable String id) {
        return Result.success(spProcessUnitService.getById(id));
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpProcessUnit record) {
        // 编辑状态下选择「已删除」，直接物理删除，彻底移除数据
        if (record.getId() != null && "1".equals(record.getDeleted())) {
            spProcessUnitService.deletePhysicalById(record.getId());
            return Result.success(null);
        }

        // 正常新增/编辑逻辑
        QueryWrapper<SpProcessUnit> qw = new QueryWrapper<>();
        qw.eq("code", record.getCode());
        qw.eq("is_deleted", "0");
        if (record.getId() != null) qw.ne("id", record.getId());
        long count = spProcessUnitService.count(qw);
        if (count > 0) return Result.failure("加工单元代码已存在");
        spProcessUnitService.saveOrUpdate(record);
        return Result.success(record.getId());
    }

    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        spProcessUnitService.deletePhysicalById(id);
        return Result.success(null);
    }

    @PostMapping("/batch-delete")
    @ResponseBody
    public Result batchDelete(@RequestBody Map<String, String[]> params) {
        String[] ids = params.get("ids");
        if (ids != null && ids.length > 0) {
            for (String id : ids) {
                spProcessUnitService.deletePhysicalById(id);
            }
        }
        return Result.success(null);
    }

    @PostMapping("/update-status")
    @ResponseBody
    public Result updateStatus(@RequestBody Map<String, String> params) {
        SpProcessUnit pu = new SpProcessUnit();
        pu.setId(params.get("id"));
        pu.setStatus(params.get("status"));
        spProcessUnitService.updateById(pu);
        return Result.success(null);
    }

    @GetMapping("/teams/{unitId}")
    @ResponseBody
    public Result getTeams(@PathVariable String unitId) {
        QueryWrapper<SpProcessUnitTeam> qw = new QueryWrapper<>();
        qw.eq("unit_id", unitId);
        qw.eq("is_deleted", "0");
        List<SpProcessUnitTeam> items = spProcessUnitTeamService.list(qw);
        if (items.isEmpty()) return Result.success(Collections.emptyList());
        List<String> teamIds = items.stream().map(SpProcessUnitTeam::getTeamId).collect(Collectors.toList());
        return Result.success(spTeamService.listByIds(teamIds));
    }

    @GetMapping("/teams/available")
    @ResponseBody
    public Result getAvailableTeams() {
        QueryWrapper<SpTeam> qw = new QueryWrapper<>();
        qw.eq("is_deleted", "0");
        qw.orderByAsc("code");
        return Result.success(spTeamService.list(qw));
    }

    @PostMapping("/teams/add")
    @ResponseBody
    public Result addTeam(@RequestBody Map<String, Object> params) {
        String unitId = (String) params.get("unitId");
        String teamId = (String) params.get("teamId");
        String remark = (String) params.get("remark");

        QueryWrapper<SpProcessUnitTeam> qw = new QueryWrapper<>();
        qw.eq("unit_id", unitId);
        qw.eq("team_id", teamId);
        qw.eq("is_deleted", "0");
        long count = spProcessUnitTeamService.count(qw);
        if (count > 0) {
            return Result.failure("该班组已绑定到当前加工单元");
        }

        SpProcessUnitTeam item = new SpProcessUnitTeam();
        item.setUnitId(unitId);
        item.setTeamId(teamId);
        item.setRemark(remark);
        item.setStatus("0");
        item.setDeleted("0");
        spProcessUnitTeamService.save(item);
        return Result.success(null);
    }

    @PostMapping("/teams/remove")
    @ResponseBody
    public Result removeTeam(@RequestBody Map<String, String> params) {
        String unitId = params.get("unitId");
        String teamId = params.get("teamId");
        
        QueryWrapper<SpProcessUnitTeam> qw = new QueryWrapper<>();
        qw.eq("unit_id", unitId);
        qw.eq("team_id", teamId);
        qw.eq("is_deleted", "0");
        
        List<SpProcessUnitTeam> relList = spProcessUnitTeamService.list(qw);
        if (relList.isEmpty()) {
            return Result.failure("未找到该班组关联关系，无需解绑");
        }

        SpProcessUnitTeam updateEntity = new SpProcessUnitTeam();
        updateEntity.setDeleted("1");
        spProcessUnitTeamService.update(updateEntity, qw);
        
        return Result.success(null);
    }
}
