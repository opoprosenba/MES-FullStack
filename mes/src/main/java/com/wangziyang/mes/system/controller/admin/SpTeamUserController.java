package com.wangziyang.mes.system.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.common.BaseController;
import com.wangziyang.mes.common.Result;
import com.wangziyang.mes.system.entity.SpTeam;
import com.wangziyang.mes.system.entity.SpTeamUser;
import com.wangziyang.mes.system.entity.SysUser;
import com.wangziyang.mes.system.request.SpTeamUserPageReq;
import com.wangziyang.mes.system.service.ISpTeamService;
import com.wangziyang.mes.system.service.ISpTeamUserService;
import com.wangziyang.mes.system.service.ISysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * 班组员工关联 前端控制器
 * </p>
 *
 * @author SongPeng
 */
@Controller("adminSpTeamUserController")
@RequestMapping("/admin/basedata/teamUser")
public class SpTeamUserController extends BaseController {

    @Autowired
    private ISpTeamUserService spTeamUserService;

    @Autowired
    private ISpTeamService spTeamService;

    @Autowired
    private ISysUserService sysUserService;

    public static class TeamUserVO {
        public String id;
        public String teamId;
        public String userId;
        public String teamName;
        public String teamCode;
        public String username;
        public String userName;
        public String createTime;
        public String createUsername;

        public TeamUserVO() {}
    }

    public static class PageResultVO {
        public List<?> records;
        public long total;
        public long size;
        public long current;

        public PageResultVO(List<?> records, long total, long size, long current) {
            this.records = records;
            this.total = total;
            this.size = size;
            this.current = current;
        }
    }

    @PostMapping("/page")
    @ResponseBody
    public Result page(SpTeamUserPageReq req) {
        Page<SpTeamUser> page = new Page<>(req.getCurrent(), req.getSize());
        QueryWrapper<SpTeamUser> qw = new QueryWrapper<>();
        if (req.getTeamId() != null && !req.getTeamId().isEmpty()) {
            qw.eq("team_id", req.getTeamId());
        }
        qw.orderByDesc("create_time");
        com.baomidou.mybatisplus.core.metadata.IPage<SpTeamUser> result = spTeamUserService.page(page, qw);

        // Fetch related team and user names
        List<SpTeamUser> records = result.getRecords();
        if (!records.isEmpty()) {
            // Get all team IDs
            List<String> teamIds = records.stream().map(SpTeamUser::getTeamId).distinct().collect(Collectors.toList());
            List<String> userIds = records.stream().map(SpTeamUser::getUserId).distinct().collect(Collectors.toList());

            // Fetch teams
            List<SpTeam> teams = new java.util.ArrayList<>(spTeamService.listByIds(teamIds));

            // Fetch users
            List<SysUser> users = new java.util.ArrayList<>(sysUserService.listByIds(userIds));

            // Build result with names
            List<TeamUserVO> resultRecords = records.stream().map(tu -> {
                TeamUserVO vo = new TeamUserVO();
                vo.id = tu.getId();
                vo.teamId = tu.getTeamId();
                vo.userId = tu.getUserId();
                SpTeam team = teams.stream().filter(t -> t.getId().equals(tu.getTeamId())).findFirst().orElse(null);
                SysUser user = users.stream().filter(u -> u.getId().equals(tu.getUserId())).findFirst().orElse(null);
                vo.teamName = team != null ? team.getName() : "";
                vo.teamCode = team != null ? team.getCode() : "";
                vo.username = user != null ? user.getUsername() : "";
                vo.userName = user != null ? user.getName() : "";
                vo.createTime = tu.getCreateTime() != null ? tu.getCreateTime().toString() : "";
                vo.createUsername = tu.getCreateUsername();
                return vo;
            }).collect(Collectors.toList());

            return Result.success(new PageResultVO(resultRecords, result.getTotal(), result.getSize(), result.getCurrent()));
        }

        return Result.success(new PageResultVO(records, result.getTotal(), result.getSize(), result.getCurrent()));
    }

    @GetMapping("/{id}")
    @ResponseBody
    public Result getById(@PathVariable String id) {
        SpTeamUser tu = spTeamUserService.getById(id);
        return Result.success(tu);
    }

    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpTeamUser record) {
        if (record.getId() == null || record.getId().isEmpty()) {
            record.setId(null);
            // 新增时校验班组内该员工是否已存在
            Long count = spTeamUserService.countExistTeamUser(record.getTeamId(), record.getUserId());
            if (count != null && count > 0) {
                return Result.failure("该员工已加入当前班组，请勿重复添加");
            }
        } else {
            // 编辑时校验：目标班组是否已存在该员工（排除当前编辑的记录）
            Long count = spTeamUserService.countExistExcludeId(record.getTeamId(), record.getUserId(), record.getId());
            if (count != null && count > 0) {
                return Result.failure("该员工已存在于目标班组，请勿重复添加");
            }
        }
        spTeamUserService.saveOrUpdate(record);
        return Result.success(record.getId());
    }

    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        spTeamUserService.deletePhysicalById(id);
        return Result.success(null);
    }

    @PostMapping("/batch-delete")
    @ResponseBody
    public Result batchDelete(@RequestBody Map<String, String[]> params) {
        String[] ids = params.get("ids");
        if (ids != null && ids.length > 0) {
            for (String id : ids) {
                spTeamUserService.deletePhysicalById(id);
            }
        }
        return Result.success(null);
    }
}
