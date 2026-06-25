package com.wangziyang.mes.basedata.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

@TableName("sp_process")
public class SpProcess implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String processCode;

    private String processName;

    private String workUnitId;

    private String workUnitName;

    private Integer workHour;

    private Integer manufactureCycle;

    private String isGeneratePlan;

    private String remark;

    private String processContent;

    private String processRequirement;

    private String processAttention;

    private String equipmentInfo;

    private String documentInfo;

    private String materialList;

    private String status;

    private Integer isDeleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT)
    private String createUsername;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateUsername;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProcessCode() {
        return processCode;
    }

    public void setProcessCode(String processCode) {
        this.processCode = processCode;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getWorkUnitId() {
        return workUnitId;
    }

    public void setWorkUnitId(String workUnitId) {
        this.workUnitId = workUnitId;
    }

    public String getWorkUnitName() {
        return workUnitName;
    }

    public void setWorkUnitName(String workUnitName) {
        this.workUnitName = workUnitName;
    }

    public Integer getWorkHour() {
        return workHour;
    }

    public void setWorkHour(Integer workHour) {
        this.workHour = workHour;
    }

    public Integer getManufactureCycle() {
        return manufactureCycle;
    }

    public void setManufactureCycle(Integer manufactureCycle) {
        this.manufactureCycle = manufactureCycle;
    }

    public String getIsGeneratePlan() {
        return isGeneratePlan;
    }

    public void setIsGeneratePlan(String isGeneratePlan) {
        this.isGeneratePlan = isGeneratePlan;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getProcessContent() {
        return processContent;
    }

    public void setProcessContent(String processContent) {
        this.processContent = processContent;
    }

    public String getProcessRequirement() {
        return processRequirement;
    }

    public void setProcessRequirement(String processRequirement) {
        this.processRequirement = processRequirement;
    }

    public String getProcessAttention() {
        return processAttention;
    }

    public void setProcessAttention(String processAttention) {
        this.processAttention = processAttention;
    }

    public String getEquipmentInfo() {
        return equipmentInfo;
    }

    public void setEquipmentInfo(String equipmentInfo) {
        this.equipmentInfo = equipmentInfo;
    }

    public String getDocumentInfo() {
        return documentInfo;
    }

    public void setDocumentInfo(String documentInfo) {
        this.documentInfo = documentInfo;
    }

    public String getMaterialList() {
        return materialList;
    }

    public void setMaterialList(String materialList) {
        this.materialList = materialList;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Integer isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getCreateUsername() {
        return createUsername;
    }

    public void setCreateUsername(String createUsername) {
        this.createUsername = createUsername;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public String getUpdateUsername() {
        return updateUsername;
    }

    public void setUpdateUsername(String updateUsername) {
        this.updateUsername = updateUsername;
    }
}
