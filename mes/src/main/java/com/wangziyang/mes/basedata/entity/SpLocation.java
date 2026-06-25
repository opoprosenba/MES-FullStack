package com.wangziyang.mes.basedata.entity;

import com.wangziyang.mes.common.BaseEntity;

/**
 * <p>
 * 库位实体
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
public class SpLocation extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String locCode;

    private String storeId;

    private String storeCode;

    private Integer groupNo;

    private Integer rowNo;

    private Integer layerNo;

    private Integer colNo;

    private String status;

    private String isDeleted;

    public String getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(String isDeleted) {
        this.isDeleted = isDeleted;
    }

    public void setDeleted(String deleted) {
        this.isDeleted = deleted;
    }

    public String getLocCode() {
        return locCode;
    }

    public void setLocCode(String locCode) {
        this.locCode = locCode;
    }

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
        this.storeId = storeId;
    }

    public String getStoreCode() {
        return storeCode;
    }

    public void setStoreCode(String storeCode) {
        this.storeCode = storeCode;
    }

    public Integer getGroupNo() {
        return groupNo;
    }

    public void setGroupNo(Integer groupNo) {
        this.groupNo = groupNo;
    }

    public Integer getRowNo() {
        return rowNo;
    }

    public void setRowNo(Integer rowNo) {
        this.rowNo = rowNo;
    }

    public Integer getLayerNo() {
        return layerNo;
    }

    public void setLayerNo(Integer layerNo) {
        this.layerNo = layerNo;
    }

    public Integer getColNo() {
        return colNo;
    }

    public void setColNo(Integer colNo) {
        this.colNo = colNo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SpLocation{" +
                "locCode='" + locCode + '\'' +
                ", storeId=" + storeId +
                ", storeCode='" + storeCode + '\'' +
                ", groupNo=" + groupNo +
                ", rowNo=" + rowNo +
                ", layerNo=" + layerNo +
                ", colNo=" + colNo +
                ", status='" + status + '\'' +
                '}';
    }
}