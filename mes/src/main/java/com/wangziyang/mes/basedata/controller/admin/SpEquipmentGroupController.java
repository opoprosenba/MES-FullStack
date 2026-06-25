package com.wangziyang.mes.basedata.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wangziyang.mes.basedata.entity.GroupEquipmentRel;
import com.wangziyang.mes.basedata.entity.SpDevice;
import com.wangziyang.mes.basedata.entity.SpEquipmentGroup;
import com.wangziyang.mes.basedata.request.SpEquipmentGroupPageReq;
import com.wangziyang.mes.basedata.service.IGroupEquipmentRelService;
import com.wangziyang.mes.basedata.service.ISpDeviceService;
import com.wangziyang.mes.basedata.service.ISpEquipmentGroupService;
import com.wangziyang.mes.common.BaseController;
import com.wangziyang.mes.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 设备编组控制器
 *
 * @author SongPeng
 */
@Controller("adminSpEquipmentGroupController")
@RequestMapping("/basedata/equipmentGroup")
public class SpEquipmentGroupController extends BaseController {

    @Autowired
    private ISpEquipmentGroupService spEquipmentGroupService;

    @Autowired
    private IGroupEquipmentRelService groupEquipmentRelService;

    @Autowired
    private ISpDeviceService spDeviceService;

    /**
     * 设备编组分页查询
     */
    @PostMapping("/page")
    @ResponseBody
    public Result page(SpEquipmentGroupPageReq req) {
        Page<SpEquipmentGroup> page = new Page<>(req.getCurrent(), req.getSize());
        QueryWrapper<SpEquipmentGroup> qw = new QueryWrapper<>();
        if (req.getCode() != null && !req.getCode().isEmpty()) {
            qw.like("code", req.getCode());
        }
        if (req.getName() != null && !req.getName().isEmpty()) {
            qw.like("name", req.getName());
        }
        qw.orderByDesc("create_time");
        IPage<SpEquipmentGroup> result = spEquipmentGroupService.page(page, qw);
        return Result.success(result);
    }

    /**
     * 获取编组详情
     */
    @GetMapping("/{id}")
    @ResponseBody
    public Result getById(@PathVariable String id) {
        return Result.success(spEquipmentGroupService.getById(id));
    }

    /**
     * 新增或编辑编组
     */
    @PostMapping("/add-or-update")
    @ResponseBody
    public Result addOrUpdate(@RequestBody SpEquipmentGroup record) {
        // 校验编组代码唯一性
        QueryWrapper<SpEquipmentGroup> qw = new QueryWrapper<>();
        qw.eq("code", record.getCode());
        if (record.getId() != null && !record.getId().isEmpty()) {
            qw.ne("id", record.getId());
        }
        long count = spEquipmentGroupService.count(qw);
        if (count > 0) {
            return Result.failure("编组代码已存在");
        }

        if (record.getId() == null || record.getId().isEmpty()) {
            record.setId(null);
        }
        spEquipmentGroupService.saveOrUpdate(record);
        return Result.success(record.getId());
    }

