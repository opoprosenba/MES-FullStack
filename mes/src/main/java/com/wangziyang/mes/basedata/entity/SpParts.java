package com.wangziyang.mes.basedata.entity;

import com.wangziyang.mes.common.BaseEntity;

/**
 * <p>
 * 零部件实体
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
public class SpParts extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String partCode;

    private String partName;

    /** 规格型号 */
    private String spec;

    /** 计量单位 */
    private String unit;

    /** 物料分类ID，关联 sp_parts_category */
    private Long categoryId;

    /** 物料类型：1自制件 2外购件 3外协件 */
    private Integer partsType;

    /** 零件图号 */
    private String drawingNo;

    /** 设计版本号 */
    private String version;

    /** 批次管理标识：0否 1是 */
    private Integer batchFlag;

    /** 安全库存值 */
    private java.math.BigDecimal safeStock;

    /** 备注说明 */
    private String remark;

    /** 状态：正常/禁用 */
    private String status;

    /** 逻辑删除：0未删除 1已删除（不使用@TableLogic，手动控制） */
    private String isDeleted;

    // ========== getters / setters ==========

    public String getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(String isDeleted) {
        this.isDeleted = isDeleted;
    }

    public void setDeleted(String deleted) {
        this.isDeleted = deleted;
    }

    public String getPartCode() {
        return partCode;
    }

    public void setPartCode(String partCode) {
        this.partCode = partCode;
    }

    public String getPartName() {
        return partName;
    }

    public void setPartName(String partName) {
        this.partName = partName;
    }

    public String getSpec() {
        return spec;
    }

    public void setSpec(String spec) {
        this.spec = spec;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getPartsType() {
        return partsType;
    }

    public void setPartsType(Integer partsType) {
        this.partsType = partsType;
    }

    public String getDrawingNo() {
        return drawingNo;
    }

    public void setDrawingNo(String drawingNo) {
        this.drawingNo = drawingNo;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Integer getBatchFlag() {
        return batchFlag;
    }

    public void setBatchFlag(Integer batchFlag) {
        this.batchFlag = batchFlag;
    }

    public java.math.BigDecimal getSafeStock() {
        return safeStock;
    }

    public void setSafeStock(java.math.BigDecimal safeStock) {
        this.safeStock = safeStock;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SpParts{" +
                "partCode='" + partCode + '\'' +
                ", partName='" + partName + '\'' +
                ", spec='" + spec + '\'' +
                ", unit='" + unit + '\'' +
                ", categoryId=" + categoryId +
                ", partsType=" + partsType +
                ", remark='" + remark + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}