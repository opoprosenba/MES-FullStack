package com.wangziyang.mes.basedata.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.wangziyang.mes.common.BaseEntity;

/**
 * 设备编组实体
 *
 * @author SongPeng
 */
@TableName("sp_equipment_group")
public class SpEquipmentGroup extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 编组代码
     */
    private String code;

    /**
     * 编组名称
     */
    private String name;

    /**
     * 编组描述
     */
    private String descr;

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

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescr() { return descr; }
    public void setDescr(String descr) { this.descr = descr; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }
}
