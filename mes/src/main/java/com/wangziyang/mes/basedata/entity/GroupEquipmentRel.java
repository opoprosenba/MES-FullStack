package com.wangziyang.mes.basedata.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.wangziyang.mes.common.BaseEntity;

/**
 * 编组-设备关联实体
 *
 * @author SongPeng
 */
@TableName("sp_group_equipment_rel")
public class GroupEquipmentRel extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 编组ID
     */
    private String groupId;

    /**
     * 设备ID
     */
    private String equipmentId;

    /**
     * 备注信息
     */
    private String remark;

    /**
     * 状态 0-正常 1-禁用
     */
    private String status;

    /**
     * 逻辑删除标记
     */
    @TableField(value = "is_deleted")
    private String deleted;

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }
}