    /**
     * 删除编组
     */
    @PostMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        spEquipmentGroupService.deletePhysicalById(id);
        return Result.success(null);
    }

    /**
     * 批量删除编组
     */
    @PostMapping("/batch-delete")
    @ResponseBody
    public Result batchDelete(@RequestBody Map<String, String[]> params) {
        String[] ids = params.get("ids");
        if (ids != null && ids.length > 0) {
            for (String id : ids) {
                spEquipmentGroupService.deletePhysicalById(id);
            }
        }
        return Result.success(null);
    }

    /**
     * 更新编组状态
     */
    @PostMapping("/update-status")
    @ResponseBody
    public Result updateStatus(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        String status = params.get("status");
        SpEquipmentGroup group = new SpEquipmentGroup();
        group.setId(id);
        group.setStatus(status);
        spEquipmentGroupService.updateById(group);
        return Result.success(null);
    }

    /**
     * 获取编组下的设备列表
     */
    @GetMapping("/equipment/list/{groupId}")
    @ResponseBody
    public Result getEquipmentList(@PathVariable String groupId) {
        QueryWrapper<GroupEquipmentRel> qw = new QueryWrapper<>();
        qw.eq("group_id", groupId);
        List<GroupEquipmentRel> rels = groupEquipmentRelService.list(qw);

        if (rels.isEmpty()) {
            return Result.success(Collections.emptyList());
        }

        List<String> equipmentIds = rels.stream()
                .map(GroupEquipmentRel::getEquipmentId)
                .collect(Collectors.toList());

        Collection<SpDevice> deviceCollection = spDeviceService.listByIds(equipmentIds);
        List<SpDevice> devices = new ArrayList<>(deviceCollection);

        List<Map<String, Object>> result = rels.stream().map(rel -> {
            SpDevice device = devices.stream()
                    .filter(d -> d.getId().equals(rel.getEquipmentId()))
                    .findFirst()
                    .orElse(null);
            Map<String, Object> item = new HashMap<>();
            item.put("id", rel.getId());
            item.put("groupId", rel.getGroupId());
            item.put("equipmentId", rel.getEquipmentId());
            item.put("remark", rel.getRemark());
            item.put("status", rel.getStatus());
            item.put("createTime", rel.getCreateTime());
            item.put("createUsername", rel.getCreateUsername());
            if (device != null) {
                item.put("equipmentCode", device.getCode());
                item.put("equipmentName", device.getName());
                item.put("equipmentStatus", device.getStatus());
                item.put("equipmentDescr", device.getDescr());
            }
            return item;
        }).collect(Collectors.toList());

        return Result.success(result);
    }

    /**
     * 获取未绑定的设备列表
     */
    @GetMapping("/equipment/available")
    @ResponseBody
    public Result getAvailableEquipments() {
        QueryWrapper<SpDevice> qw = new QueryWrapper<>();
        qw.eq("is_deleted", "0");
        qw.eq("status", "0"); // 只获取正常状态的设备
        List<SpDevice> allDevices = spDeviceService.list(qw);

        // 获取已绑定的设备ID
        QueryWrapper<GroupEquipmentRel> relQw = new QueryWrapper<>();
        List<GroupEquipmentRel> allRels = groupEquipmentRelService.list(relQw);
        List<String> boundEquipmentIds = allRels.stream()
                .map(GroupEquipmentRel::getEquipmentId)
                .collect(Collectors.toList());

        // 过滤掉已绑定的设备
        List<SpDevice> availableDevices = allDevices.stream()
                .filter(d -> !boundEquipmentIds.contains(d.getId()))
                .collect(Collectors.toList());

        return Result.success(availableDevices);
    }

    /**
     * 绑定设备到编组
     */
    @PostMapping("/equipment/add")
    @ResponseBody
    public Result addEquipment(@RequestBody Map<String, Object> params) {
        String groupId = (String) params.get("groupId");
        @SuppressWarnings("unchecked")
        List<String> equipmentIds = (List<String>) params.get("equipmentIds");
        String remark = (String) params.get("remark");

        if (equipmentIds != null) {
            for (String equipmentId : equipmentIds) {
                // 检查是否已存在关联
                QueryWrapper<GroupEquipmentRel> qw = new QueryWrapper<>();
                qw.eq("group_id", groupId);
                qw.eq("equipment_id", equipmentId);
                long count = groupEquipmentRelService.count(qw);
                if (count > 0) {
                    return Result.failure("该设备已在当前编组中，请勿重复添加");
                }
                
                GroupEquipmentRel rel = new GroupEquipmentRel();
                rel.setGroupId(groupId);
                rel.setEquipmentId(equipmentId);
                rel.setRemark(remark);
                groupEquipmentRelService.save(rel);
            }
        }
        return Result.success(null);
    }

    /**
     * 从编组移除设备
     */
    @PostMapping("/equipment/remove")
    @ResponseBody
    public Result removeEquipment(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        groupEquipmentRelService.deletePhysicalById(id);
        return Result.success(null);
    }

    /**
     * 更新绑定设备备注
     */
    @PostMapping("/equipment/update-remark")
    @ResponseBody
    public Result updateEquipmentRemark(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        String remark = params.get("remark");
        GroupEquipmentRel rel = new GroupEquipmentRel();
        rel.setId(id);
        rel.setRemark(remark);
        groupEquipmentRelService.updateById(rel);
        return Result.success(null);
    }

    /**
     * 更新绑定设备状态
     */
    @PostMapping("/equipment/update-status")
    @ResponseBody
    public Result updateEquipmentStatus(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        String status = params.get("status");
        GroupEquipmentRel rel = new GroupEquipmentRel();
        rel.setId(id);
        rel.setStatus(status);
        groupEquipmentRelService.updateById(rel);
        return Result.success(null);
    }
}
